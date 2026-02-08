/**
 * AI Context Indicators Test Suite
 * 
 * Tests for Task 1.3.4: Context Indicators (Transparent AI)
 * - "Sources" section showing what data AI used
 * - Component badges linking to referenced components
 * - Decision links with preview on hover
 * - "Based on X components, Y decisions, Z commits" summary
 */

import fs from 'fs';
import path from 'path';

describe('AI Context Indicators Implementation', () => {
    describe('API Response Structure', () => {
        it('should return context metadata in system intelligence API', () => {
            const apiRoute = fs.readFileSync(
                path.join(__dirname, '../app/api/projects/[id]/system-intelligence/route.ts'),
                'utf-8'
            );

            expect(apiRoute).toContain('contextMetadata');
            expect(apiRoute).toContain('componentsUsed');
            expect(apiRoute).toContain('decisionsUsed');
            expect(apiRoute).toContain('commitsUsed');
        });

        it('should include sources object with components and decisions', () => {
            const apiRoute = fs.readFileSync(
                path.join(__dirname, '../app/api/projects/[id]/system-intelligence/route.ts'),
                'utf-8'
            );

            expect(apiRoute).toContain('sources:');
            expect(apiRoute).toContain('components:');
            expect(apiRoute).toContain('decisions:');
        });

        it('should map component data for context', () => {
            const apiRoute = fs.readFileSync(
                path.join(__dirname, '../app/api/projects/[id]/system-intelligence/route.ts'),
                'utf-8'
            );

            expect(apiRoute).toContain('systemContext.components.map');
            expect(apiRoute).toContain('componentId:');
            expect(apiRoute).toContain('name:');
            expect(apiRoute).toContain('type:');
        });

        it('should map decision data for context', () => {
            const apiRoute = fs.readFileSync(
                path.join(__dirname, '../app/api/projects/[id]/system-intelligence/route.ts'),
                'utf-8'
            );

            expect(apiRoute).toContain('systemContext.decisions.map');
            expect(apiRoute).toContain('title:');
            expect(apiRoute).toContain('status:');
        });

        it('should return context in API response', () => {
            const apiRoute = fs.readFileSync(
                path.join(__dirname, '../app/api/projects/[id]/system-intelligence/route.ts'),
                'utf-8'
            );

            expect(apiRoute).toContain('context: contextMetadata');
        });
    });

    describe('Message Interface', () => {
        it('should extend Message interface with context property', () => {
            const aiChatPanel = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanel).toContain('context?:');
            expect(aiChatPanel).toContain('componentsUsed:');
            expect(aiChatPanel).toContain('decisionsUsed:');
            expect(aiChatPanel).toContain('commitsUsed:');
        });

        it('should include sources in context interface', () => {
            const aiChatPanel = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanel).toContain('sources:');
            expect(aiChatPanel).toContain('components: Array<');
            expect(aiChatPanel).toContain('decisions: Array<');
        });

        it('should pass context to AIMessage component', () => {
            const aiChatPanel = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanel).toContain('context={message.context}');
        });

        it('should pass projectId to AIMessage component', () => {
            const aiChatPanel = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanel).toContain('projectId={componentContext?.projectId}');
        });
    });

    describe('AIMessage Context Props', () => {
        it('should accept context prop in AIMessage', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context?:');
            expect(aiMessage).toContain('componentsUsed:');
            expect(aiMessage).toContain('decisionsUsed:');
            expect(aiMessage).toContain('commitsUsed:');
        });

        it('should accept projectId prop in AIMessage', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('projectId?:');
        });

        it('should destructure context and projectId in component', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context, projectId');
        });
    });

    describe('Context Summary Display', () => {
        it('should conditionally render context indicators section', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context &&');
            expect(aiMessage).toContain('componentsUsed > 0');
            expect(aiMessage).toContain('decisionsUsed > 0');
            expect(aiMessage).toContain('commitsUsed > 0');
        });

        it('should display "Based on:" summary text', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('Based on:');
        });

        it('should display component count badge', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context.componentsUsed');
            expect(aiMessage).toContain('component');
            expect(aiMessage).toContain('bg-blue-50');
            expect(aiMessage).toContain('text-blue-600');
        });

        it('should display decision count badge', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context.decisionsUsed');
            expect(aiMessage).toContain('decision');
            expect(aiMessage).toContain('bg-purple-50');
            expect(aiMessage).toContain('text-purple-600');
        });

        it('should display commit count badge', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context.commitsUsed');
            expect(aiMessage).toContain('commit');
            expect(aiMessage).toContain('bg-green-50');
            expect(aiMessage).toContain('text-green-600');
        });

        it('should handle singular/plural forms correctly', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain("!== 1 ? 's' : ''");
        });
    });

    describe('Sources Section', () => {
        it('should use details/summary for collapsible sources', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('<details');
            expect(aiMessage).toContain('<summary');
            expect(aiMessage).toContain('View Sources');
        });

        it('should have ChevronRight icon that rotates on open', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('ChevronRight');
            expect(aiMessage).toContain('group-open:rotate-90');
        });

        it('should have hover effect on summary', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('hover:text-gray-900');
            expect(aiMessage).toContain('cursor-pointer');
        });
    });

    describe('Component Badges', () => {
        it('should render component sources section', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context.sources.components.length > 0');
            expect(aiMessage).toContain('Components (');
        });

        it('should map over components to create badges', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context.sources.components.map');
            expect(aiMessage).toContain('key={component.id}');
        });

        it('should display component ID in monospace font', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('component.componentId');
            expect(aiMessage).toContain('font-mono');
        });

        it('should display component name', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('component.name');
            expect(aiMessage).toContain('font-medium');
        });

        it('should have blue color scheme for component badges', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('bg-blue-50');
            expect(aiMessage).toContain('text-blue-700');
            expect(aiMessage).toContain('hover:bg-blue-100');
            expect(aiMessage).toContain('border-blue-200');
        });

        it('should make component badges clickable', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('<button');
            expect(aiMessage).toContain('onClick={() => {');
        });

        it('should have title attribute with component details', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('title={');
            expect(aiMessage).toContain('component.name');
            expect(aiMessage).toContain('component.type');
        });
    });

    describe('Decision Links', () => {
        it('should render decision sources section', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context.sources.decisions.length > 0');
            expect(aiMessage).toContain('Decisions (');
        });

        it('should map over decisions to create links', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context.sources.decisions.map');
            expect(aiMessage).toContain('key={decision.id}');
        });

        it('should display decision title', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('decision.title');
        });

        it('should display decision status badge', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('decision.status');
        });

        it('should have purple color scheme for decision links', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('bg-purple-50');
            expect(aiMessage).toContain('text-purple-700');
            expect(aiMessage).toContain('hover:bg-purple-100');
            expect(aiMessage).toContain('border-purple-200');
        });

        it('should make decision links clickable', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('onClick={() => {');
            expect(aiMessage).toContain('window.location.href');
            expect(aiMessage).toContain('/decisions/');
        });
    });

    describe('Decision Hover Preview', () => {
        it('should have hoveredDecision state', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('hoveredDecision');
            expect(aiMessage).toContain('setHoveredDecision');
        });

        it('should handle mouse enter and leave events', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('onMouseEnter');
            expect(aiMessage).toContain('onMouseLeave');
            expect(aiMessage).toContain('setHoveredDecision(decision.id)');
            expect(aiMessage).toContain('setHoveredDecision(null)');
        });

        it('should conditionally render preview on hover', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('hoveredDecision === decision.id');
        });

        it('should display decision title in preview', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('decision.title');
        });

        it('should display decision status in preview', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('Status:');
            expect(aiMessage).toContain('decision.status');
        });

        it('should have proper positioning for preview tooltip', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('absolute');
            expect(aiMessage).toContain('top-full');
            expect(aiMessage).toContain('z-10');
        });

        it('should have animation for preview appearance', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('animate-in');
            expect(aiMessage).toContain('fade-in');
            expect(aiMessage).toContain('slide-in-from-top');
        });

        it('should have shadow and border for preview', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('shadow-lg');
            expect(aiMessage).toContain('border');
        });

        it('should show "Click to view" hint in preview', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('Click to view');
        });
    });

    describe('Visual Styling', () => {
        it('should have border separator for context section', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('border-t');
            expect(aiMessage).toContain('pt-4');
            expect(aiMessage).toContain('mt-4');
        });

        it('should have proper spacing between elements', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('space-y-');
            expect(aiMessage).toContain('gap-');
        });

        it('should have proper text sizes', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('text-xs');
            expect(aiMessage).toContain('text-sm');
        });

        it('should have dark mode support', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('dark:bg-');
            expect(aiMessage).toContain('dark:text-');
            expect(aiMessage).toContain('dark:border-');
        });

        it('should have transition effects', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('transition');
        });
    });

    describe('Accessibility', () => {
        it('should use semantic HTML for collapsible section', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('<details');
            expect(aiMessage).toContain('<summary');
        });

        it('should have proper button elements', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('<button');
        });

        it('should have descriptive text for screen readers', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('View Sources');
            expect(aiMessage).toContain('Components (');
            expect(aiMessage).toContain('Decisions (');
        });

        it('should have title attributes for tooltips', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('title={');
        });
    });

    describe('Integration', () => {
        it('should store context from API response', () => {
            const aiChatPanel = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanel).toContain('data.context');
            expect(aiChatPanel).toContain('context: data.context');
        });

        it('should handle missing context gracefully', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('context &&');
        });

        it('should handle empty sources arrays', () => {
            const aiMessage = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessage).toContain('.length > 0');
        });
    });
});
