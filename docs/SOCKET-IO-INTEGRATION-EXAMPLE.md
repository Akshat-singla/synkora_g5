# Socket.io Integration Example

This document provides a complete example of integrating the Socket.io infrastructure into a project page.

## Complete Project Layout Example

```tsx
// app/projects/[projectId]/layout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/use-socket";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { UserPresence } from "@/components/project/user-presence";
import { ProjectTabs } from "@/components/project/project-tabs";
import { ProjectHeader } from "@/components/project/project-header";

export default function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { projectId: string };
}) {
    const { data: session } = useSession();
    const { isConnected, isReconnecting, activeUsers } = useSocket({
        projectId: params.projectId,
        autoConnect: true,
    });

    return (
        <div className="flex flex-col h-screen">
            {/* Header with collaboration features */}
            <header className="border-b p-4">
                <div className="flex items-center justify-between">
                    <ProjectHeader projectId={params.projectId} />
                    
                    <div className="flex items-center gap-4">
                        <ConnectionStatus
                            isConnected={isConnected}
                            isReconnecting={isReconnecting}
                        />
                        <UserPresence
                            users={activeUsers}
                            currentUserId={session?.user?.id}
                        />
                    </div>
                </div>
                
                <ProjectTabs projectId={params.projectId} />
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
```

## Kanban Board with Real-time Updates

```tsx
// app/projects/[projectId]/kanban/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Task } from "@prisma/client";

export default function KanbanPage({
    params,
}: {
    params: { projectId: string };
}) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { socket, isConnected } = useSocket({
        projectId: params.projectId,
    });

    // Fetch initial tasks
    useEffect(() => {
        fetch(`/api/projects/${params.projectId}/tasks`)
            .then((res) => res.json())
            .then((data) => setTasks(data));
    }, [params.projectId]);

    // Listen for real-time task updates
    useEffect(() => {
        if (!socket) return;

        const handleTaskCreate = (task: Task) => {
            setTasks((prev) => [...prev, task]);
        };

        const handleTaskUpdate = (updatedTask: Task) => {
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            );
        };

        const handleTaskDelete = ({ taskId }: { taskId: string }) => {
            setTasks((prev) => prev.filter((task) => task.id !== taskId));
        };

        socket.on("task:create", handleTaskCreate);
        socket.on("task:update", handleTaskUpdate);
        socket.on("task:delete", handleTaskDelete);

        return () => {
            socket.off("task:create", handleTaskCreate);
            socket.off("task:update", handleTaskUpdate);
            socket.off("task:delete", handleTaskDelete);
        };
    }, [socket]);

    // Emit task updates
    const handleTaskMove = async (taskId: string, newStatus: string) => {
        // Optimistic update
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );

        try {
            // Update in database
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const updatedTask = await response.json();

            // Broadcast to other users
            if (socket?.connected) {
                socket.emit("task:update", {
                    projectId: params.projectId,
                    task: updatedTask,
                });
            }
        } catch (error) {
            // Rollback on error
            console.error("Failed to update task:", error);
            // Refetch tasks to get correct state
            fetch(`/api/projects/${params.projectId}/tasks`)
                .then((res) => res.json())
                .then((data) => setTasks(data));
        }
    };

    return (
        <div className="p-6">
            <KanbanBoard
                tasks={tasks}
                onTaskMove={handleTaskMove}
                projectId={params.projectId}
            />
        </div>
    );
}
```

## Markdown Editor with Typing Indicators

