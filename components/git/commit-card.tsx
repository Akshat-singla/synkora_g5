"use client";

import { GitCommit, ExternalLink, User, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CommitCardProps {
    commit: {
        sha: string;
        message: string;
        author: string;
        authorEmail: string;
        committedAt: Date | string;
        url: string;
    };
    onExplainCommit?: (sha: string) => void;
}

export function CommitCard({ commit, onExplainCommit }: CommitCardProps) {
    const commitDate = new Date(commit.committedAt);
    const shortSha = commit.sha.substring(0, 7);

    // Get first line of commit message
    const firstLine = commit.message.split("\n")[0];
    const hasMoreLines = commit.message.split("\n").length > 1;

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <GitCommit className="w-5 h-5 text-primary" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                            <p className="font-medium text-sm mb-1">
                                {firstLine}
                                {hasMoreLines && (
                                    <span className="text-muted-foreground ml-1">...</span>
                                )}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{commit.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {commitDate.toLocaleDateString()} at{" "}
                                        {commitDate.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Badge variant="secondary" className="font-mono text-xs">
                            {shortSha}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => window.open(commit.url, "_blank")}
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View on GitHub
                        </Button>

                        {onExplainCommit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => onExplainCommit(commit.sha)}
                            >
                                Explain with AI
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
