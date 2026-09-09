import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const getSocketServerUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin;
    }
  }
  return 'http://localhost:5000';
};

const SOCKET_SERVER_URL = getSocketServerUrl();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [replaySnapshot, setReplaySnapshot] = useState(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected with ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('room-users-updated', ({ roomId, users }) => {
      setRoomUsers(users);
    });

    socketInstance.on('user-joined', ({ username }) => {
      showToast(`${username} joined the room`);
    });

    socketInstance.on('user-left', ({ username }) => {
      showToast(`${username} left the room`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const joinRoom = (roomId, username) => {
    if (!socket || !roomId || !username) return;

    const normalizedRoom = roomId.trim().toUpperCase();
    const userPayload = { username: username.trim() };

    setCurrentUser({ ...userPayload, socketId: socket.id });
    setCurrentRoom(normalizedRoom);

    socket.emit('join-room', {
      roomId: normalizedRoom,
      username: username.trim(),
    });
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave-room');
    }
    setCurrentRoom(null);
    setCurrentUser(null);
    setRoomUsers([]);
    setReplaySnapshot(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        currentRoom,
        currentUser,
        roomUsers,
        joinRoom,
        leaveRoom,
        notification,
        replaySnapshot,
        setReplaySnapshot,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
