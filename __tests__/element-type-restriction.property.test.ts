/**
 * Feature: synkora-transformation
 * Property 3: Element Type Restriction
 * 
 * For any element creation attempt on the Architecture Map, the system SHALL only accept
 * element types of: Component, Dependency, or Data Flow, and SHALL reject all other element types.
 * 
 * Validates: Requirements 2.2
 */

import * as fc from 'fast-check';
import {
    isAllowedElementType,
    validateArchitectureMapElements,
    mapToArchitectureType,
} from '@/lib/architecture-validation';

describe('Property 3: Element Type Restriction', () => {
    // Allowed element types (Tldraw types that map to Architecture Map concepts)
    const allowedTypes = [
        'rectangle',
        'ellipse',
        'diamond',
        'arrow',
        'line',
        'text',
        'component',
        'dependency',
        'dataflow',
    ];

    // Forbidden element types (examples of types that should be rejected)
    const forbiddenTypes = [
        'freedraw',
        'image',
        'video',
        'embed',
        'frame',
        'sticky',
        'note',
        'circle',
        'polygon',
        'star',
        'cloud',
    ];

    test('isAllowedElementType accepts only valid Architecture Map element types', () => {
        // Test allowed types
        allowedTypes.forEach((type) => {
            expect(isAllowedElementType(type)).toBe(true);
        });

        // Test forbidden types
        forbiddenTypes.forEach((type) => {
            expect(isAllowedElementType(type)).toBe(false);
        });
    });

    test('property-based: all allowed element types are accepted', () => {
        fc.assert(
            fc.property(fc.constantFrom(...allowedTypes), (elementType) => {
                expect(isAllowedElementType(elementType)).toBe(true);
            }),
            { numRuns: 20 }
        );
    });

    test('property-based: all forbidden element types are rejected', () => {
        fc.assert(
            fc.property(fc.constantFrom(...forbiddenTypes), (elementType) => {
                expect(isAllowedElementType(elementType)).toBe(false);
            }),
            { numRuns: 20 }
        );
    });

    test('property-based: validateArchitectureMapElements accepts valid element arrays', () => {
        const validElementGenerator = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            type: fc.constantFrom(...allowedTypes),
            x: fc.integer({ min: 0, max: 10000 }),
            y: fc.integer({ min: 0, max: 10000 }),
            width: fc.integer({ min: 10, max: 500 }),
            height: fc.integer({ min: 10, max: 500 }),
        });

        fc.assert(
            fc.property(
                fc.array(validElementGenerator, { minLength: 1, maxLength: 50 }),
                (elements) => {
                    const validation = validateArchitectureMapElements(elements);
                    expect(validation.valid).toBe(true);
                    expect(validation.errors).toHaveLength(0);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: validateArchitectureMapElements rejects invalid element arrays', () => {
        const invalidElementGenerator = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            type: fc.constantFrom(...forbiddenTypes),
            x: fc.integer({ min: 0, max: 10000 }),
            y: fc.integer({ min: 0, max: 10000 }),
        });

        fc.assert(
            fc.property(
                fc.array(invalidElementGenerator, { minLength: 1, maxLength: 20 }),
                (elements) => {
                    const validation = validateArchitectureMapElements(elements);
                    expect(validation.valid).toBe(false);
                    expect(validation.errors.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: mixed valid and invalid elements are detected', () => {
        const validElementGenerator = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            type: fc.constantFrom(...allowedTypes),
            x: fc.integer({ min: 0, max: 10000 }),
            y: fc.integer({ min: 0, max: 10000 }),
        });

        const invalidElementGenerator = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            type: fc.constantFrom(...forbiddenTypes),
            x: fc.integer({ min: 0, max: 10000 }),
            y: fc.integer({ min: 0, max: 10000 }),
        });

        fc.assert(
            fc.property(
                fc.array(validElementGenerator, { minLength: 1, maxLength: 10 }),
                fc.array(invalidElementGenerator, { minLength: 1, maxLength: 5 }),
                (validElements, invalidElements) => {
                    const mixedElements = [...validElements, ...invalidElements];
                    const validation = validateArchitectureMapElements(mixedElements);

                    // Should be invalid because it contains invalid elements
                    expect(validation.valid).toBe(false);
                    // Should have at least as many errors as invalid elements
                    expect(validation.errors.length).toBeGreaterThanOrEqual(invalidElements.length);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('property-based: element type mapping is consistent', () => {
        fc.assert(
            fc.property(fc.constantFrom(...allowedTypes), (elementType) => {
                const mappedType = mapToArchitectureType(elementType);
                expect(['component', 'dependency', 'dataflow', 'label']).toContain(mappedType);
            }),
            { numRuns: 20 }
        );
    });

    test('property-based: case-insensitive element type validation', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...allowedTypes),
                fc.constantFrom('lower', 'upper', 'mixed'),
                (elementType, caseType) => {
                    let transformedType = elementType;
                    if (caseType === 'upper') {
                        transformedType = elementType.toUpperCase();
                    } else if (caseType === 'mixed') {
                        transformedType =
                            elementType.charAt(0).toUpperCase() + elementType.slice(1).toLowerCase();
                    }

                    expect(isAllowedElementType(transformedType)).toBe(true);
                }
            ),
            { numRuns: 20 }
        );
    });

    test('empty element array is valid', () => {
        const validation = validateArchitectureMapElements([]);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    test('elements without type field are allowed (metadata)', () => {
        const elementsWithoutType = [
            { id: '1', x: 100, y: 200 },
            { id: '2', data: 'some metadata' },
        ];

        const validation = validateArchitectureMapElements(elementsWithoutType);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    test('validation error messages include element index and type', () => {
        const invalidElements = [
            { id: '1', type: 'freedraw', x: 100, y: 200 },
            { id: '2', type: 'image', x: 300, y: 400 },
        ];

        const validation = validateArchitectureMapElements(invalidElements);
        expect(validation.valid).toBe(false);
        expect(validation.errors.length).toBe(2);

        // Check that error messages contain useful information
        validation.errors.forEach((error, index) => {
            expect(error).toContain(`index ${index}`);
            expect(error).toContain(invalidElements[index].type);
        });
    });

    test('property-based: large element arrays are validated efficiently', () => {
        const validElementGenerator = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            type: fc.constantFrom(...allowedTypes),
            x: fc.integer({ min: 0, max: 10000 }),
            y: fc.integer({ min: 0, max: 10000 }),
        });

        fc.assert(
            fc.property(
                fc.array(validElementGenerator, { minLength: 100, maxLength: 200 }),
                (elements) => {
                    const startTime = Date.now();
                    const validation = validateArchitectureMapElements(elements);
                    const endTime = Date.now();

                    expect(validation.valid).toBe(true);
                    // Validation should complete quickly (< 100ms for 200 elements)
                    expect(endTime - startTime).toBeLessThan(100);
                }
            ),
            { numRuns: 10 }
        );
    });
});
