/**
 * Feature: synkora-transformation
 * Property 1: System-Centric Terminology Consistency
 * 
 * For any UI component, page, route, or label in the system, the terminology SHALL use
 * "Execution Board" instead of "Kanban", "Architecture Map" instead of "Canvas", and
 * "System Knowledge" instead of "Documentation".
 * 
 * Validates: Requirements 1.1, 2.1, 4.1
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Forbidden terms that should not appear in UI-related files
const FORBIDDEN_TERMS = {
    'Kanban': 'Execution Board',
    'Canvas': 'Architecture Map',
    'Documentation': 'System Knowledge'
};

// File patterns to check for terminology
const UI_FILE_PATTERNS = [
    '**/*.tsx',
    '**/*.ts',
    '**/*.jsx',
    '**/*.js'
];

// Directories to exclude from checks
const EXCLUDED_DIRS = [
    'node_modules',
    '.next',
    '.git',
    '__tests__',
    'docs'
];

/**
 * Recursively get all files matching patterns
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip excluded directories
            if (!EXCLUDED_DIRS.includes(file)) {
                arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
            }
        } else {
            // Check if file matches UI patterns
            const ext = path.extname(file);
            if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
                arrayOfFiles.push(filePath);
            }
        }
    });

    return arrayOfFiles;
}

/**
 * Check if a file contains forbidden terminology
 */
function checkFileForForbiddenTerms(filePath: string): { term: string; line: number; content: string }[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations: { term: string; line: number; content: string }[] = [];

    lines.forEach((line, index) => {
        Object.keys(FORBIDDEN_TERMS).forEach((forbiddenTerm) => {
            // Check for the forbidden term in UI-relevant contexts
            // We look for it in strings, JSX, labels, routes, etc.
            const patterns = [
                new RegExp(`["'\`].*${forbiddenTerm}.*["'\`]`, 'i'), // In strings
                new RegExp(`>${forbiddenTerm}<`, 'i'), // In JSX text
                new RegExp(`name:\\s*["'\`]${forbiddenTerm}`, 'i'), // In object properties
                new RegExp(`title:\\s*["'\`]${forbiddenTerm}`, 'i'), // In titles
                new RegExp(`label:\\s*["'\`]${forbiddenTerm}`, 'i'), // In labels
                new RegExp(`alt=["'\`].*${forbiddenTerm}`, 'i'), // In alt text
            ];

            patterns.forEach((pattern) => {
                if (pattern.test(line)) {
                    // Exclude comments, imports, technical identifiers, and event names
                    const trimmedLine = line.trim();
                    if (!trimmedLine.startsWith('//') &&
                        !trimmedLine.startsWith('/*') &&
                        !trimmedLine.startsWith('*') &&
                        !trimmedLine.includes('import') &&
                        !trimmedLine.includes('from') &&
                        !trimmedLine.includes('socket.on') && // WebSocket event names
                        !trimmedLine.includes('socket.to') && // WebSocket event names
                        !trimmedLine.includes('.emit(') && // WebSocket event names
                        !trimmedLine.includes('href:') && // Route paths (technical)
                        !trimmedLine.includes('href=') && // Route paths (technical)
                        !trimmedLine.includes('Link href') && // Route paths (technical)
                        !trimmedLine.includes('router.replace') && // Route paths (technical)
                        !trimmedLine.includes('router.push') && // Route paths (technical)
                        !trimmedLine.includes('createElement(') && // HTML element creation
                        !trimmedLine.includes('<canvas') && // HTML canvas element
                        !trimmedLine.includes('src=') // Image paths (technical)
                    ) {
                        violations.push({
                            term: forbiddenTerm,
                            line: index + 1,
                            content: line.trim()
                        });
                    }
                }
            });
        });
    });

    return violations;
}

describe('Property 1: System-Centric Terminology Consistency', () => {
    const projectRoot = path.join(__dirname, '..');

    test('UI files should use system-centric terminology', () => {
        const allFiles = getAllFiles(projectRoot);
        const violations: { file: string; term: string; line: number; content: string }[] = [];

        allFiles.forEach((file) => {
            const fileViolations = checkFileForForbiddenTerms(file);
            fileViolations.forEach((violation) => {
                violations.push({
                    file: path.relative(projectRoot, file),
                    ...violation
                });
            });
        });

        // If there are violations, create a detailed error message
        if (violations.length > 0) {
            const errorMessage = violations
                .map((v) => `  ${v.file}:${v.line} - Found "${v.term}" (should be "${FORBIDDEN_TERMS[v.term as keyof typeof FORBIDDEN_TERMS]}")\n    ${v.content}`)
                .join('\n');

            throw new Error(
                `Found ${violations.length} terminology violations:\n${errorMessage}\n\n` +
                `Please replace:\n` +
                Object.entries(FORBIDDEN_TERMS)
                    .map(([old, new_]) => `  - "${old}" with "${new_}"`)
                    .join('\n')
            );
        }

        // Test passes if no violations found
        expect(violations.length).toBe(0);
    });

    test('property-based: random file samples should not contain forbidden terms', async () => {
        const allFiles = getAllFiles(projectRoot);

        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom(...allFiles),
                async (filePath) => {
                    const violations = checkFileForForbiddenTerms(filePath);

                    // Each sampled file should have no violations
                    if (violations.length > 0) {
                        const errorMsg = violations
                            .map((v) => `Line ${v.line}: Found "${v.term}" - ${v.content}`)
                            .join('\n');
                        throw new Error(
                            `File ${path.relative(projectRoot, filePath)} contains forbidden terminology:\n${errorMsg}`
                        );
                    }

                    expect(violations.length).toBe(0);
                }
            ),
            { numRuns: Math.min(20, allFiles.length) }
        );
    });
});
