/**
 * AI Intent Buttons Test Suite
 * 
 * Tests for Task 1.3.1: Intent-Based Entry Points (Context-Aware)
 * - "Ask AI" button in component details panel
 * - Quick intent buttons above chat (Explain, Risks, Onboard, Why)
 * - Clean button design with icon + text
 * - Hover shows example questions
 */

import fs from 'fs';
import path from 'path';

describe('AI Intent Buttons Implementation', () => {
    describe('Ask AI Button Component', () => {
        it('should exist and export AskAIButton component', () => {
            const askAIButtonPath = path.join(__dirname, '../components/ai/ask-ai-button.tsx');
            expect(fs.existsSync(askAIButtonPath)).toBe(true);

            const askAIButtonComponent = fs.readFileSync(askAIButtonPath, 'utf-8');
            expect(askAIButtonComponent).toContain('export function AskAIButton');
        });

        it('should have Sparkles icon', () => {
            const askAIButtonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ask-ai-button.tsx'),
                'utf-8'
            );

            expect(askAIButtonComponent).toContain("import { Sparkles }");
            expect(askAIButtonComponent).toContain('<Sparkles');
        });

        it('should have "Ask AI" text label', () => {
            const askAIButtonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ask-ai-button.tsx'),
                'utf-8'
            );

            expect(askAIButtonComponent).toContain('Ask AI');
        });

        it('should have tooltip with example questions', () => {
            const askAIButtonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ask-ai-button.tsx'),
                'utf-8'
            );

            expect(askAIButtonComponent).toContain('Tooltip');
            expect(askAIButtonComponent).toContain('TooltipContent');
        });

        it('should have minimum touch target size (44px)', () => {
            const askAIButtonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ask-ai-button.tsx'),
                'utf-8'
            );

            expect(askAIButtonComponent).toContain('min-h-[44px]');
        });
    });

    describe('AI Intent Buttons Component', () => {
        it('should exist and export AIIntentButtons component', () => {
            const aiIntentButtonsPath = path.join(__dirname, '../components/ai/ai-intent-buttons.tsx');
            expect(fs.existsSync(aiIntentButtonsPath)).toBe(true);

            const aiIntentButtonsComponent = fs.readFileSync(aiIntentButtonsPath, 'utf-8');
            expect(aiIntentButtonsComponent).toContain('export function AIIntentButtons');
        });

        it('should have all four intent buttons: Explain, Risks, Onboard, Why', () => {
            const aiIntentButtonsComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-intent-buttons.tsx'),
                'utf-8'
            );

            expect(aiIntentButtonsComponent).toContain("'explain'");
            expect(aiIntentButtonsComponent).toContain("'risks'");
            expect(aiIntentButtonsComponent).toContain("'onboard'");
            expect(aiIntentButtonsComponent).toContain("'why'");
        });

        it('should have icons for each intent button', () => {
            const aiIntentButtonsComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-intent-buttons.tsx'),
                'utf-8'
            );

            expect(aiIntentButtonsComponent).toContain('Brain');
            expect(aiIntentButtonsComponent).toContain('AlertTriangle');
            expect(aiIntentButtonsComponent).toContain('GraduationCap');
            expect(aiIntentButtonsComponent).toContain('HelpCircle');
        });

        it('should have example questions in tooltips', () => {
            const aiIntentButtonsComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-intent-buttons.tsx'),
                'utf-8'
            );

            expect(aiIntentButtonsComponent).toContain('exampleQuestions');
            expect(aiIntentButtonsComponent).toContain('Example questions:');
        });

        it('should have minimum touch target size (44px)', () => {
            const aiIntentButtonsComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-intent-buttons.tsx'),
                'utf-8'
            );

            expect(aiIntentButtonsComponent).toContain('min-h-[44px]');
        });
    });

    describe('AI Chat Panel Component', () => {
        it('should exist and export AIChatPanel component', () => {
            const aiChatPanelPath = path.join(__dirname, '../components/ai/ai-chat-panel.tsx');
            expect(fs.existsSync(aiChatPanelPath)).toBe(true);

            const aiChatPanelComponent = fs.readFileSync(aiChatPanelPath, 'utf-8');
            expect(aiChatPanelComponent).toContain('export function AIChatPanel');
        });

        it('should use Sheet component for panel display', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanelComponent).toContain('Sheet');
            expect(aiChatPanelComponent).toContain('SheetContent');
        });

        it('should include AIIntentButtons', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanelComponent).toContain('AIIntentButtons');
        });

        it('should have loading state with typing indicator', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanelComponent).toContain('loading');
            expect(aiChatPanelComponent).toContain('Typing Indicator');
            expect(aiChatPanelComponent).toContain('animate-bounce');
        });

        it('should have message bubbles with proper styling', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            // Check for message interface
            expect(aiChatPanelComponent).toContain('interface Message');
            expect(aiChatPanelComponent).toContain("type: 'user' | 'ai'");

            // Check for user message styling (neon green background)
            expect(aiChatPanelComponent).toContain('bg-[#B8FF14]');
            expect(aiChatPanelComponent).toContain('text-black');

            // Check for AI message styling (card background with border)
            expect(aiChatPanelComponent).toContain('bg-white dark:bg-gray-900');
            expect(aiChatPanelComponent).toContain('border border-gray-200 dark:border-gray-800');

            // Check for message alignment
            expect(aiChatPanelComponent).toContain('justify-end');
            expect(aiChatPanelComponent).toContain('justify-start');
        });

        it('should have timestamps on hover', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            // Check for timestamp functionality
            expect(aiChatPanelComponent).toContain('formatTimestamp');
            expect(aiChatPanelComponent).toContain('timestamp');

            // Check for hover effect
            expect(aiChatPanelComponent).toContain('group-hover:opacity-100');
            expect(aiChatPanelComponent).toContain('opacity-0');
        });

        it('should have three animated dots for typing indicator', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            // Check for three dots with animation delays
            expect(aiChatPanelComponent).toContain('animationDelay: \'0ms\'');
            expect(aiChatPanelComponent).toContain('animationDelay: \'150ms\'');
            expect(aiChatPanelComponent).toContain('animationDelay: \'300ms\'');
            expect(aiChatPanelComponent).toContain('animate-bounce');
        });
    });

    describe('Component Detail Panel Integration', () => {
        it('should import AskAIButton in component-detail-panel', () => {
            const componentDetailPanel = fs.readFileSync(
                path.join(__dirname, '../components/canvas/component-detail-panel.tsx'),
                'utf-8'
            );

            expect(componentDetailPanel).toContain("import { AskAIButton }");
        });

        it('should import AIChatPanel in component-detail-panel', () => {
            const componentDetailPanel = fs.readFileSync(
                path.join(__dirname, '../components/canvas/component-detail-panel.tsx'),
                'utf-8'
            );

            expect(componentDetailPanel).toContain("import { AIChatPanel }");
        });

        it('should render AskAIButton in component-detail-panel', () => {
            const componentDetailPanel = fs.readFileSync(
                path.join(__dirname, '../components/canvas/component-detail-panel.tsx'),
                'utf-8'
            );

            expect(componentDetailPanel).toContain('<AskAIButton');
        });

        it('should render AIChatPanel in component-detail-panel', () => {
            const componentDetailPanel = fs.readFileSync(
                path.join(__dirname, '../components/canvas/component-detail-panel.tsx'),
                'utf-8'
            );

            expect(componentDetailPanel).toContain('<AIChatPanel');
        });

        it('should have state for AI chat panel open/close', () => {
            const componentDetailPanel = fs.readFileSync(
                path.join(__dirname, '../components/canvas/component-detail-panel.tsx'),
                'utf-8'
            );

            expect(componentDetailPanel).toContain('isAIChatOpen');
            expect(componentDetailPanel).toContain('setIsAIChatOpen');
        });
    });

    describe('Decision Detail Integration', () => {
        it('should import AskAIButton in decision-detail', () => {
            const decisionDetail = fs.readFileSync(
                path.join(__dirname, '../components/decisions/decision-detail.tsx'),
                'utf-8'
            );

            expect(decisionDetail).toContain("import { AskAIButton }");
        });

        it('should import AIChatPanel in decision-detail', () => {
            const decisionDetail = fs.readFileSync(
                path.join(__dirname, '../components/decisions/decision-detail.tsx'),
                'utf-8'
            );

            expect(decisionDetail).toContain("import { AIChatPanel }");
        });

        it('should render AskAIButton in decision-detail', () => {
            const decisionDetail = fs.readFileSync(
                path.join(__dirname, '../components/decisions/decision-detail.tsx'),
                'utf-8'
            );

            expect(decisionDetail).toContain('<AskAIButton');
        });

        it('should render AIChatPanel in decision-detail', () => {
            const decisionDetail = fs.readFileSync(
                path.join(__dirname, '../components/decisions/decision-detail.tsx'),
                'utf-8'
            );

            expect(decisionDetail).toContain('<AIChatPanel');
        });
    });

    describe('Tooltip Component', () => {
        it('should exist and export Tooltip components', () => {
            const tooltipPath = path.join(__dirname, '../components/ui/tooltip.tsx');
            expect(fs.existsSync(tooltipPath)).toBe(true);

            const tooltipComponent = fs.readFileSync(tooltipPath, 'utf-8');
            expect(tooltipComponent).toContain('export { Tooltip');
            expect(tooltipComponent).toContain('TooltipTrigger');
            expect(tooltipComponent).toContain('TooltipContent');
            expect(tooltipComponent).toContain('TooltipProvider');
        });

        it('should use Radix UI Tooltip primitive', () => {
            const tooltipComponent = fs.readFileSync(
                path.join(__dirname, '../components/ui/tooltip.tsx'),
                'utf-8'
            );

            expect(tooltipComponent).toContain('@radix-ui/react-tooltip');
        });
    });

    describe('Design Requirements', () => {
        it('should have clean button design with consistent styling', () => {
            const askAIButtonComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ask-ai-button.tsx'),
                'utf-8'
            );

            // Check for gradient background (clean, modern design)
            expect(askAIButtonComponent).toContain('gradient');

            // Check for transition effects
            expect(askAIButtonComponent).toContain('transition');
        });

        it('should have icon + text pattern in all buttons', () => {
            const aiIntentButtonsComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-intent-buttons.tsx'),
                'utf-8'
            );

            // Check that icons are rendered with labels
            expect(aiIntentButtonsComponent).toContain('<Icon');
            expect(aiIntentButtonsComponent).toContain('intent.label');
        });

        it('should have context-aware functionality', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            // Check for component context support
            expect(aiChatPanelComponent).toContain('componentContext');
            expect(aiChatPanelComponent).toContain('componentId');
            expect(aiChatPanelComponent).toContain('componentName');
        });
    });
});
