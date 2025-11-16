"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "assistant"; content: string };

export default function RepoAIChat() {
    const [repos, setRepos] = useState<{ id: string; fullName: string }[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string | undefined>(undefined);
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingRepos, setLoadingRepos] = useState(true);

    useEffect(() => {
        // Fetch user repositories
        async function load() {
            setLoadingRepos(true);
            setError(null);
            try {
                const res = await fetch("/api/github/repositories");
                
                if (res.status === 401) {
                    setError("Sign in with GitHub to use AI Assistant");
                    setLoadingRepos(false);
                    return;
                }
                
                if (res.status === 403) {
                    setError("Connect your GitHub account first");
                    setLoadingRepos(false);
                    return;
                }
                
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || "Failed to fetch repositories");
                }
                
                const data = await res.json();
                const items = (data.repositories || []).map((r: any) => ({ id: r.id, fullName: r.fullName }));
                setRepos(items);
                if (items.length && !selectedRepo) setSelectedRepo(items[0].fullName);
            } catch (e: any) {
                console.error("Error loading repositories:", e);
                setError(e.message || "Could not load repositories");
            } finally {
                setLoadingRepos(false);
            }
        }
        load();
    }, []);

    async function handleSend() {
        if (!prompt.trim()) return;
        setError(null);
        const userMessage: Message = { role: "user", content: prompt.trim() };
        setMessages((m) => [...m, userMessage]);
        setPrompt("");
        setLoading(true);

        try {
            const res = await fetch("/api/github/ai-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoFullName: selectedRepo, prompt: userMessage.content, history: messages.map((mm) => ({ role: mm.role, content: mm.content })) }),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "AI request failed");
            }

            const data = await res.json();
            const assistant = data.assistant?.content || "(no response)";
            setMessages((m) => [...m, { role: "assistant", content: assistant }]);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to get AI response");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-3 border-b">
                <label className="text-sm text-muted-foreground">Repository</label>
                {loadingRepos ? (
                    <div className="text-xs text-muted-foreground">Loading...</div>
                ) : repos.length > 0 ? (
                    <select
                        className="px-3 py-2 border rounded bg-background text-sm"
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                    >
                        {repos.map((r) => (
                            <option key={r.id} value={r.fullName}>
                                {r.fullName}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="text-xs text-destructive">No repositories found</div>
                )}
            </div>

            {error ? (
                <div className="p-3 flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">{error}</p>
                        <p className="text-xs text-muted-foreground">Please check your GitHub connection in your account settings.</p>
                    </div>
                </div>
            ) : (
                <div className="p-3 flex-1 overflow-auto">
                    {messages.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            {loadingRepos ? "Loading repositories..." : "Ask something about the repository—commits, PRs, or code structure."}
                        </p>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
                            <div className={`inline-block p-2 rounded ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"}`}>
                                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="p-3 border-t">
                <div className="flex gap-2">
                    <Input
                        className="flex-1"
                        value={prompt}
                        onChange={(e: any) => setPrompt(e.target.value)}
                        placeholder="Ask the AI about this repository..."
                        disabled={!selectedRepo || loading || !!error}
                    />
                    <Button
                        variant="neon"
                        size="sm"
                        disabled={loading || !selectedRepo || !!error}
                        onClick={handleSend}
                    >
                        {loading ? "Thinking..." : "Ask"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
