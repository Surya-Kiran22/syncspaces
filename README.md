# SyncSpace

## Real-Time Collaborative Whiteboard & Code Editor

SyncSpace is a real-time collaborative developer tool that allows multiple users to work together in the same session. Users can simultaneously draw on a shared whiteboard and write code in a shared code editor.

The system uses WebSockets for real-time communication and CRDT-based synchronization to handle concurrent changes without data conflicts or overwriting.

## Project Domain

Developer Tools & Real-Time Collaboration

## Key Features

- Real-time collaborative whiteboard
- Real-time collaborative code editor
- Multiple users can collaborate simultaneously
- Real-time communication using WebSockets
- Conflict-free concurrent editing using CRDTs
- Isolated collaborative rooms
- User cursor and awareness synchronization
- Persistent collaborative session state
- JWT-based authentication and access control
- Session history replay

## Technology Stack

### Frontend
- React.js
- Yjs
- Konva.js / Fabric.js
- Monaco Editor

### Backend
- Node.js
- Express.js
- Socket.io

### Database
- MongoDB

### Synchronization
- WebSockets
- Socket.io
- Yjs
- CRDT (Conflict-free Replicated Data Types)

### Authentication
- JWT (JSON Web Token)

## Main Modules

### 1. Real-Time Sync Engine
Uses WebSockets and Socket.io for low-latency, bi-directional communication between connected users.

### 2. CRDT Implementation
Yjs is used to handle concurrent document editing and conflict resolution.

### 3. Interactive Canvas
React with Konva.js / Fabric.js is used to provide a 2D collaborative whiteboard for drawing shapes, lines, and text.

### 4. Code Editor
Monaco Editor is integrated into the React frontend for collaborative code editing.

## Development Plan

### Week 1
- Set up Express and Socket.io
- Create isolated collaborative rooms
- Build React split-screen layout
- Whiteboard on the left
- Code Editor on the right

### Week 2
- Integrate Yjs and awareness
- Implement collaborative canvas functionality
- Synchronize drawing and user cursors

### Week 3
- Connect Yjs with MongoDB for persistence
- Integrate Monaco Editor
- Enable simultaneous code editing

### Week 4
- Implement JWT authentication
- Add room access control
- Add session replay functionality

## Project Goal

The goal of SyncSpace is to demonstrate advanced MERN stack engineering with real-time collaboration, CRDT-based synchronization, interactive canvas functionality, and collaborative code editing.
