# 🚀 SyncSpace — Real-Time Collaborative Workspace

SyncSpace is an advanced real-time collaborative workspace platform combining a multi-user interactive whiteboard (**Astra Galaxy Canvas**), collaborative code editor powered by **Monaco Editor** and **Yjs CRDTs**, multi-language code execution engine, session replay, and room access control.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Monaco Editor
- **Backend:** Node.js, Express.js, Socket.io, Yjs CRDT Engine
- **Database:** MongoDB Atlas, Mongoose ODM
- **Deployment:** Render Blueprint (`render.yaml`)

---

## 📅 20-Day Progressive Development Roadmap

| Day | Module / Focus Area | Core Deliverables |
| :--- | :--- | :--- |
| **Day 1** | **Project Setup & Base Scaffolding** | Repository initialization, root build scripts, package structure, and foundational setup. |
| **Day 2** | **Express Backend Infrastructure** | HTTP Express server initialization, environment configuration, CORS, and health API routes. |
| **Day 3** | **Frontend Vite React Foundation** | Vite React app setup, CSS styling, layout containers, and main Header component. |
| **Day 4** | **Database Configuration & Models** | MongoDB Atlas connection logic (`db.js`) and Mongoose User model schema. |
| **Day 5** | **Socket.io Core Server & Client** | Socket.io server engine and frontend `SocketContext` provider integration. |
| **Day 6** | **Room Management API** | Mongoose Room Model, room creation/joining controllers, and REST routes (`/api/rooms`). |
| **Day 7** | **Socket Room Join & Routing** | WebSocket `roomHandler.js`, real-time join/leave notifications, and room occupancy lists. |
| **Day 8** | **User Presence & Cursor Sync** | Active user list tracking, avatar presence indicators, and live cursor position broadcasting. |
| **Day 9** | **Canvas & Editor Split View** | Workspace split-pane component (`SplitLayout.jsx`) enabling side-by-side canvas and code editor. |
| **Day 10** | **Astra Galaxy Canvas Engine** | Custom HTML5 Canvas engine supporting pencil drawing, shapes (rectangle, circle, line), and text nodes. |
| **Day 11** | **Yjs Whiteboard CRDT Integration** | Multi-client canvas shape sync via Yjs CRDT (`useYjsCanvas.js`) with conflict resolution. |
| **Day 12** | **Monaco Code Editor UI** | Monaco Editor integration with language selection (JavaScript, Python, C++, Java) and theme configuration. |
| **Day 13** | **Yjs CRDT Collaborative Code Sync** | Real-time concurrent code editing via Yjs `Y.Text` CRDT bindings (`useYjsCode.js`). |
| **Day 14** | **Server-side Yjs MongoDB Persistence** | Yjs binary document persistence service (`yjsPersistence.js`) and auto-snapshot save handler. |
| **Day 15** | **Multi-Language Execution Engine** | Code execution backend route (`/api/execute`) and client console execution output pane. |
| **Day 16** | **User Authentication & Authorization** | User signup and login authentication endpoints with Bcrypt password hashing and JWT token issuance. |
| **Day 17** | **Socket.io JWT Authentication** | Socket connection security middleware (`auth.js`) and room-level authorization enforcement. |
| **Day 18** | **Session Replay Backend Storage** | Snapshot timeline schema (`Snapshot.js`) and interval snapshot storage controller (`replayController.js`). |
| **Day 19** | **Session Replay UI & Controls** | Timeline scrub control bar (`ReplayBar.jsx`) with playback controls (play, pause, step). |
| **Day 20** | **QA Test Suite & Deployment** | End-to-end automated testing suite (`tests/`), light theme UI polish, and Render deployment setup. |

---

## ⚡ Day 1 Deliverable Summary

- Initialized repository architecture with root `package.json`, `.gitignore`, and `render.yaml`.
- Configured Express server entry points and Vite React client scaffolding.
- Defined 20-Day Progressive Development Breakdown roadmap.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Instance / URI

### Quick Start

```bash
# 1. Install root & child dependencies
npm run build:all

# 2. Start Backend Server
cd server
npm run dev

# 3. Start Frontend Client (in a separate terminal)
cd client
npm run dev
```
