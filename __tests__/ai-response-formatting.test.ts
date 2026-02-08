/**
 * AI Response Formatting Test Suite
 * 
 * Tests for Task 1.3.3: AI Response Formatting (Notion Style)
 * - Rich markdown rendering (headings, lists, code blocks)
 * - Syntax highlighting for code (using Prism or similar)
 * - Inline component links (clickable, opens details panel)
 * - Collapsible sections for long responses
 * - "Copy" button for code blocks
 */

import fs from 'fs';
import path from 'path';

describe('AI Response Formatting Implementation', () => {
    describe('AIMessage Component', () => {
        it('should exist and export AIMessage component', () => {
            const aiMessagePath = path.join(__dirname, '../components/ai/ai-message.tsx');
            expect(fs.existsSync(aiMessagePath)).toBe(true);

            const aiMessageComponent = fs.readFileSync(aiMessagePath, 'utf-8');
            expect(aiMessageComponent).toContain('export function AIMessage');
        });

        it('should use ReactMarkdown for rich markdown rendering', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain("import ReactMarkdown from 'react-markdown'");
            expect(aiMessageComponent).toContain('<ReactMarkdown');
        });

        it('should use remark-gfm plugin for GitHub Flavored Markdown', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain("import remarkGfm from 'remark-gfm'");
            expect(aiMessageComponent).toContain('remarkPlugins={[remarkGfm]}');
        });

        it('should have custom heading components (h1, h2, h3)', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('h1:');
            expect(aiMessageComponent).toContain('h2:');
            expect(aiMessageComponent).toContain('h3:');
        });

        it('should have custom list components (ul, ol, li)', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('ul:');
            expect(aiMessageComponent).toContain('ol:');
            expect(aiMessageComponent).toContain('li:');
        });

        it('should have custom paragraph component', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('p:');
        });

        it('should have custom blockquote component', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('blockquote:');
        });

        it('should have custom table components', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('table:');
            expect(aiMessageComponent).toContain('thead:');
            expect(aiMessageComponent).toContain('th:');
            expect(aiMessageComponent).toContain('td:');
        });

        it('should have custom horizontal rule component', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('hr:');
        });
    });

    describe('Syntax Highlighting', () => {
        it('should use react-syntax-highlighter for code blocks', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain("import { Prism as SyntaxHighlighter }");
            expect(aiMessageComponent).toContain("from 'react-syntax-highlighter'");
        });

        it('should use vscDarkPlus theme for syntax highlighting', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain("import { vscDarkPlus }");
            expect(aiMessageComponent).toContain('style={vscDarkPlus}');
        });

        it('should have custom code component with inline and block support', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('code:');
            expect(aiMessageComponent).toContain('inline');
            expect(aiMessageComponent).toContain('className');
        });

        it('should detect language from className for syntax highlighting', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('/language-(\\w+)/');
            expect(aiMessageComponent).toContain('language={language}');
        });

        it('should render inline code with different styling', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            // Check for inline code styling
            expect(aiMessageComponent).toContain('if (!inline && language)');
            expect(aiMessageComponent).toContain('font-mono');
        });
    });

    describe('Copy Button for Code Blocks', () => {
        it('should have Copy icon from lucide-react', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain("import { Copy");
            expect(aiMessageComponent).toContain('<Copy');
        });

        it('should have Check icon for copied state', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain("Check");
            expect(aiMessageComponent).toContain('<Check');
        });

        it('should have handleCopyCode function', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('handleCopyCode');
            expect(aiMessageComponent).toContain('navigator.clipboard.writeText');
        });

        it('should have copiedCode state for tracking copied blocks', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('copiedCode');
            expect(aiMessageComponent).toContain('setCopiedCode');
        });

        it('should show "Copied" text when code is copied', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('Copied');
            expect(aiMessageComponent).toContain('copiedCode === blockId');
        });

        it('should have copy button visible on hover', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('group/code');
            expect(aiMessageComponent).toContain('group-hover/code:opacity-100');
            expect(aiMessageComponent).toContain('opacity-0');
        });

        it('should reset copied state after timeout', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('setTimeout');
            expect(aiMessageComponent).toContain('setCopiedCode(null)');
        });
    });

    describe('Inline Component Links', () => {
        it('should have custom link component', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('a:');
        });

        it('should detect component links with #component: format', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain("href?.startsWith('#component:')");
            expect(aiMessageComponent).toContain("replace('#component:', '')");
        });

        it('should render component links as clickable buttons', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            // Check for button element for component links
            expect(aiMessageComponent).toContain('<button');
            expect(aiMessageComponent).toContain('onClick');
        });

        it('should have distinct styling for component links', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            // Check for blue color scheme for component links
            expect(aiMessageComponent).toContain('bg-blue-50');
            expect(aiMessageComponent).toContain('text-blue-600');
            expect(aiMessageComponent).toContain('hover:bg-blue-100');
        });

        it('should handle regular links with target="_blank"', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('target="_blank"');
            expect(aiMessageComponent).toContain('rel="noopener noreferrer"');
        });
    });

    describe('Collapsible Section Component', () => {
        it('should exist and export CollapsibleSection component', () => {
            const collapsibleSectionPath = path.join(__dirname, '../components/ai/collapsible-section.tsx');
            expect(fs.existsSync(collapsibleSectionPath)).toBe(true);

            const collapsibleSectionComponent = fs.readFileSync(collapsibleSectionPath, 'utf-8');
            expect(collapsibleSectionComponent).toContain('export function CollapsibleSection');
        });

        it('should have ChevronDown and ChevronRight icons', () => {
            const collapsibleSectionComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/collapsible-section.tsx'),
                'utf-8'
            );

            expect(collapsibleSectionComponent).toContain('ChevronDown');
            expect(collapsibleSectionComponent).toContain('ChevronRight');
        });

        it('should have isOpen state for toggle functionality', () => {
            const collapsibleSectionComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/collapsible-section.tsx'),
                'utf-8'
            );

            expect(collapsibleSectionComponent).toContain('isOpen');
            expect(collapsibleSectionComponent).toContain('setIsOpen');
        });

        it('should have defaultOpen prop', () => {
            const collapsibleSectionComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/collapsible-section.tsx'),
                'utf-8'
            );

            expect(collapsibleSectionComponent).toContain('defaultOpen');
        });

        it('should have title prop', () => {
            const collapsibleSectionComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/collapsible-section.tsx'),
                'utf-8'
            );

            expect(collapsibleSectionComponent).toContain('title:');
        });

        it('should have children prop for content', () => {
            const collapsibleSectionComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/collapsible-section.tsx'),
                'utf-8'
            );

            expect(collapsibleSectionComponent).toContain('children:');
        });

        it('should have smooth animation for expand/collapse', () => {
            const collapsibleSectionComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/collapsible-section.tsx'),
                'utf-8'
            );

            expect(collapsibleSectionComponent).toContain('animate-in');
            expect(collapsibleSectionComponent).toContain('slide-in-from-top');
        });

        it('should have hover effect on toggle button', () => {
            const collapsibleSectionComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/collapsible-section.tsx'),
                'utf-8'
            );

            expect(collapsibleSectionComponent).toContain('hover:bg-');
            expect(collapsibleSectionComponent).toContain('transition');
        });
    });

    describe('AI Chat Panel Integration', () => {
        it('should import AIMessage component', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanelComponent).toContain("import { AIMessage }");
        });

        it('should use AIMessage for AI responses', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            expect(aiChatPanelComponent).toContain('<AIMessage');
            expect(aiChatPanelComponent).toContain('content={message.content}');
            expect(aiChatPanelComponent).toContain('timestamp={message.timestamp}');
        });

        it('should keep user messages with simple styling', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            // User messages should still use simple bg-[#B8FF14] styling
            expect(aiChatPanelComponent).toContain('bg-[#B8FF14]');
            expect(aiChatPanelComponent).toContain("message.type === 'user'");
        });

        it('should conditionally render AIMessage for AI responses', () => {
            const aiChatPanelComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-chat-panel.tsx'),
                'utf-8'
            );

            // Check for conditional rendering based on message type
            expect(aiChatPanelComponent).toContain("message.type === 'user'");
        });
    });

    describe('Typography and Styling', () => {
        it('should have proper text hierarchy (h1: 24px, h2: 20px, h3: 16px)', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('text-xl'); // h1
            expect(aiMessageComponent).toContain('text-lg'); // h2
            expect(aiMessageComponent).toContain('text-base'); // h3
        });

        it('should have proper spacing between elements', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('space-y-');
            expect(aiMessageComponent).toContain('my-');
        });

        it('should have proper color scheme for dark mode', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('dark:text-gray-');
            expect(aiMessageComponent).toContain('dark:bg-gray-');
        });

        it('should use monospace font for code', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('font-mono');
        });

        it('should have proper line height for readability', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('leading-relaxed');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML elements', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            // Check for semantic elements in markdown components
            expect(aiMessageComponent).toContain('<h1');
            expect(aiMessageComponent).toContain('<h2');
            expect(aiMessageComponent).toContain('<h3');
            expect(aiMessageComponent).toContain('<ul');
            expect(aiMessageComponent).toContain('<ol');
            expect(aiMessageComponent).toContain('<blockquote');
        });

        it('should have proper button elements for interactive components', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            expect(aiMessageComponent).toContain('<Button');
            expect(aiMessageComponent).toContain('<button');
        });

        it('should have proper contrast for text', () => {
            const aiMessageComponent = fs.readFileSync(
                path.join(__dirname, '../components/ai/ai-message.tsx'),
                'utf-8'
            );

            // Check for proper text colors with good contrast
            expect(aiMessageComponent).toContain('text-gray-900');
            expect(aiMessageComponent).toContain('text-gray-700');
        });
    });

    describe('Package Dependencies', () => {
        it('should have react-syntax-highlighter installed', () => {
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
            );

            expect(packageJson.dependencies['react-syntax-highlighter']).toBeDefined();
        });

        it('should have @types/react-syntax-highlighter installed', () => {
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
            );

            expect(
                packageJson.dependencies['@types/react-syntax-highlighter'] ||
                packageJson.devDependencies['@types/react-syntax-highlighter']
            ).toBeDefined();
        });

        it('should have react-markdown installed', () => {
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
            );

            expect(packageJson.dependencies['react-markdown']).toBeDefined();
        });

        it('should have remark-gfm installed', () => {
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
            );

            expect(packageJson.dependencies['remark-gfm']).toBeDefined();
        });
    });
});
