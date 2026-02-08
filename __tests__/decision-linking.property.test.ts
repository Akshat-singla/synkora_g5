/**
 * Feature: synkora-transformation
 * Property 8: Component-Decision Linking
 * Property 10: Decision Supersession Chain Integrity
 * 
 * Property 8: For any Decision Record and any Component, the system SHALL support creating
 * a bidirectional link between them, and both entities SHALL reflect this relationship in
 * their respective views.
 * 
 * Property 10: For any Decision Record that is marked as superseded, the system SHALL maintain
 * a bidirectional link to the superseding Decision Record, such that navigating from either
 * decision leads to the other.
 * 
 * Validates: Requirements 3.3, 3.6
 */

import * as fc from 'fast-check';
import {
    createDecision,
    linkToComponent,
    unlinkFromComponent,
    getDecisionById,
    getDecisionsByComponent,
    supersede,
    getSupersessionChain,
} from '@/lib/decision-service';
import { generateComponentId } from '@/lib/architecture-service';
import { prisma } from '@/lib/prisma';
import { CreateDecisionInput } from '@/types/decision';

describe('Property 8: Component-Decision Linking', () => {
    let testProjectId: string;
    let testUserId: string;
    let testCanvasId: string;

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

            // Create test canvas
            testCanvasId = `test-canvas-${Date.now()}`;
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

    test('linkToComponent creates bidirectional link', async () => {
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

        // Create a decision
        const input: CreateDecisionInput = {
            projectId: testProjectId,
            title: 'Test Decision',
            context: 'Test context',
            decision: 'Test decision',
            rationale: 'Test rationale',
            consequences: 'Test consequences',
            createdBy: testUserId,
        };

        const decision = await createDecision(input);

        // Link them
        await linkToComponent(decision.id, component.id);

        // Verify bidirectional link
        const decisionWithLinks = await getDecisionById(decision.id);
        expect(decisionWithLinks.linkedComponentIds).toContain(component.id);

        const decisionsForComponent = await getDecisionsByComponent(component.id);
        expect(decisionsForComponent.some((d) => d.id === decision.id)).toBe(true);
    });

    test('property-based: linking multiple components to one decision', async () => {
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

                    // Verify all links exist
                    const decisionWithLinks = await getDecisionById(decision.id);
                    expect(decisionWithLinks.linkedComponentIds?.length).toBe(components.length);

                    components.forEach((component) => {
                        expect(decisionWithLinks.linkedComponentIds).toContain(component.id);
                    });

                    // Verify reverse links
                    for (const component of components) {
                        const decisions = await getDecisionsByComponent(component.id);
                        expect(decisions.some((d) => d.id === decision.id)).toBe(true);
                    }

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

    test('property-based: linking multiple decisions to one component', async () => {
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

                    // Verify all links exist from component side
                    const decisionsForComponent = await getDecisionsByComponent(component.id);
                    expect(decisionsForComponent.length).toBe(decisions.length);

                    decisions.forEach((decision) => {
                        expect(decisionsForComponent.some((d) => d.id === decision.id)).toBe(true);
                    });

                    // Verify all links exist from decision side
                    for (const decision of decisions) {
                        const decisionWithLinks = await getDecisionById(decision.id);
                        expect(decisionWithLinks.linkedComponentIds).toContain(component.id);
                    }

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

    test('property-based: unlinking removes bidirectional link', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 1, max: 5 }),
                async (numComponents) => {
                    // Create components
                    const components = await Promise.all(
                        Array.from({ length: numComponents }, () =>
                            prisma.component.create({
                                data: {
                                    componentId: generateComponentId(),
                                    canvasId: testCanvasId,
                                    name: 'Test Component',
                                    type: 'service',
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

                    // Link all components
                    await Promise.all(
                        components.map((component) => linkToComponent(decision.id, component.id))
                    );

                    // Unlink one component
                    const componentToUnlink = components[0];
                    await unlinkFromComponent(decision.id, componentToUnlink.id);

                    // Verify link is removed from decision side
                    const decisionWithLinks = await getDecisionById(decision.id);
                    expect(decisionWithLinks.linkedComponentIds).not.toContain(componentToUnlink.id);

                    // Verify link is removed from component side
                    const decisionsForComponent = await getDecisionsByComponent(componentToUnlink.id);
                    expect(decisionsForComponent.some((d) => d.id === decision.id)).toBe(false);

                    // Verify other links still exist
                    for (let i = 1; i < components.length; i++) {
                        expect(decisionWithLinks.linkedComponentIds).toContain(components[i].id);
                    }

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

    test('duplicate links are handled gracefully', async () => {
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

        // Link twice
        await linkToComponent(decision.id, component.id);
        await linkToComponent(decision.id, component.id); // Should not throw

        // Verify only one link exists
        const links = await prisma.componentDecision.findMany({
            where: {
                decisionId: decision.id,
                componentId: component.id,
            },
        });

        expect(links.length).toBe(1);
    });
});

describe('Property 10: Decision Supersession Chain Integrity', () => {
    let testProjectId: string;
    let testUserId: string;

    beforeAll(async () => {
        try {
            // Create test user
            testUserId = `test-user-super-${Date.now()}`;
            await prisma.user.create({
                data: {
                    id: testUserId,
                    email: `test-super-${Date.now()}@example.com`,
                    name: 'Test User',
                },
            });

            // Create test project
            testProjectId = `test-project-super-${Date.now()}`;
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
        // Clean up after each test
        await prisma.decisionRecord.deleteMany({
            where: { projectId: testProjectId },
        });
    });

    test('supersede creates bidirectional link', async () => {
        // Create two decisions
        const oldDecision = await createDecision({
            projectId: testProjectId,
            title: 'Old Decision',
            context: 'Old context',
            decision: 'Old decision',
            rationale: 'Old rationale',
            consequences: 'Old consequences',
            createdBy: testUserId,
        });

        const newDecision = await createDecision({
            projectId: testProjectId,
            title: 'New Decision',
            context: 'New context',
            decision: 'New decision',
            rationale: 'New rationale',
            consequences: 'New consequences',
            createdBy: testUserId,
        });

        // Supersede old with new
        await supersede({ oldDecisionId: oldDecision.id, newDecisionId: newDecision.id });

        // Verify bidirectional link
        const oldDecisionUpdated = await getDecisionById(oldDecision.id);
        expect(oldDecisionUpdated.status).toBe('SUPERSEDED');
        expect(oldDecisionUpdated.supersededBy).toBe(newDecision.id);

        const newDecisionUpdated = await getDecisionById(newDecision.id);
        expect(newDecisionUpdated.supersedes).toBe(oldDecision.id);
    });

    test('property-based: supersession chain maintains integrity', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 2, max: 5 }),
                async (chainLength) => {
                    // Create a chain of decisions
                    const decisions = await Promise.all(
                        Array.from({ length: chainLength }, (_, i) =>
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

                    // Create supersession chain
                    for (let i = 0; i < decisions.length - 1; i++) {
                        await supersede({
                            oldDecisionId: decisions[i].id,
                            newDecisionId: decisions[i + 1].id,
                        });
                    }

                    // Verify chain integrity
                    for (let i = 0; i < decisions.length - 1; i++) {
                        const decision = await getDecisionById(decisions[i].id);
                        expect(decision.status).toBe('SUPERSEDED');
                        expect(decision.supersededBy).toBe(decisions[i + 1].id);
                    }

                    // Verify last decision is not superseded
                    const lastDecision = await getDecisionById(decisions[decisions.length - 1].id);
                    expect(lastDecision.status).not.toBe('SUPERSEDED');
                    expect(lastDecision.supersededBy).toBeNull();

                    // Verify supersession chain
                    const chain = await getSupersessionChain(decisions[0].id);
                    expect(chain.length).toBe(chainLength);
                    expect(chain[0].id).toBe(decisions[0].id);
                    expect(chain[chain.length - 1].id).toBe(decisions[decisions.length - 1].id);

                    // Clean up
                    await prisma.decisionRecord.deleteMany({
                        where: { id: { in: decisions.map((d) => d.id) } },
                    });
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );
    }, 60000);

    test('property-based: cannot create circular supersession', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 2, max: 4 }),
                async (chainLength) => {
                    // Create decisions
                    const decisions = await Promise.all(
                        Array.from({ length: chainLength }, (_, i) =>
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

                    // Create a chain
                    for (let i = 0; i < decisions.length - 1; i++) {
                        await supersede({
                            oldDecisionId: decisions[i].id,
                            newDecisionId: decisions[i + 1].id,
                        });
                    }

                    // Try to create a cycle (should fail)
                    await expect(
                        supersede({
                            oldDecisionId: decisions[decisions.length - 1].id,
                            newDecisionId: decisions[0].id,
                        })
                    ).rejects.toThrow(/cycle/i);

                    // Clean up
                    await prisma.decisionRecord.deleteMany({
                        where: { id: { in: decisions.map((d) => d.id) } },
                    });
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );
    }, 60000);

    test('cannot supersede with self', async () => {
        const decision = await createDecision({
            projectId: testProjectId,
            title: 'Test Decision',
            context: 'Test context',
            decision: 'Test decision',
            rationale: 'Test rationale',
            consequences: 'Test consequences',
            createdBy: testUserId,
        });

        await expect(
            supersede({ oldDecisionId: decision.id, newDecisionId: decision.id })
        ).rejects.toThrow(/cannot supersede itself/i);
    });

    test('cannot use superseded decision to supersede another', async () => {
        const decision1 = await createDecision({
            projectId: testProjectId,
            title: 'Decision 1',
            context: 'Context 1',
            decision: 'Decision 1',
            rationale: 'Rationale 1',
            consequences: 'Consequences 1',
            createdBy: testUserId,
        });

        const decision2 = await createDecision({
            projectId: testProjectId,
            title: 'Decision 2',
            context: 'Context 2',
            decision: 'Decision 2',
            rationale: 'Rationale 2',
            consequences: 'Consequences 2',
            createdBy: testUserId,
        });

        const decision3 = await createDecision({
            projectId: testProjectId,
            title: 'Decision 3',
            context: 'Context 3',
            decision: 'Decision 3',
            rationale: 'Rationale 3',
            consequences: 'Consequences 3',
            createdBy: testUserId,
        });

        // Supersede decision1 with decision2
        await supersede({ oldDecisionId: decision1.id, newDecisionId: decision2.id });

        // Try to use decision2 (now superseded) to supersede decision3 (should fail)
        await expect(
            supersede({ oldDecisionId: decision3.id, newDecisionId: decision2.id })
        ).rejects.toThrow(/superseded decision/i);
    });
});
