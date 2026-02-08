/**
 * Micro-interactions Test Suite
 * 
 * Tests for Task 1.1.3: Subtle Micro-interactions (Inspired by Notion)
 * - Smooth hover states with scale(1.02) on cards
 * - Fade-in animations for new content (300ms ease-out)
 * - Skeleton loaders with subtle pulse (not shimmer)
 * - Toast notifications slide from top-right
 * - Button press feedback with scale(0.98)
 */

import fs from 'fs';
import path from 'path';

describe('Micro-interactions Implementation', () => {
    describe('Tailwind Configuration', () => {
        it('should have fade-in animation with 300ms ease-out', () => {
            const tailwindConfig = fs.readFileSync(
                path.join(__dirname, '../tailwind.config.ts'),
                'utf-8'
            );

            expect(tailwindConfig).toContain("'fade-in': 'fadeIn 0.3s ease-out'");
            expect(tailwindConfig).toContain("fadeIn: {");
            expect(tailwindConfig).toContain("'0%': { opacity: '0' }");
            expect(tailwindConfig).toContain("'100%': { opacity: '1' }");
        });

        it('should have subtle-pulse animation for skeleton loaders', () => {
            const tailwindConfig = fs.readFileSync(
                path.join(__dirname, '../tailwind.config.ts'),
                'utf-8'
            );

            expect(tailwindConfig).toContain("'subtle-pulse'");
            expect(tailwindConfig).toContain("subtlePulse: {");
            expect(tailwindConfig).toContain("'0%, 100%': { opacity: '1' }");
            expect(tailwindConfig).toContain("'50%': { opacity: '0.5' }");
        });

        it('should have slide-in-from-top animation for toast notifications', () => {
            const tailwindConfig = fs.readFileSync(
                path.join(__dirname, '../tailwind.config.ts'),
                'utf-8'
            );

            expect(tailwindConfig).toContain("'slide-in-from-top'");
            expect(tailwindConfig).toContain("slideInFromTop: {");
        });
    });

    describe('Card Component', () => {
        it('should have hover:scale-[1.02] for smooth hover effect', () => {
            const cardComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/card.tsx'),
                'utf-8'
            );

            expect(cardComponent).toContain('hover:scale-[1.02]');
        });

        it('should have transition-all for smooth animations', () => {
            const cardComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/card.tsx'),
                'utf-8'
            );

            expect(cardComponent).toContain('transition-all');
        });
    });

    describe('Button Component', () => {
        it('should have active:scale-[0.98] for button press feedback', () => {
            const buttonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/button.tsx'),
                'utf-8'
            );

            expect(buttonComponent).toContain('active:scale-[0.98]');
        });

        it('should have transition-all for smooth animations', () => {
            const buttonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/button.tsx'),
                'utf-8'
            );

            expect(buttonComponent).toContain('transition-all');
        });
    });

    describe('Skeleton Component', () => {
        it('should use animate-subtle-pulse instead of animate-pulse', () => {
            const skeletonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/skeleton.tsx'),
                'utf-8'
            );

            expect(skeletonComponent).toContain('animate-subtle-pulse');
            expect(skeletonComponent).not.toContain('animate-pulse');
        });
    });

    describe('FadeIn Component', () => {
        it('should exist and export FadeIn component', () => {
            const fadeInPath = path.join(__dirname, '../components/ui/fade-in.tsx');
            expect(fs.existsSync(fadeInPath)).toBe(true);

            const fadeInComponent = fs.readFileSync(fadeInPath, 'utf-8');
            expect(fadeInComponent).toContain('export { FadeIn }');
        });

        it('should use animate-fade-in class', () => {
            const fadeInComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/fade-in.tsx'),
                'utf-8'
            );

            expect(fadeInComponent).toContain('animate-fade-in');
        });

        it('should support delay and duration props', () => {
            const fadeInComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/fade-in.tsx'),
                'utf-8'
            );

            expect(fadeInComponent).toContain('delay?:');
            expect(fadeInComponent).toContain('duration?:');
            expect(fadeInComponent).toContain('animationDelay');
            expect(fadeInComponent).toContain('animationDuration');
        });

        it('should have 300ms default duration', () => {
            const fadeInComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/fade-in.tsx'),
                'utf-8'
            );

            expect(fadeInComponent).toContain('duration = 300');
        });
    });

    describe('Toaster Component', () => {
        it('should be positioned at top-right', () => {
            const toasterComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/toaster.tsx'),
                'utf-8'
            );

            expect(toasterComponent).toContain('position="top-right"');
        });

        it('should have slide-in animation class', () => {
            const toasterComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/toaster.tsx'),
                'utf-8'
            );

            expect(toasterComponent).toContain('animate-slide-in-from-top');
        });
    });

    describe('Integration in Components', () => {
        it('should use FadeIn in decision-list component', () => {
            const decisionListComponent = fs.readFileSync(
                path.join(__dirname, '../components/decisions/decision-list.tsx'),
                'utf-8'
            );

            expect(decisionListComponent).toContain("import { FadeIn }");
            expect(decisionListComponent).toContain('<FadeIn');
        });

        it('should use FadeIn in team-projects component', () => {
            const teamProjectsComponent = fs.readFileSync(
                path.join(__dirname, '../components/teams/team-projects.tsx'),
                'utf-8'
            );

            expect(teamProjectsComponent).toContain("import { FadeIn }");
            expect(teamProjectsComponent).toContain('<FadeIn');
        });

        it('should apply staggered delays in list items', () => {
            const decisionListComponent = fs.readFileSync(
                path.join(__dirname, '../components/decisions/decision-list.tsx'),
                'utf-8'
            );

            // Check for index-based delay pattern
            expect(decisionListComponent).toContain('delay={index * 50}');
        });
    });
});

