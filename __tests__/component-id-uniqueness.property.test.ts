/**
 * Feature: synkora-transformation
 * Property 2: Component ID Uniqueness
 * 
 * For any set of components created in the system, each component SHALL have a unique
 * Component ID, and no two components SHALL share the same ID.
 * 
 * Validates: Requirements 2.3
 */

import * as fc from 'fast-check';
import { generateComponentId, componentIdExists } from '@/lib/architecture-service';
import { prisma } from '@/lib/prisma';

describe('Property 2: Component ID Uniqueness', () => {
    let testCanvasId: string;
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
    }, 30000); // Increase timeout for setup

    afterAll(async () => {
        try {
            // Clean up test data
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
    }, 30000); // Increase timeout for cleanup

    afterEach(async () => {
        // Clean up components after each test
        await prisma.component.deleteMany({
            where: { canvasId: testCanvasId },
        });
    });

    test('generateComponentId produces unique IDs', () => {
        const ids = new Set<string>();
        const count = 1000;

        for (let i = 0; i < count; i++) {
            const id = generateComponentId();
            expect(ids.has(id)).toBe(false);
            ids.add(id);
        }

        expect(ids.size).toBe(count);
    });

    test('property-based: all created components have unique Component IDs', async () => {
        // Generator for component data
        const componentGenerator = fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom('service', 'library', 'database', 'external', 'ui'),
            description: fc.option(fc.string({ maxLength: 200 })),
            position: fc.record({
                x: fc.integer({ min: 0, max: 10000 }),
                y: fc.integer({ min: 0, max: 10000 }),
            }),
        });

        await fc.assert(
            fc.asyncProperty(
                fc.array(componentGenerator, { minLength: 2, maxLength: 20 }),
                async (componentInputs) => {
                    // Create components
                    const createdComponents = await Promise.all(
                        componentInputs.map((input) =>
                            prisma.component.create({
                                data: {
                                    componentId: generateComponentId(),
                                    canvasId: testCanvasId,
                                    name: input.name,
                                    type: input.type,
                                    description: input.description || undefined,
                                    position: input.position,
                                    metadata: {},
                                },
                            })
                        )
                    );

                    // Extract Component IDs
                    const componentIds = createdComponents.map((c) => c.componentId);

                    // Check uniqueness
                    const uniqueIds = new Set(componentIds);
                    expect(uniqueIds.size).toBe(componentIds.length);

                    // Verify each ID is unique in the database
                    for (const componentId of componentIds) {
                        const count = await prisma.component.count({
                            where: { componentId },
                        });
                        expect(count).toBe(1);
                    }

                    // Clean up for next iteration
                    await prisma.component.deleteMany({
                        where: {
                            id: { in: createdComponents.map((c) => c.id) },
                        },
                    });
                }
            ),
            { numRuns: 20, timeout: 30000 }
        );
    }, 60000); // Increase test timeout

    test('property-based: concurrent component creation maintains uniqueness', async () => {
        const componentGenerator = fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom('service', 'library', 'database', 'external', 'ui'),
            position: fc.record({
                x: fc.integer({ min: 0, max: 10000 }),
                y: fc.integer({ min: 0, max: 10000 }),
            }),
        });

        await fc.assert(
            fc.asyncProperty(
                fc.array(componentGenerator, { minLength: 5, maxLength: 15 }),
                async (componentInputs) => {
                    // Create components concurrently
                    const createdComponents = await Promise.all(
                        componentInputs.map((input) =>
                            prisma.component.create({
                                data: {
                                    componentId: generateComponentId(),
                                    canvasId: testCanvasId,
                                    name: input.name,
                                    type: input.type,
                                    position: input.position,
                                    metadata: {},
                                },
                            })
                        )
                    );

                    // Extract Component IDs
                    const componentIds = createdComponents.map((c) => c.componentId);

                    // Check uniqueness
                    const uniqueIds = new Set(componentIds);
                    expect(uniqueIds.size).toBe(componentIds.length);

                    // Clean up
                    await prisma.component.deleteMany({
                        where: {
                            id: { in: createdComponents.map((c) => c.id) },
                        },
                    });
                }
            ),
            { numRuns: 20, timeout: 30000 }
        );
    }, 60000); // Increase test timeout

    test('property-based: Component IDs remain unique across multiple canvases', async () => {
        // Create additional test project and canvas
        const project2Id = `test-project-2-${Date.now()}`;
        await prisma.project.create({
            data: {
                id: project2Id,
                name: 'Test Project 2',
                createdById: testUserId,
            },
        });

        const canvas2Id = `test-canvas-2-${Date.now()}`;
        await prisma.canvas.create({
            data: {
                id: canvas2Id,
                projectId: project2Id,
                state: {},
            },
        });

        const componentGenerator = fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom('service', 'library', 'database', 'external', 'ui'),
            position: fc.record({
                x: fc.integer({ min: 0, max: 10000 }),
                y: fc.integer({ min: 0, max: 10000 }),
            }),
        });

        await fc.assert(
            fc.asyncProperty(
                fc.array(componentGenerator, { minLength: 3, maxLength: 10 }),
                fc.array(componentGenerator, { minLength: 3, maxLength: 10 }),
                async (canvas1Components, canvas2Components) => {
                    // Create components in first canvas
                    const components1 = await Promise.all(
                        canvas1Components.map((input) =>
                            prisma.component.create({
                                data: {
                                    componentId: generateComponentId(),
                                    canvasId: testCanvasId,
                                    name: input.name,
                                    type: input.type,
                                    position: input.position,
                                    metadata: {},
                                },
                            })
                        )
                    );

                    // Create components in second canvas
                    const components2 = await Promise.all(
                        canvas2Components.map((input) =>
                            prisma.component.create({
                                data: {
                                    componentId: generateComponentId(),
                                    canvasId: canvas2Id,
                                    name: input.name,
                                    type: input.type,
                                    position: input.position,
                                    metadata: {},
                                },
                            })
                        )
                    );

                    // Combine all Component IDs
                    const allComponentIds = [
                        ...components1.map((c) => c.componentId),
                        ...components2.map((c) => c.componentId),
                    ];

                    // Check global uniqueness
                    const uniqueIds = new Set(allComponentIds);
                    expect(uniqueIds.size).toBe(allComponentIds.length);

                    // Clean up
                    await prisma.component.deleteMany({
                        where: {
                            id: {
                                in: [...components1, ...components2].map((c) => c.id),
                            },
                        },
                    });
                }
            ),
            { numRuns: 10, timeout: 30000 }
        );

        // Clean up second canvas and project
        await prisma.canvas.delete({
            where: { id: canvas2Id },
        });
        await prisma.project.delete({
            where: { id: project2Id },
        });
    }, 90000); // Increase test timeout for multi-canvas test

    test('Component ID format is consistent', () => {
        const idPattern = /^COMP-[A-Z0-9]+-[A-Z0-9]+$/;

        for (let i = 0; i < 100; i++) {
            const id = generateComponentId();
            expect(id).toMatch(idPattern);
            expect(id).toContain('COMP-');
        }
    });
});
