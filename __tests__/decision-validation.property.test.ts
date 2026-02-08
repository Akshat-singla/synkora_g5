/**
 * Feature: synkora-transformation
 * Property 7: Required Decision Fields Validation
 * Property 9: Decision Status Values
 * 
 * Property 7: For any Decision Record creation attempt, the system SHALL require all of the
 * following fields: Title, Context, Decision, Rationale, Consequences, and Status, and SHALL
 * reject creation attempts missing any required field.
 * 
 * Property 9: For any Decision Record, the status field SHALL only accept the values: Proposed,
 * Accepted, Deprecated, or Superseded, and SHALL reject any other status values.
 * 
 * Validates: Requirements 3.2, 3.5
 */

import * as fc from 'fast-check';
import {
    validateDecisionFields,
    validateDecisionStatus,
    createDecision,
} from '@/lib/decision-service';
import { prisma } from '@/lib/prisma';
import { CreateDecisionInput, DecisionStatus } from '@/types/decision';

describe('Property 7: Required Decision Fields Validation', () => {
    let testProjectId: string;
    let testUserId: string;

    beforeAll(async () => {
        try {
            // Create test user
            testUserId = `test-user-${Date.now()}`;
            await prisma.user.create({
                data: {
                    id: testUserId,
                    email: `test-${Date.now()}@example.com`,
                    name: 'Test User',
                },
            });

            // Create test project
            testProjectId = `test-project-${Date.now()}`;
            await prisma.project.create({
                data: {
                    id: testProjectId,
                    name: 'Test Project',
                    createdById: testUserId,
                },
            });
        } catch (error) {
            console.error('beforeAll setup failed:', error);
            throw error;
        }
    }, 30000);

    afterAll(async () => {
        try {
            // Clean up test data
            await prisma.decisionRecord.deleteMany({
                where: { projectId: testProjectId },
            });
            await prisma.project.delete({
                where: { id: testProjectId },
            });
            await prisma.user.delete({
                where: { id: testUserId },
            });
        } catch (error) {
            console.error('afterAll cleanup failed:', error);
        }
    }, 30000);

    afterEach(async () => {
        // Clean up decisions after each test
        await prisma.decisionRecord.deleteMany({
            where: { projectId: testProjectId },
        });
    });

    const requiredFields = ['title', 'context', 'decision', 'rationale', 'consequences'];

    test('validateDecisionFields accepts complete input', () => {
        const completeInput: Partial<CreateDecisionInput> = {
            title: 'Test Decision',
            context: 'Test context',
            decision: 'Test decision',
            rationale: 'Test rationale',
            consequences: 'Test consequences',
        };

        const result = validateDecisionFields(completeInput);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('validateDecisionFields rejects empty input', () => {
        const result = validateDecisionFields({});
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBe(requiredFields.length);
    });

    test('property-based: all required fields must be present', () => {
        const validStringGenerator = fc.string({ minLength: 1, maxLength: 100 });

        fc.assert(
            fc.property(
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                (title, context, decision, rationale, consequences) => {
                    const input: Partial<CreateDecisionInput> = {
                        title,
                        context,
                        decision,
                        rationale,
                        consequences,
                    };

                    const result = validateDecisionFields(input);
                    expect(result.valid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: missing any required field causes validation failure', () => {
        const validStringGenerator = fc.string({ minLength: 1, maxLength: 100 });

        fc.assert(
            fc.property(
                fc.constantFrom(...requiredFields),
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                (missingField, title, context, decision, rationale, consequences) => {
                    const input: any = {
                        title,
                        context,
                        decision,
                        rationale,
                        consequences,
                    };

                    // Remove the field to test
                    delete input[missingField];

                    const result = validateDecisionFields(input);
                    expect(result.valid).toBe(false);
                    expect(result.errors.length).toBeGreaterThan(0);
                    expect(result.errors.some((e) => e.field === missingField)).toBe(true);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: empty strings are treated as missing fields', () => {
        const validStringGenerator = fc.string({ minLength: 1, maxLength: 100 });

        fc.assert(
            fc.property(
                fc.constantFrom(...requiredFields),
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                (emptyField, title, context, decision, rationale, consequences) => {
                    const input: any = {
                        title,
                        context,
                        decision,
                        rationale,
                        consequences,
                    };

                    // Set the field to empty string
                    input[emptyField] = '';

                    const result = validateDecisionFields(input);
                    expect(result.valid).toBe(false);
                    expect(result.errors.some((e) => e.field === emptyField)).toBe(true);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: whitespace-only strings are treated as missing fields', () => {
        const validStringGenerator = fc.string({ minLength: 1, maxLength: 100 });
        const whitespaceGenerator = fc.constantFrom('   ', '\t', '\n', '  \t\n  ');

        fc.assert(
            fc.property(
                fc.constantFrom(...requiredFields),
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                whitespaceGenerator,
                (
                    whitespaceField,
                    title,
                    context,
                    decision,
                    rationale,
                    consequences,
                    whitespace
                ) => {
                    const input: any = {
                        title,
                        context,
                        decision,
                        rationale,
                        consequences,
                    };

                    // Set the field to whitespace
                    input[whitespaceField] = whitespace;

                    const result = validateDecisionFields(input);
                    expect(result.valid).toBe(false);
                    expect(result.errors.some((e) => e.field === whitespaceField)).toBe(true);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: createDecision rejects incomplete input', async () => {
        const validStringGenerator = fc.string({ minLength: 1, maxLength: 100 });

        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom(...requiredFields),
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                async (missingField, title, context, decision, rationale, consequences) => {
                    const input: any = {
                        projectId: testProjectId,
                        title,
                        context,
                        decision,
                        rationale,
                        consequences,
                        createdBy: testUserId,
                    };

                    // Remove the field to test
                    delete input[missingField];

                    await expect(createDecision(input)).rejects.toThrow(/Validation failed/);
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );
    }, 60000);

    test('property-based: createDecision accepts complete input', async () => {
        const validStringGenerator = fc.string({ minLength: 1, maxLength: 200 });

        await fc.assert(
            fc.asyncProperty(
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                validStringGenerator,
                async (title, context, decision, rationale, consequences) => {
                    const input: CreateDecisionInput = {
                        projectId: testProjectId,
                        title,
                        context,
                        decision,
                        rationale,
                        consequences,
                        createdBy: testUserId,
                    };

                    const created = await createDecision(input);
                    expect(created.id).toBeDefined();
                    expect(created.title).toBe(title);
                    expect(created.context).toBe(context);
                    expect(created.decision).toBe(decision);
                    expect(created.rationale).toBe(rationale);
                    expect(created.consequences).toBe(consequences);

                    // Clean up
                    await prisma.decisionRecord.delete({
                        where: { id: created.id },
                    });
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );
    }, 60000);
});

describe('Property 9: Decision Status Values', () => {
    const validStatuses: DecisionStatus[] = ['PROPOSED', 'ACCEPTED', 'DEPRECATED', 'SUPERSEDED'];
    const invalidStatuses = [
        'PENDING',
        'REJECTED',
        'APPROVED',
        'CANCELLED',
        'IN_PROGRESS',
        'COMPLETED',
        'proposed',
        'accepted',
        '',
        'UNKNOWN',
    ];

    test('validateDecisionStatus accepts all valid status values', () => {
        validStatuses.forEach((status) => {
            expect(validateDecisionStatus(status)).toBe(true);
        });
    });

    test('validateDecisionStatus rejects all invalid status values', () => {
        invalidStatuses.forEach((status) => {
            expect(validateDecisionStatus(status)).toBe(false);
        });
    });

    test('property-based: only valid statuses are accepted', () => {
        fc.assert(
            fc.property(fc.constantFrom(...validStatuses), (status) => {
                expect(validateDecisionStatus(status)).toBe(true);
            }),
            { numRuns: 20 }
        );
    });

    test('property-based: invalid statuses are rejected', () => {
        fc.assert(
            fc.property(fc.constantFrom(...invalidStatuses), (status) => {
                expect(validateDecisionStatus(status)).toBe(false);
            }),
            { numRuns: 20 }
        );
    });

    test('property-based: random strings are rejected as status', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }).filter(
                    (s) => !validStatuses.includes(s as DecisionStatus)
                ),
                (randomStatus) => {
                    expect(validateDecisionStatus(randomStatus)).toBe(false);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: status validation is case-sensitive', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...validStatuses),
                fc.constantFrom('lower', 'mixed'),
                (status, caseType) => {
                    let transformedStatus = status;
                    if (caseType === 'lower') {
                        transformedStatus = status.toLowerCase() as DecisionStatus;
                    } else if (caseType === 'mixed') {
                        transformedStatus = (status.charAt(0) +
                            status.slice(1).toLowerCase()) as DecisionStatus;
                    }

                    // Only uppercase versions should be valid
                    if (transformedStatus !== status) {
                        expect(validateDecisionStatus(transformedStatus)).toBe(false);
                    }
                }
            ),
            { numRuns: 20 }
        );
    });

    test('default status is PROPOSED', async () => {
        const testUserId = `test-user-status-${Date.now()}`;
        await prisma.user.create({
            data: {
                id: testUserId,
                email: `test-status-${Date.now()}@example.com`,
                name: 'Test User',
            },
        });

        const testProjectId = `test-project-status-${Date.now()}`;
        await prisma.project.create({
            data: {
                id: testProjectId,
                name: 'Test Project',
                createdById: testUserId,
            },
        });

        const input: CreateDecisionInput = {
            projectId: testProjectId,
            title: 'Test Decision',
            context: 'Test context',
            decision: 'Test decision',
            rationale: 'Test rationale',
            consequences: 'Test consequences',
            createdBy: testUserId,
            // No status provided
        };

        const created = await createDecision(input);
        expect(created.status).toBe('PROPOSED');

        // Clean up
        await prisma.decisionRecord.delete({
            where: { id: created.id },
        });
        await prisma.project.delete({
            where: { id: testProjectId },
        });
        await prisma.user.delete({
            where: { id: testUserId },
        });
    });

    test('property-based: createDecision rejects invalid status', async () => {
        const testUserId = `test-user-invalid-${Date.now()}`;
        await prisma.user.create({
            data: {
                id: testUserId,
                email: `test-invalid-${Date.now()}@example.com`,
                name: 'Test User',
            },
        });

        const testProjectId = `test-project-invalid-${Date.now()}`;
        await prisma.project.create({
            data: {
                id: testProjectId,
                name: 'Test Project',
                createdById: testUserId,
            },
        });

        await fc.assert(
            fc.asyncProperty(fc.constantFrom(...invalidStatuses), async (invalidStatus) => {
                const input: any = {
                    projectId: testProjectId,
                    title: 'Test Decision',
                    context: 'Test context',
                    decision: 'Test decision',
                    rationale: 'Test rationale',
                    consequences: 'Test consequences',
                    createdBy: testUserId,
                    status: invalidStatus,
                };

                await expect(createDecision(input)).rejects.toThrow(/Invalid status/);
            }),
            { numRuns: 10, timeout: 30000 }
        );

        // Clean up
        await prisma.project.delete({
            where: { id: testProjectId },
        });
        await prisma.user.delete({
            where: { id: testUserId },
        });
    }, 60000);
});
