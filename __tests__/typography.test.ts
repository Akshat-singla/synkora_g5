/**
 * Typography Refinement Tests
 * Task 1.1.4: Typography Refinement
 * 
 * Validates:
 * - Inter font is used for UI
 * - JetBrains Mono is used for code/IDs
 * - Typography hierarchy: h1(24px), h2(20px), h3(16px), body(14px)
 * - Subtle letter-spacing for headings
 */

import { describe, test, expect } from '@jest/globals';
import tailwindConfig from '../tailwind.config';

describe('Typography Refinement', () => {
    test('Inter font is configured for UI (sans)', () => {
        const fontFamily = tailwindConfig.theme?.extend?.fontFamily as any;
        expect(fontFamily).toBeDefined();
        expect(fontFamily.sans).toContain('var(--font-inter)');
    });

    test('JetBrains Mono is configured for code/IDs (mono)', () => {
        const fontFamily = tailwindConfig.theme?.extend?.fontFamily as any;
        expect(fontFamily).toBeDefined();
        expect(fontFamily.mono).toContain('var(--font-jetbrains-mono)');
    });

    test('Typography hierarchy is correctly defined', () => {
        const fontSize = tailwindConfig.theme?.extend?.fontSize as any;
        expect(fontSize).toBeDefined();

        // h1: 24px
        expect(fontSize.h1).toBeDefined();
        expect(fontSize.h1[0]).toBe('24px');
        expect(fontSize.h1[1].fontWeight).toBe('700');

        // h2: 20px
        expect(fontSize.h2).toBeDefined();
        expect(fontSize.h2[0]).toBe('20px');
        expect(fontSize.h2[1].fontWeight).toBe('600');

        // h3: 16px
        expect(fontSize.h3).toBeDefined();
        expect(fontSize.h3[0]).toBe('16px');
        expect(fontSize.h3[1].fontWeight).toBe('600');

        // body: 14px
        expect(fontSize.body).toBeDefined();
        expect(fontSize.body[0]).toBe('14px');
        expect(fontSize.body[1].fontWeight).toBe('400');
    });

    test('Headings have subtle letter-spacing', () => {
        const fontSize = tailwindConfig.theme?.extend?.fontSize as any;

        // h1 should have positive letter-spacing
        expect(fontSize.h1[1].letterSpacing).toBeDefined();
        expect(parseFloat(fontSize.h1[1].letterSpacing)).toBeGreaterThan(0);

        // h2 should have positive letter-spacing
        expect(fontSize.h2[1].letterSpacing).toBeDefined();
        expect(parseFloat(fontSize.h2[1].letterSpacing)).toBeGreaterThan(0);

        // h3 should have positive letter-spacing
        expect(fontSize.h3[1].letterSpacing).toBeDefined();
        expect(parseFloat(fontSize.h3[1].letterSpacing)).toBeGreaterThan(0);
    });

    test('Line heights are appropriate for readability', () => {
        const fontSize = tailwindConfig.theme?.extend?.fontSize as any;

        // All headings and body should have defined line heights
        expect(fontSize.h1[1].lineHeight).toBe('1.3');
        expect(fontSize.h2[1].lineHeight).toBe('1.4');
        expect(fontSize.h3[1].lineHeight).toBe('1.5');
        expect(fontSize.body[1].lineHeight).toBe('1.5');
    });
});
