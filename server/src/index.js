import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import authRoutes from './routes/authRoutes.js';
import executeRoutes from './routes/executeRoutes.js';
import { registerRoomHandlers } from './socket/roomHandler.js';
import { socketAuthMiddleware } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// REST API Endpoints
app.use('/api/health', healthRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/execute', executeRoutes);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach Socket Auth Middleware if auth token provided or REQUIRE_AUTH is true
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token || process.env.REQUIRE_AUTH === 'true') {
    return socketAuthMiddleware(socket, next);
  }
  next();
});

// Socket Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  registerRoomHandlers(io, socket);
});

// Serve React Frontend Production Build Assets on Render / Single Web Service
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  
  // Wildcard SPA Fallback Handler
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('SyncSpace API Server is Active');
  });
}

// Global 404 & Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start HTTP Server
httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SyncSpace Backend running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

export { app, io };