```tsx
// app/projects/[projectId]/markdown/[fileId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { MultipleTypingIndicator } from "@/components/ui/typing-indicator";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";

export default function MarkdownFilePage({
    params,
}: {
    params: { projectId: string; fileId: string };
}) {
    const [content, setContent] = useState("");
    const { socket } = useSocket({ projectId: params.projectId });
    const { typingUsers, emitTyping, stopTyping } = useTypingIndicator({
        socket,
        projectId: params.projectId,
        context: `markdown:${params.fileId}`,
    });

    // Fetch initial content
    useEffect(() => {
        fetch(`/api/markdown/${params.fileId}`)
            .then((res) => res.json())
            .then((data) => setContent(data.content));
    }, [params.fileId]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleMarkdownUpdate = (data: {
            fileId: string;
            content: string;
        }) => {
            if (data.fileId === params.fileId) {
                setContent(data.content);
            }
        };

        socket.on("markdown:update", handleMarkdownUpdate);

        return () => {
            socket.off("markdown:update", handleMarkdownUpdate);
        };
    }, [socket, params.fileId]);

    // Handle content changes
    const handleChange = (newContent: string) => {
        setContent(newContent);
        emitTyping();

        // Debounce the actual save and broadcast
        const timeoutId = setTimeout(() => {
            saveContent(newContent);
        }, 1000);

        return () => clearTimeout(timeoutId);
    };

    const saveContent = async (newContent: string) => {
        try {
            await fetch(`/api/markdown/${params.fileId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newContent }),
            });

            // Broadcast to other users
            if (socket?.connected) {
                socket.emit("markdown:update", {
                    projectId: params.projectId,
                    fileId: params.fileId,
                    content: newContent,
                });
            }
        } catch (error) {
            console.error("Failed to save markdown:", error);
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 border-r">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Editor</h2>
                    <MultipleTypingIndicator
                        userNames={typingUsers.map((u) => u.userName)}
                    />
                </div>
                <MarkdownEditor
                    content={content}
                    onChange={handleChange}
                    onBlur={stopTyping}
                />
            </div>
            <div className="flex-1">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Preview</h2>
                </div>
                <MarkdownPreview content={content} />
            </div>
        </div>
    );
}
```

## Canvas with Cursor Sharing

```tsx
// app/projects/[projectId]/canvas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { CollaborativeCanvas } from "@/components/canvas/collaborative-canvas";

interface CursorPosition {
    socketId: string;
    userId: string;
    userName: string;
    x: number;
    y: number;
}

