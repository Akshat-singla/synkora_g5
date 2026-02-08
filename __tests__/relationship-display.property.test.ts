/**
 * Feature: synkora-transformation
 * Property 4: Relationship Display Completeness
 * 
 * For any entity view (Component, Decision Record, or System Knowledge artifact), when that
 * entity has linked relationships to other entities, all linked entities SHALL appear in the
 * view with their basic information.
 * 
 * Validates: Requirements 2.4, 3.4, 4.5, 5.5, 7.4
 */

import * as fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { generateComponentId } from '@/lib/architecture-service';
import { createDecision, linkToComponent } from '@/lib/decision-service';
import { CreateDecisionInput } from '@/types/decision';

describe('Property 4: Relationship Display Completeness', () => {
    let testProjectId: string;
    let testUserId: string;
    let testCanvasId: string;

    beforeAll(async () => {
        try {
            // Create test user
            testUserId = `test-user-rel-${Date.now()}`;
            await prisma.user.create({
                data: {
                    id: testUserId,
                    email: `test-rel-${Date.now()}@example.com`,
                    name: 'Test User',
                },
            });

            // Create test project
            testProjectId = `test-project-rel-${Date.now()}`;
            await prisma.project.create({
                data: {
                    id: testProjectId,
                    name: 'Test Project',
                    createdById: testUserId,
                },
            });

            // Create test canvas
            testCanvasId = `test-canvas-rel-${Date.now()}`;
            await prisma.canvas.create({
                data: {
                    id: testCanvasId,
                    projectId: testProjectId,
                    state: {},
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
            await prisma.componentDecision.deleteMany({
                where: {
                    decision: {
                        projectId: testProjectId,
                    },
                },
            });
            await prisma.decisionRecord.deleteMany({
                where: { projectId: testProjectId },
            });
            await prisma.component.deleteMany({
                where: { canvasId: testCanvasId },
            });
            await prisma.canvas.delete({
                where: { id: testCanvasId },
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
        // Clean up after each test
        await prisma.componentDecision.deleteMany({
            where: {
                decision: {
                    projectId: testProjectId,
                },
            },
        });
        await prisma.decisionRecord.deleteMany({
            where: { projectId: testProjectId },
        });
        await prisma.component.deleteMany({
            where: { canvasId: testCanvasId },
        });
    });

    test('component view displays all linked decisions', async () => {
        // Create a component
        const component = await prisma.component.create({
            data: {
                componentId: generateComponentId(),
                canvasId: testCanvasId,
                name: 'Test Component',
                type: 'service',
                position: { x: 100, y: 100 },
                metadata: {},
            },
        });

        // Create multiple decisions
        const decisions = await Promise.all([
            createDecision({
                projectId: testProjectId,
                title: 'Decision 1',
                context: 'Context 1',
                decision: 'Decision 1',
                rationale: 'Rationale 1',
                consequences: 'Consequences 1',
                createdBy: testUserId,
            }),
            createDecision({
                projectId: testProjectId,
                title: 'Decision 2',
                context: 'Context 2',
                decision: 'Decision 2',
                rationale: 'Rationale 2',
                consequences: 'Consequences 2',
                createdBy: testUserId,
            }),
            createDecision({
                projectId: testProjectId,
                title: 'Decision 3',
                context: 'Context 3',
                decision: 'Decision 3',
                rationale: 'Rationale 3',
                consequences: 'Consequences 3',
                createdBy: testUserId,
            }),
        ]);

        // Link all decisions to the component
        await Promise.all(
            decisions.map((decision) => linkToComponent(decision.id, component.id))
        );

        // Fetch component with relationships
        const componentWithRelations = await prisma.component.findUnique({
            where: { id: component.id },
            include: {
                decisionComponents: {
                    include: {
                        decision: true,
                    },
                },
            },
        });

        // Verify all decisions are displayed
        expect(componentWithRelations?.decisionComponents.length).toBe(decisions.length);

        const linkedDecisionIds = componentWithRelations?.decisionComponents.map(
            (dc) => dc.decision.id
        );

        decisions.forEach((decision) => {
            expect(linkedDecisionIds).toContain(decision.id);
        });

        // Verify basic information is present
        componentWithRelations?.decisionComponents.forEach((dc) => {
            expect(dc.decision.title).toBeDefined();
            expect(dc.decision.status).toBeDefined();
            expect(dc.decision.createdAt).toBeDefined();
        });
    });

    test('property-based: component view shows all linked decisions', async () => {
        const decisionGenerator = fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
            context: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        });

        await fc.assert(
            fc.asyncProperty(
                fc.array(decisionGenerator, { minLength: 1, maxLength: 10 }),
                async (decisionInputs) => {
                    // Create a component
                    const component = await prisma.component.create({
                        data: {
                            componentId: generateComponentId(),
                            canvasId: testCanvasId,
                            name: 'Test Component',
                            type: 'service',
                            position: { x: 100, y: 100 },
                            metadata: {},
                        },
                    });

                    // Create decisions
                    const decisions = await Promise.all(
                        decisionInputs.map((input) =>
                            createDecision({
                                projectId: testProjectId,
                                title: input.title,
                                context: input.context,
                                decision: 'Test decision',
                                rationale: 'Test rationale',
                                consequences: 'Test consequences',
                                createdBy: testUserId,
                            })
                        )
                    );

                    // Link all decisions to the component
                    await Promise.all(
                        decisions.map((decision) => linkToComponent(decision.id, component.id))
                    );

                    // Fetch component with relationships
                    const componentWithRelations = await prisma.component.findUnique({
                        where: { id: component.id },
                        include: {
                            decisionComponents: {
                                include: {
                                    decision: true,
                                },
                            },
                        },
                    });

                    // Property: All linked decisions must appear in the view
                    expect(componentWithRelations?.decisionComponents.length).toBe(decisions.length);

                    const linkedDecisionIds = componentWithRelations?.decisionComponents.map(
                        (dc) => dc.decision.id
                    );

                    decisions.forEach((decision) => {
                        expect(linkedDecisionIds).toContain(decision.id);
                    });

                    // Property: Basic information must be present for each decision
                    componentWithRelations?.decisionComponents.forEach((dc) => {
                        expect(dc.decision.title).toBeDefined();
                        expect(dc.decision.title.length).toBeGreaterThan(0);
                        expect(dc.decision.status).toBeDefined();
                        expect(dc.decision.createdAt).toBeDefined();
                    });

                    // Clean up
                    await prisma.componentDecision.deleteMany({
                        where: { componentId: component.id },
                    });
                    await prisma.decisionRecord.deleteMany({
                        where: { id: { in: decisions.map((d) => d.id) } },
                    });
                    await prisma.component.delete({
                        where: { id: component.id },
                    });
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );
    }, 60000);

    test('property-based: decision view shows all linked components', async () => {
        const componentGenerator = fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
            type: fc.constantFrom('service', 'library', 'database', 'external', 'ui'),
        });

        await fc.assert(
            fc.asyncProperty(
                fc.array(componentGenerator, { minLength: 1, maxLength: 10 }),
                async (componentInputs) => {
                    // Create components
                    const components = await Promise.all(
                        componentInputs.map((input) =>
                            prisma.component.create({
                                data: {
                                    componentId: generateComponentId(),
                                    canvasId: testCanvasId,
                                    name: input.name,
                                    type: input.type,
                                    position: { x: 100, y: 100 },
                                    metadata: {},
                                },
                            })
                        )
                    );

                    // Create a decision
                    const decision = await createDecision({
                        projectId: testProjectId,
                        title: 'Test Decision',
                        context: 'Test context',
                        decision: 'Test decision',
                        rationale: 'Test rationale',
                        consequences: 'Test consequences',
                        createdBy: testUserId,
                    });

                    // Link all components to the decision
                    await Promise.all(
                        components.map((component) => linkToComponent(decision.id, component.id))
                    );

                    // Fetch decision with relationships
                    const decisionWithRelations = await prisma.decisionRecord.findUnique({
                        where: { id: decision.id },
                        include: {
                            componentDecisions: {
                                include: {
                                    component: true,
                                },
                            },
                        },
                    });

                    // Property: All linked components must appear in the view
                    expect(decisionWithRelations?.componentDecisions.length).toBe(components.length);

                    const linkedComponentIds = decisionWithRelations?.componentDecisions.map(
                        (cd) => cd.component.id
                    );

                    components.forEach((component) => {
                        expect(linkedComponentIds).toContain(component.id);
                    });

                    // Property: Basic information must be present for each component
                    decisionWithRelations?.componentDecisions.forEach((cd) => {
                        expect(cd.component.name).toBeDefined();
                        expect(cd.component.name.length).toBeGreaterThan(0);
                        expect(cd.component.type).toBeDefined();
                        expect(cd.component.componentId).toBeDefined();
                    });

                    // Clean up
                    await prisma.componentDecision.deleteMany({
                        where: { decisionId: decision.id },
                    });
                    await prisma.decisionRecord.delete({
                        where: { id: decision.id },
                    });
                    await prisma.component.deleteMany({
                        where: { id: { in: components.map((c) => c.id) } },
                    });
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );
    }, 60000);

    test('property-based: API endpoint returns all relationships', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 0, max: 5 }),
                async (numDecisions) => {
                    // Create a component
                    const component = await prisma.component.create({
                        data: {
                            componentId: generateComponentId(),
                            canvasId: testCanvasId,
                            name: 'Test Component',
                            type: 'service',
                            position: { x: 100, y: 100 },
                            metadata: {},
                        },
                    });

                    // Create decisions
                    const decisions = await Promise.all(
                        Array.from({ length: numDecisions }, (_, i) =>
                            createDecision({
                                projectId: testProjectId,
                                title: `Decision ${i}`,
                                context: `Context ${i}`,
                                decision: `Decision ${i}`,
                                rationale: `Rationale ${i}`,
                                consequences: `Consequences ${i}`,
                                createdBy: testUserId,
                            })
                        )
                    );

                    // Link all decisions to the component
                    await Promise.all(
                        decisions.map((decision) => linkToComponent(decision.id, component.id))
                    );

                    // Simulate API call by fetching component with relationships
                    const componentWithRelations = await prisma.component.findUnique({
                        where: { id: component.id },
                        include: {
                            decisionComponents: {
                                include: {
                                    decision: true,
                                },
                            },
                        },
                    });

                    // Property: API response must include all relationships
                    expect(componentWithRelations?.decisionComponents.length).toBe(numDecisions);

                    // Property: Each relationship must have complete basic information
                    componentWithRelations?.decisionComponents.forEach((dc) => {
                        expect(dc.decision.id).toBeDefined();
                        expect(dc.decision.title).toBeDefined();
                        expect(dc.decision.status).toBeDefined();
                        expect(dc.decision.createdAt).toBeDefined();
                    });

                    // Clean up
                    await prisma.componentDecision.deleteMany({
                        where: { componentId: component.id },
                    });
                    await prisma.decisionRecord.deleteMany({
                        where: { id: { in: decisions.map((d) => d.id) } },
                    });
                    await prisma.component.delete({
                        where: { id: component.id },
                    });
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );
    }, 60000);

    test('empty relationships are handled correctly', async () => {
        // Create a component with no relationships
        const component = await prisma.component.create({
            data: {
                componentId: generateComponentId(),
                canvasId: testCanvasId,
                name: 'Isolated Component',
                type: 'service',
                position: { x: 100, y: 100 },
                metadata: {},
            },
        });

        // Fetch component with relationships
        const componentWithRelations = await prisma.component.findUnique({
            where: { id: component.id },
            include: {
                decisionComponents: {
                    include: {
                        decision: true,
                    },
                },
            },
        });

        // Property: Empty relationships should return empty array, not null/undefined
        expect(componentWithRelations?.decisionComponents).toBeDefined();
        expect(Array.isArray(componentWithRelations?.decisionComponents)).toBe(true);
        expect(componentWithRelations?.decisionComponents.length).toBe(0);
    });

    test('relationship display includes timestamps', async () => {
        const component = await prisma.component.create({
            data: {
                componentId: generateComponentId(),
                canvasId: testCanvasId,
                name: 'Test Component',
                type: 'service',
                position: { x: 100, y: 100 },
                metadata: {},
            },
        });

        const decision = await createDecision({
            projectId: testProjectId,
            title: 'Test Decision',
            context: 'Test context',
            decision: 'Test decision',
            rationale: 'Test rationale',
            consequences: 'Test consequences',
            createdBy: testUserId,
        });

        await linkToComponent(decision.id, component.id);

        const componentWithRelations = await prisma.component.findUnique({
            where: { id: component.id },
            include: {
                decisionComponents: {
                    include: {
                        decision: true,
                    },
                },
            },
        });

        // Property: Relationship display must include creation timestamps
        componentWithRelations?.decisionComponents.forEach((dc) => {
            expect(dc.decision.createdAt).toBeDefined();
            expect(dc.decision.createdAt).toBeInstanceOf(Date);
            expect(dc.linkedAt).toBeDefined();
            expect(dc.linkedAt).toBeInstanceOf(Date);
        });
    });
});
