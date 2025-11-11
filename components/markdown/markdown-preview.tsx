"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
    content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
    return (
        <div className="h-full overflow-y-auto p-4 bg-white">
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || "*No content to preview*"}
                </ReactMarkdown>
            </div>
        </div>
    );
}
