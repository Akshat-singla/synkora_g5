'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Tldraw, Editor } from 'tldraw';
import { useSocket } from '@/hooks/use-socket';

interface CollaborativeCanvasProps {
  projectId: string;
  canvasId: string;
}

export function CollaborativeCanvas({ projectId, canvasId }: CollaborativeCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const { socket, isConnected } = useSocket();
  const isLoadingRef = useRef(false);
  const isSavingRef = useRef(false);
  const isRemoteUpdateRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load canvas state on mount
  useEffect(() => {
    if (!editor || isLoadingRef.current) return;

    const loadCanvasState = async () => {
      isLoadingRef.current = true;
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (response.ok) {
          const data = await response.json();
          if (data.state && Object.keys(data.state).length > 0) {
            // Load the canvas state - tldraw will handle the snapshot format
            try {
              // @ts-ignore - using internal API for snapshot loading
              await editor.store.loadSnapshot(data.state);
            } catch (err) {
              console.warn('Could not load canvas snapshot:', err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load canvas state:', error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadCanvasState();
  }, [editor, projectId]);

  // Debounced save function
  const saveCanvasState = useCallback(async () => {
    if (!editor || isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      // Get all records from the store
      const allRecords = editor.store.allRecords();
      const snapshot = {
        store: Object.fromEntries(allRecords.map(r => [r.id, r])),
        schema: editor.store.schema.serialize(),
      };

      await fetch(`/api/projects/${projectId}/canvas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: snapshot }),
      });
    } catch (error) {
      console.error('Failed to save canvas state:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [editor, projectId]);

  // Listen to store changes and broadcast to other users
  useEffect(() => {
    if (!editor || !socket || !isConnected) return;

    const handleChange = (entry: any) => {
      // Don't broadcast if this is a remote update
      if (isRemoteUpdateRef.current) {
        return;
      }

      const { changes } = entry;

      // Broadcast changes to other users
      if (Object.keys(changes.added).length > 0 ||
        Object.keys(changes.updated).length > 0 ||
        Object.keys(changes.removed).length > 0) {

        socket.emit('canvas:update', {
          projectId,
          changes: {
            added: changes.added,
            updated: changes.updated,
            removed: changes.removed,
          },
        });

        // Debounce save - save 3 seconds after last change
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveCanvasState();
        }, 3000);
      }
    };

    // Subscribe to store changes
    const unsubscribe = editor.store.listen(handleChange, {
      scope: 'document',
      source: 'user',
    });

    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, socket, isConnected, projectId, saveCanvasState]);

  // Handle incoming canvas updates from other users
  useEffect(() => {
    if (!socket || !isConnected || !editor) return;

    const handleCanvasUpdate = (data: any) => {
      // Mark as remote update to prevent re-broadcasting
      isRemoteUpdateRef.current = true;

      try {
        // Apply changes to the store
        editor.store.mergeRemoteChanges(() => {
          // Add new records
          if (data.added) {
            Object.values(data.added).forEach((record: any) => {
              editor.store.put([record]);
            });
          }

          // Update existing records
          if (data.updated) {
            Object.values(data.updated).forEach(([, newRecord]: any) => {
              editor.store.put([newRecord]);
            });
          }

          // Remove deleted records
          if (data.removed) {
            Object.keys(data.removed).forEach((id) => {
              editor.store.remove([id as any]);
            });
          }
        });
      } catch (error) {
        console.error('Failed to apply remote canvas changes:', error);
      } finally {
        // Reset flag after a short delay
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 100);
      }
    };

    socket.on('canvas:update', handleCanvasUpdate);

    return () => {
      socket.off('canvas:update', handleCanvasUpdate);
    };
  }, [socket, isConnected, editor]);

  // Broadcast cursor position (debounced)
  useEffect(() => {
    if (!socket || !isConnected || !editor) return;

    let cursorTimeout: NodeJS.Timeout | null = null;

    const broadcastCursor = () => {
      const { currentPagePoint } = editor.inputs;
      if (currentPagePoint) {
        socket.emit('canvas:cursor', {
          projectId,
          position: {
            x: currentPagePoint.x,
            y: currentPagePoint.y,
          },
        });
      }
    };

    // Debounce cursor broadcasts to every 100ms
    const handlePointerMove = () => {
      if (cursorTimeout) {
        clearTimeout(cursorTimeout);
      }
      cursorTimeout = setTimeout(broadcastCursor, 100);
    };

    const container = editor.getContainer();
    container.addEventListener('pointermove', handlePointerMove);

    return () => {
      if (cursorTimeout) {
        clearTimeout(cursorTimeout);
      }
      container.removeEventListener('pointermove', handlePointerMove);
    };
  }, [socket, isConnected, editor, projectId]);

  // Join/leave project room
  useEffect(() => {
    if (!socket || !isConnected || !editor) return;

    socket.emit('join-project', projectId);

    return () => {
      socket.emit('leave-project', projectId);
      // Save one final time when leaving
      saveCanvasState();
    };
  }, [socket, isConnected, editor, projectId, saveCanvasState]);

  return (
    <div className="w-full h-full">
      <Tldraw
        onMount={(editor) => {
          setEditor(editor);
        }}
      />
    </div>
  );
}
