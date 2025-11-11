# Socket.io Real-Time Collaboration Implementation

This document describes the Socket.io implementation for real-time collaboration features in the Synkora platform.

## Overview

The Socket.io infrastructure provides:
- **Authenticated WebSocket connections** using NextAuth tokens
- **Room-based architecture** (one room per project)
- **Automatic reconnection** with exponential backoff
- **Connection health monitoring** via ping/pong
- **User presence tracking** with active user lists
- **Typing indicators** for collaborative editing
- **Real-time event broadcasting** for tasks, canvas, markdown, and spreadsheet

## Architecture

### Server (server.js)

The Socket.io server runs alongside the Next.js application and provides:

1. **Authentication Middleware**: Validates NextAuth JWT tokens before allowing connections
2. **Room Management**: Tracks active users per project room
3. **Event Broadcasting**: Relays events to all users in a project room
4. **Connection Health**: Implements ping/pong for connection monitoring

### Client (lib/socket.ts)

The client library provides:

1. **Singleton Socket Instance**: Ensures only one connection per client
2. **Automatic Reconnection**: Exponential backoff with configurable max attempts
3. **Token-based Authentication**: Uses NextAuth session token
4. **Helper Functions**: `joinProject`, `leaveProject`, `ping`, etc.

### React Hook (hooks/use-socket.ts)

The `useSocket` hook provides:

1. **Connection State Management**: `isConnected`, `isReconnecting`
2. **Active Users Tracking**: List of users in the current project
3. **Automatic Room Management**: Joins/leaves rooms based on projectId
4. **Health Monitoring**: Periodic ping checks
5. **State Synchronization**: Handles reconnection and state sync

## Usage

### Basic Connection

```tsx
import { useSocket } from "@/hooks/use-socket";

function MyComponent({ projectId }: { projectId: string }) {
    const { socket, isConnected, activeUsers } = useSocket({
        projectId,
        autoConnect: true,
    });

    // Use socket to emit/listen to events
    useEffect(() => {
        if (!socket) return;

        socket.on("task:create", (task) => {
            console.log("New task created:", task);
        });

        return () => {
            socket.off("task:create");
        };
    }, [socket]);

    return (
        <div>
            <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
            <p>Active Users: {activeUsers.length}</p>
        </div>
    );
}
```

### Connection Status Indicator

```tsx
import { ConnectionStatus } from "@/components/ui/connection-status";
import { useSocket } from "@/hooks/use-socket";

function MyComponent({ projectId }: { projectId: string }) {
    const { isConnected, isReconnecting } = useSocket({ projectId });

    return (
        <ConnectionStatus
            isConnected={isConnected}
            isReconnecting={isReconnecting}
            showText={true}
        />
    );
}
```

### User Presence

```tsx
import { UserPresence } from "@/components/project/user-presence";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "next-auth/react";

function MyComponent({ projectId }: { projectId: string }) {
    const { data: session } = useSession();
    const { activeUsers } = useSocket({ projectId });

    return (
        <UserPresence
            users={activeUsers}
            currentUserId={session?.user?.id}
        />
    );
}
```

### Typing Indicators

```tsx
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { MultipleTypingIndicator } from "@/components/ui/typing-indicator";
import { useSocket } from "@/hooks/use-socket";

function MarkdownEditor({ projectId, fileId }: { projectId: string; fileId: string }) {
    const { socket } = useSocket({ projectId });
    const { typingUsers, emitTyping, stopTyping } = useTypingIndicator({
        socket,
        projectId,
        context: `markdown:${fileId}`,
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        emitTyping();
        // Handle content change...
    };

    const handleBlur = () => {
        stopTyping();
    };

    return (
        <div>
            <textarea onChange={handleChange} onBlur={handleBlur} />
            <MultipleTypingIndicator
                userNames={typingUsers.map((u) => u.userName)}
            />
        </div>
    );
}
```

### Complete Project Collaboration Component

```tsx
import { ProjectCollaboration } from "@/components/project/project-collaboration";

function ProjectPage({ projectId }: { projectId: string }) {
    return (
        <div>
            <header>
                <h1>My Project</h1>
                <ProjectCollaboration projectId={projectId} />
            </header>
            {/* Rest of project content */}
        </div>
    );
}
```

## Events

### Connection Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `connected` | Server → Client | `{ socketId, userId, timestamp }` | Connection confirmation |
| `join-project` | Client → Server | `projectId` | Join a project room |
| `leave-project` | Client → Server | `projectId` | Leave a project room |
| `ping` | Client → Server | - | Health check |
| `pong` | Server → Client | `{ timestamp }` | Health check response |

