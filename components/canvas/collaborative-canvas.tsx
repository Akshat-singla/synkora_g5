'use client';

import { useEffect, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw';
import { ComponentDetailPanel } from './component-detail-panel';
import { RiskBadgeOverlay } from './risk-badge-overlay';
import { CommitCountOverlay } from './commit-count-overlay';

interface CollaborativeCanvasProps {
    canvasId: string;
}

interface Component {
    id: string;
    componentId: string;
    name: string;
    position: { x: number; y: number };
}

export function CollaborativeCanvas({ canvasId }: CollaborativeCanvasProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [components, setComponents] = useState<Component[]>([]);
    const [store, setStore] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize store and load canvas state
    useEffect(() => {
        async function initializeCanvas() {
            try {
                // Load saved canvas state first
                const response = await fetch(`/api/canvas/${canvasId}`);
                let initialSnapshot = undefined;

                if (response.ok) {
                    const data = await response.json();
                    if (data.state && Object.keys(data.state).length > 0) {
                        initialSnapshot = data.state;
                        console.log('Loaded canvas state from database');
                    }
                }

                // Create store with initial snapshot if available
                const newStore = createTLStore({
                    shapeUtils: defaultShapeUtils,
                    initialData: initialSnapshot
                });

                setStore(newStore);
                setIsLoading(false);
            } catch (error) {
                console.error('Error initializing canvas:', error);
                // Create store anyway even if loading fails
                const newStore = createTLStore({ shapeUtils: defaultShapeUtils });
                setStore(newStore);
                setIsLoading(false);
            }
        }

        if (canvasId) {
            initializeCanvas();
        }
    }, [canvasId]);

    // Auto-save canvas state
    useEffect(() => {
        if (!store) return;

        let saveTimeout: NodeJS.Timeout;

        const handleChange = () => {
            // Debounce saves to avoid too many requests
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                try {
                    const snapshot = store.getSnapshot();
                    await fetch(`/api/canvas/${canvasId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            state: snapshot,
                        }),
                    });
                    console.log('Canvas auto-saved');
                } catch (error) {
                    console.error('Error auto-saving canvas:', error);
                }
            }, 2000); // Save 2 seconds after last change
        };

        // Listen to store changes
        const unsubscribe = store.listen(handleChange);

        return () => {
            clearTimeout(saveTimeout);
            unsubscribe();
        };
    }, [store, canvasId]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        async function fetchComponents() {
            try {
                const response = await fetch(`/api/canvas/${canvasId}/components`);
                if (response.ok) {
                    const data = await response.json();
                    // API returns components directly as an array
                    setComponents(data || []);
                }
            } catch (error) {
                console.error('Error fetching components:', error);
            }
        }

        if (canvasId) {
            fetchComponents();
        }
    }, [canvasId]);

    if (!mounted || isLoading || !store) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading Architecture Map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-white">
            <div className="absolute top-4 right-4 z-10 bg-green-100 border border-green-400 text-green-800 px-3 py-1 rounded-md text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                Auto-saving enabled
            </div>
            <Tldraw
                store={store}
                licenseKey='tldraw-2026-02-25/WyJDd1FjTzVOWiIsWyIqIl0sMTYsIjIwMjYtMDItMjUiXQ.6SjAGtDmbrZj+mebgzhmbiRN715/aKs0UbEV6KdpgzimEELQQQaQhB4ashVhZ0DxtL2MVfijw6wi5U60u3zQ2A'
            />

            {/* Risk Badge Overlay */}
            {components.length > 0 && (
                <RiskBadgeOverlay canvasId={canvasId} components={components} />
            )}

            {/* Commit Count Overlay */}
            {components.length > 0 && (
                <CommitCountOverlay canvasId={canvasId} components={components} />
            )}

            {selectedComponentId && (
                <ComponentDetailPanel
                    componentId={selectedComponentId}
                    onClose={() => setSelectedComponentId(null)}
                />
            )}
        </div>
    );
}