export default function CanvasPage({
    params,
}: {
    params: { projectId: string };
}) {
    const [cursors, setCursors] = useState<CursorPosition[]>([]);
    const { socket, activeUsers } = useSocket({
        projectId: params.projectId,
    });

    // Listen for cursor updates
    useEffect(() => {
        if (!socket) return;

        const handleCursorUpdate = (data: {
            socketId: string;
            position: { x: number; y: number };
        }) => {
            const user = activeUsers.find((u) =>
                // Match by socketId or userId
                true // You'd need to track socket-to-user mapping
            );

            setCursors((prev) => {
                const filtered = prev.filter(
                    (c) => c.socketId !== data.socketId
                );
                return [
                    ...filtered,
                    {
                        socketId: data.socketId,
                        userId: user?.userId || "",
                        userName: user?.userName || "Unknown",
                        x: data.position.x,
                        y: data.position.y,
                    },
                ];
            });

            // Remove cursor after 3 seconds of inactivity
            setTimeout(() => {
                setCursors((prev) =>
                    prev.filter((c) => c.socketId !== data.socketId)
                );
            }, 3000);
        };

        socket.on("canvas:cursor", handleCursorUpdate);

        return () => {
            socket.off("canvas:cursor", handleCursorUpdate);
        };
    }, [socket, activeUsers]);

    // Emit cursor position
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (socket?.connected) {
            socket.emit("canvas:cursor", {
                projectId: params.projectId,
                position: {
                    x: e.clientX,
                    y: e.clientY,
                },
            });
        }
    };

    return (
        <div className="relative h-full" onMouseMove={handleMouseMove}>
            <CollaborativeCanvas projectId={params.projectId} />
            
            {/* Render other users' cursors */}
            {cursors.map((cursor) => (
                <div
                    key={cursor.socketId}
                    className="absolute pointer-events-none"
                    style={{
                        left: cursor.x,
                        top: cursor.y,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full" />
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            {cursor.userName}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
```

## Simple Integration (Minimal Setup)

If you just want basic real-time collaboration without all the bells and whistles:

```tsx
// app/projects/[projectId]/page.tsx
"use client";

import { ProjectCollaboration } from "@/components/project/project-collaboration";

export default function ProjectPage({
    params,
}: {
    params: { projectId: string };
}) {
    return (
        <div>
            <header className="flex items-center justify-between p-4 border-b">
                <h1 className="text-2xl font-bold">My Project</h1>
                <ProjectCollaboration projectId={params.projectId} />
            </header>
            
            <main className="p-6">
                {/* Your project content */}
            </main>
        </div>
    );
}
```

## Testing the Implementation

### 1. Start the Server

```bash
npm run dev
```

This starts both the Next.js app and Socket.io server on port 3000.

### 2. Open Multiple Browser Windows

Open the same project in multiple browser windows or tabs to test real-time collaboration.

### 3. Test Connection

- Check the connection status indicator (should show green "Connected")
- Open browser console to see connection logs
- Verify active users count updates when opening/closing tabs

### 4. Test Presence

- Click on the user presence indicator
- Verify all active users are listed
- Check that join times are displayed correctly
- Close a tab and verify the user is removed from the list

### 5. Test Typing Indicators

- Open a markdown editor in multiple windows
- Start typing in one window
- Verify typing indicator appears in other windows
- Stop typing and verify indicator disappears after 3 seconds

### 6. Test Reconnection

- Disconnect network (or pause in browser DevTools)
- Verify "Reconnecting..." status appears
- Reconnect network
- Verify connection is restored and user rejoins the room

## Common Issues and Solutions

### Issue: "Authentication required" error

**Solution**: Make sure you're logged in with NextAuth. The socket connection requires a valid session token.

```tsx
// Check if session exists before connecting
const { data: session } = useSession();

if (!session) {
    return <div>Please log in to collaborate</div>;
}
```

### Issue: Events not broadcasting

**Solution**: Ensure you're emitting events with the correct projectId:

```tsx
socket.emit("task:create", {
    projectId: params.projectId, // Must include projectId
    task: newTask,
});
```

### Issue: Multiple connections

**Solution**: The socket is a singleton, but make sure you're not calling `connectSocket` multiple times. Use the `useSocket` hook instead.

### Issue: Memory leaks

**Solution**: Always clean up event listeners in useEffect:

```tsx
useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
        // Handle event
    };

    socket.on("event:name", handler);

    return () => {
        socket.off("event:name", handler);
    };
}, [socket]);
```

## Performance Tips

1. **Debounce high-frequency events** (typing, cursor movement):
   ```tsx
   const debouncedEmit = debounce((data) => {
       socket.emit("event", data);
   }, 300);
   ```

2. **Use optimistic updates** for better UX:
   ```tsx
   // Update UI immediately
   setTasks([...tasks, newTask]);
   
   // Then save to server
   await saveTask(newTask);
   ```

3. **Batch updates** when possible:
   ```tsx
   // Instead of emitting for each cell
   socket.emit("spreadsheet:cell-update", { cell: "A1", value: 1 });
   socket.emit("spreadsheet:cell-update", { cell: "A2", value: 2 });
   
   // Batch them
   socket.emit("spreadsheet:batch-update", {
       cells: [
           { cell: "A1", value: 1 },
           { cell: "A2", value: 2 },
       ],
   });
   ```

4. **Limit active user list** to prevent UI clutter:
   ```tsx
   <ActiveUsers users={activeUsers} maxDisplay={5} />
   ```

## Next Steps

Now that Socket.io is set up, you can:

1. Implement real-time canvas collaboration (Task 11)
2. Add collaborative markdown editing (Task 12)
3. Build collaborative spreadsheet (Task 13)
4. Add real-time notifications
5. Implement voice/video chat (future enhancement)

All the infrastructure is in place - just use the `useSocket` hook and emit/listen to the appropriate events!