### Presence Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `user:joined` | Server → Client | `{ socketId, userId, userName, userImage, timestamp }` | User joined project |
| `user:left` | Server → Client | `{ socketId, userId, userName, timestamp }` | User left project |
| `users:active` | Server → Client | `{ users: [], count }` | List of active users |
| `users:count` | Server → Client | `{ count }` | Active user count |

### Typing Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `typing:start` | Client → Server | `{ projectId, context, timestamp }` | User started typing |
| `typing:stop` | Client → Server | `{ projectId, context }` | User stopped typing |
| `typing:start` | Server → Client | `{ socketId, userId, userName, context, timestamp }` | Broadcast typing start |
| `typing:stop` | Server → Client | `{ socketId, userId, context }` | Broadcast typing stop |

### Task Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `task:create` | Client → Server | `{ projectId, task }` | Create new task |
| `task:update` | Client → Server | `{ projectId, task }` | Update task |
| `task:delete` | Client → Server | `{ projectId, taskId }` | Delete task |
| `task:move` | Client → Server | `{ projectId, taskId, status }` | Move task to new status |

### Canvas Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `canvas:update` | Client → Server | `{ projectId, changes }` | Canvas object changed |
| `canvas:cursor` | Client → Server | `{ projectId, position }` | Cursor position update |

### Markdown Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `markdown:update` | Client → Server | `{ projectId, fileId, content }` | Markdown content changed |
| `markdown:cursor` | Client → Server | `{ projectId, fileId, position }` | Cursor position update |

### Spreadsheet Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `spreadsheet:cell-update` | Client → Server | `{ projectId, cell, value }` | Cell value changed |
| `spreadsheet:selection` | Client → Server | `{ projectId, selection }` | Cell selection changed |

## Configuration

### Environment Variables

```env
# Socket.io server URL (client-side)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# NextAuth secret (required for token verification)
NEXTAUTH_SECRET=your-secret-key

# NextAuth URL (for CORS)
NEXTAUTH_URL=http://localhost:3000
```

### Server Configuration

The Socket.io server is configured in `server.js`:

```javascript
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXTAUTH_URL || `http://${hostname}:${port}`,
        methods: ["GET", "POST"],
        credentials: true,
    },
    pingTimeout: 60000,      // 60 seconds
    pingInterval: 25000,     // 25 seconds
});
```

### Client Configuration

The Socket.io client is configured in `lib/socket.ts`:

```typescript
const socket = io(url, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,        // 1 second
    reconnectionDelayMax: 30000,    // 30 seconds
    reconnectionAttempts: Infinity,
    auth: {
        token: token || "",
    },
});
```

## Best Practices

1. **Always use the `useSocket` hook** instead of directly accessing the socket instance
2. **Clean up event listeners** in useEffect return functions
3. **Debounce high-frequency events** (typing, cursor movement, canvas drawing)
4. **Handle reconnection gracefully** by re-syncing state when connection is restored
5. **Validate data** on both client and server before broadcasting
6. **Use room-based broadcasting** to limit event scope to relevant users
7. **Implement optimistic updates** for better UX, with rollback on error

## Troubleshooting

### Connection Issues

If users can't connect:
1. Check that the Socket.io server is running (`node server.js`)
2. Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
3. Check browser console for authentication errors
4. Ensure NextAuth session is valid

### Reconnection Problems

If reconnection fails:
1. Check network connectivity
2. Verify server is running and accessible
3. Check for authentication token expiration
4. Review server logs for connection errors

### Events Not Broadcasting

If events aren't received:
1. Verify users are in the same project room
2. Check event names match exactly
3. Ensure socket is connected before emitting
4. Review server logs for event handling errors

## Performance Considerations

1. **Debounce typing events**: Use 300ms debounce to reduce network traffic
2. **Batch updates**: Group multiple changes into single events when possible
3. **Limit active user list**: Show max 5 avatars, with "+N more" indicator
4. **Clean up empty rooms**: Server automatically removes rooms with no users
5. **Use delta updates**: Send only changed data, not full state

## Security

1. **Authentication required**: All connections must provide valid NextAuth token
2. **Room isolation**: Users can only join rooms for projects they have access to
3. **Event validation**: Server validates all incoming events
4. **Rate limiting**: Consider adding rate limits for high-frequency events
5. **Token refresh**: Handle token expiration and refresh gracefully

## Future Enhancements

- [ ] Add cursor position sharing for collaborative editing
- [ ] Implement operational transformation for conflict resolution
- [ ] Add voice/video chat integration
- [ ] Implement file sharing via WebRTC
- [ ] Add screen sharing capabilities
- [ ] Implement collaborative code editing
- [ ] Add real-time notifications
- [ ] Implement presence awareness (away, busy, etc.)
