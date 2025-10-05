# Socket.IO Implementation

This document describes the Socket.IO implementation for real-time communication in the Task Manager application.

## Overview

Socket.IO has been integrated to provide real-time updates for:
- Project updates
- Task changes
- User presence (join/leave notifications)
- Live collaboration features

## Authentication

The Socket.IO connection is secured with JWT authentication:
- Tokens are sent via the `auth.token` parameter during connection
- Fallback to Authorization header or query parameter if needed
- Invalid or expired tokens result in connection rejection
- Only authenticated users can connect to the socket server

## Backend Implementation

### Files Added/Modified:

1. **`backend/package.json`** - Added `socket.io` dependency
2. **`backend/src/middlewares/socket.auth.middleware.js`** - Socket authentication middleware
3. **`backend/src/services/socket.service.js`** - Main Socket.IO service
4. **`backend/src/server.js`** - Integrated Socket.IO with HTTP server

### Key Features:

- **Authentication Middleware**: Verifies JWT tokens for all socket connections
- **Room Management**: Users can join/leave project-specific rooms
- **Event Broadcasting**: Real-time updates for projects and tasks
- **User Presence**: Track when users join/leave projects
- **Error Handling**: Comprehensive error handling for authentication and connection issues

### Available Events:

**Client → Server:**
- `join-project` - Join a project room
- `leave-project` - Leave a project room
- `project-update` - Broadcast project changes
- `task-update` - Broadcast task changes
- `user-presence` - Update user presence status

**Server → Client:**
- `connected` - Connection confirmation
- `project-updated` - Project change notifications
- `task-updated` - Task change notifications
- `user-joined` - User joined project notification
- `user-left` - User left project notification
- `user-presence-changed` - User presence updates
- `error` - Error notifications

## Frontend Implementation

### Files Added/Modified:

1. **`frontend/package.json`** - Added `socket.io-client` dependency
2. **`frontend/src/services/socketService.js`** - Socket client service
3. **`frontend/src/hooks/useSocket.js`** - React hooks for Socket.IO
4. **`frontend/src/pages/projects/ProjectDetail.jsx`** - Integrated real-time updates
5. **`frontend/src/components/ProjectBoardHeader.jsx`** - Added connection status indicator
6. **`frontend/src/components/examples/SocketIODemo.jsx`** - Demo component for testing

### Key Features:

- **Automatic Connection**: Connects when user is authenticated
- **Room Management**: Automatically joins/leaves project rooms
- **Real-time Updates**: Listens for and displays real-time notifications
- **Connection Status**: Visual indicator of connection status
- **Error Handling**: Graceful handling of connection issues
- **Reconnection**: Automatic reconnection with exponential backoff

### React Hooks:

1. **`useSocket()`** - Main hook for socket functionality
2. **`useSocketEvent(eventName, callback, deps)`** - Listen to specific events
3. **`useProjectSocket(projectId)`** - Project-specific socket functionality

## Usage Examples

### Basic Socket Connection:

```jsx
import { useSocket } from '../hooks/useSocket';

function MyComponent() {
  const { isConnected, socket } = useSocket();
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### Listening to Events:

```jsx
import { useSocketEvent } from '../hooks/useSocket';

function MyComponent() {
  useSocketEvent('project-updated', (data) => {
    console.log('Project updated:', data);
  });
  
  return <div>Listening for updates...</div>;
}
```

### Project-specific Socket:

```jsx
import { useProjectSocket } from '../hooks/useSocket';

function ProjectComponent({ projectId }) {
  const { broadcastProjectUpdate, broadcastTaskUpdate } = useProjectSocket(projectId);
  
  const handleUpdate = () => {
    broadcastProjectUpdate('column-added', { columnId: '123' });
  };
  
  return <button onClick={handleUpdate}>Update Project</button>;
}
```

## Testing

Use the `SocketIODemo` component to test the implementation:

1. Navigate to a project page
2. Open the demo component (you can add it to any page)
3. Open another browser tab with the same project
4. Send test messages and see real-time updates

## Security Considerations

- All socket connections require valid JWT authentication
- Users can only join rooms for projects they have access to
- Event broadcasting is scoped to project rooms
- Invalid tokens result in immediate disconnection
- No sensitive data is exposed through socket events

## Environment Variables

Make sure these environment variables are set:

- `FRONTEND_URL` - Frontend URL for CORS configuration
- `JWT_SECRET` - JWT secret for token verification
- `VITE_API_URL` - Backend API URL (for frontend)

## Troubleshooting

### Connection Issues:
1. Check if user is authenticated (has valid token)
2. Verify backend server is running
3. Check CORS configuration
4. Verify environment variables

### Authentication Errors:
1. Check token validity and expiration
2. Verify JWT secret matches between client and server
3. Ensure user exists in database

### Event Not Received:
1. Verify user is in the correct project room
2. Check event name spelling
3. Verify event is being emitted from the correct room

## Future Enhancements

Potential improvements for the Socket.IO implementation:

1. **Typing Indicators** - Show when users are typing
2. **Cursor Sharing** - Share cursor positions in real-time
3. **File Upload Progress** - Real-time file upload progress
4. **Notification System** - Push notifications for important events
5. **Presence Management** - More detailed user presence (online/away/busy)
6. **Rate Limiting** - Prevent spam and abuse
7. **Message History** - Store and retrieve message history
8. **Private Messaging** - Direct user-to-user communication
