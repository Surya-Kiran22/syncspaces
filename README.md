# 🔐 Module M1: JWT Authentication Backend (Week 4)

This repository contains **Module M1 (JWT Authentication Backend)** for the SyncSpace collaborative workspace platform.

---

## 🛠️ 5-Day Progressive Development Roadmap for Week 4 — Module M1

| Day | Progress | Module Focus & Deliverables | Status |
| :---: | :---: | :--- | :---: |
| **Day 1** | **20%** | **Express Server Scaffolding & MongoDB Connection (0% - 20%)**<br>Initialize `server/package.json`, install dependencies (Express, Mongoose, dotenv, cors, jsonwebtoken, bcryptjs), create Express entry point (`server/src/index.js`), set up environment variables, and configure MongoDB connection (`server/src/config/db.js`). | **Completed & Pushed ✅** |
| **Day 2** | **40%** | **User Model & Authentication Routes Scaffolding (21% - 40%)**<br>Define Mongoose `User` schema (name, email, password), password hashing pre-save hooks, and scaffold `/api/auth/register` and `/api/auth/login` Express routes. | **Completed & Pushed ✅** |
| **Day 3** | **60%** | **JWT Sign & Verify Controllers (41% - 60%)**<br>Implement registration and login controller logic, JWT token generation (`generateToken`), payload configuration, and password comparison logic. | *Upcoming* |
| **Day 4** | **80%** | **Auth Middleware & Protected Routes (61% - 80%)**<br>Implement `protect` JWT verification middleware (`server/src/middleware/authMiddleware.js`), extract user from token payload, and create a protected `/api/auth/profile` route to test token validity. | *Upcoming* |
| **Day 5** | **100%** | **Client-side Integration & Final Verification (81% - 100%)**<br>Frontend API service for authentication calls, secure token storage in `localStorage` or cookies, and end-to-end backend verification. | *Upcoming* |

---

## ⚡ Day 1 (0% - 20% Code) Deliverable Summary

- Initialized backend Node.js environment in `server/`.
- Configured Express server in `server/src/index.js`.
- Set up MongoDB connection config in `server/src/config/db.js` using Mongoose.
- Added `.env` variables for `PORT`, `MONGO_URI`, and `JWT_SECRET`.
- Verified server starts and connects to MongoDB successfully.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB locally installed or MongoDB Atlas URI

### Quick Start

```bash
# 1. Navigate to server
cd server

# 2. Install dependencies
npm install

# 3. Create .env file with your MONGO_URI
# MONGO_URI=mongodb://localhost:27017/syncspace_auth
# PORT=5000
# JWT_SECRET=supersecret

# 4. Run Development Server
npm run dev
```
