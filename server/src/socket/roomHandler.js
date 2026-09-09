import * as Y from 'yjs';
import { loadRoomYDocFromMongoDB, saveRoomYDocToMongoDB } from '../services/yjsPersistence.js';
import { recordSnapshot } from '../controllers/replayController.js';

const roomUsersMap = new Map();
const roomYDocsMap = new Map();

const USER_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#14B8A6'
];

const getRandomColor = () => {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
};

export const getOrCreateRoomYDoc = async (roomId) => {
  const normalizedId = roomId.trim().toUpperCase();
  if (!roomYDocsMap.has(normalizedId)) {
    const doc = new Y.Doc();
    roomYDocsMap.set(normalizedId, doc);
    await loadRoomYDocFromMongoDB(normalizedId, doc);
  }
  return roomYDocsMap.get(normalizedId);
};

export const registerRoomHandlers = (io, socket) => {
  /**
   * Client joins room
   */
  socket.on('join-room', async ({ roomId, username }) => {
    if (!roomId || !username) return;

    const normalizedRoomId = roomId.trim().toUpperCase();
    const cleanUsername = username.trim();

    if (socket.currentRoom && socket.currentRoom !== normalizedRoomId) {
      handleLeaveRoom(socket, io);
    }

    socket.join(normalizedRoomId);
    socket.currentRoom = normalizedRoomId;

    if (!roomUsersMap.has(normalizedRoomId)) {
      roomUsersMap.set(normalizedRoomId, new Map());
    }

    const roomUsers = roomUsersMap.get(normalizedRoomId);
    const userColor = getRandomColor();

    const userInfo = {
      socketId: socket.id,
      username: cleanUsername,
      color: userColor,
      cursor: null,
      joinedAt: new Date().toISOString()
    };

    roomUsers.set(socket.id, userInfo);
    socket.userInfo = userInfo;

    console.log(`[Socket] User '${cleanUsername}' (${socket.id}) joined room '${normalizedRoomId}'`);

    const userList = Array.from(roomUsers.values());
    
    io.to(normalizedRoomId).emit('room-users-updated', {
      roomId: normalizedRoomId,
      users: userList
    });

    socket.to(normalizedRoomId).emit('user-joined', {
      username: cleanUsername,
      user: userInfo
    });

    // Initial state setup and immediate MongoDB room state persistence
    const doc = await getOrCreateRoomYDoc(normalizedRoomId);
    await saveRoomYDocToMongoDB(normalizedRoomId, doc);

    const shapesArray = doc.getArray('shapes').toArray();
    const codeText = doc.getText('codetext').toString();
    await recordSnapshot(normalizedRoomId, shapesArray, codeText, 'room_init', cleanUsername);

    socket.emit('canvas-initial-state', { shapes: shapesArray });
    socket.emit('code-initial-state', { code: codeText });
  });

  /**
   * Canvas Shape Update Handler & Snapshot Recorder
   */
  socket.on('canvas-shapes-update', async ({ roomId, shapes, action }) => {
    if (!roomId) return;
    const normalizedRoomId = roomId.trim().toUpperCase();

    const doc = await getOrCreateRoomYDoc(normalizedRoomId);
    const yShapes = doc.getArray('shapes');

    doc.transact(() => {
      yShapes.delete(0, yShapes.length);
      yShapes.insert(0, shapes);
    });

    await saveRoomYDocToMongoDB(normalizedRoomId, doc);
    const codeText = doc.getText('codetext').toString();
    await recordSnapshot(normalizedRoomId, shapes, codeText, 'canvas_draw', socket.userInfo?.username);

    socket.to(normalizedRoomId).emit('canvas-shapes-remote-update', {
      shapes,
      action,
      updatedBy: socket.userInfo?.username
    });
  });

  /**
   * Collaborative Code Editor Sync Handler & Snapshot Recorder
   */
  socket.on('code-text-update', async ({ roomId, code, language }) => {
    if (!roomId) return;
    const normalizedRoomId = roomId.trim().toUpperCase();

    const doc = await getOrCreateRoomYDoc(normalizedRoomId);
    const yText = doc.getText('codetext');

    doc.transact(() => {
      yText.delete(0, yText.length);
      yText.insert(0, code);
    });

    await saveRoomYDocToMongoDB(normalizedRoomId, doc, language);
    const shapesArray = doc.getArray('shapes').toArray();
    await recordSnapshot(normalizedRoomId, shapesArray, code, 'code_edit', socket.userInfo?.username);

    socket.to(normalizedRoomId).emit('code-text-remote-update', {
      code,
      language,
      updatedBy: socket.userInfo?.username
    });
  });

  /**
   * Live Awareness Cursor Position Handler
   */
  socket.on('cursor-move', ({ roomId, x, y }) => {
    if (!roomId || !socket.userInfo) return;
    const normalizedRoomId = roomId.trim().toUpperCase();

    socket.userInfo.cursor = { x, y };

    socket.to(normalizedRoomId).emit('remote-cursor-moved', {
      socketId: socket.id,
      username: socket.userInfo.username,
      color: socket.userInfo.color,
      cursor: { x, y }
    });
  });

  /**
   * Client leaves room explicitly
   */
  socket.on('leave-room', () => {
    handleLeaveRoom(socket, io);
  });

  /**
   * Socket disconnected
   */
  socket.on('disconnect', () => {
    handleLeaveRoom(socket, io);
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
};

const handleLeaveRoom = (socket, io) => {
  const roomId = socket.currentRoom;
  if (!roomId || !roomUsersMap.has(roomId)) return;

  const roomUsers = roomUsersMap.get(roomId);
  const user = roomUsers.get(socket.id);

  if (user) {
    roomUsers.delete(socket.id);
    socket.leave(roomId);

    console.log(`[Socket] User '${user.username}' left room '${roomId}'`);

    const userList = Array.from(roomUsers.values());
    
    io.to(roomId).emit('room-users-updated', {
      roomId,
      users: userList
    });

    io.to(roomId).emit('user-left', {
      username: user.username,
      socketId: socket.id
    });

    io.to(roomId).emit('remote-cursor-removed', {
      socketId: socket.id
    });

    if (roomUsers.size === 0) {
      roomUsersMap.delete(roomId);
    }
  }

  socket.currentRoom = null;
};
