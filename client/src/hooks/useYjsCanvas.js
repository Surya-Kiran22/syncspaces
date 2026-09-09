import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { useSocket } from '../context/SocketContext';

export const useYjsCanvas = () => {
  const { socket, currentRoom, currentUser } = useSocket();
  
  // Yjs doc ref
  const docRef = useRef(new Y.Doc());
  const [shapes, setShapes] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});

  // Sync state from Yjs doc to React state
  const syncShapesFromYjs = useCallback(() => {
    const yShapes = docRef.current.getArray('shapes');
    setShapes(yShapes.toArray());
  }, []);

  useEffect(() => {
    if (!socket || !currentRoom) return;

    const doc = docRef.current;
    const yShapes = doc.getArray('shapes');

    // Observer for local Yjs doc changes
    const observer = () => {
      syncShapesFromYjs();
    };

    yShapes.observe(observer);

    // Socket listener for initial state from server
    const handleInitialState = ({ shapes: initialShapes }) => {
      doc.transact(() => {
        yShapes.delete(0, yShapes.length);
        if (initialShapes && initialShapes.length > 0) {
          yShapes.insert(0, initialShapes);
        }
      });
      syncShapesFromYjs();
    };

    // Socket listener for remote shape updates
    const handleRemoteShapesUpdate = ({ shapes: updatedShapes }) => {
      doc.transact(() => {
        yShapes.delete(0, yShapes.length);
        if (updatedShapes && updatedShapes.length > 0) {
          yShapes.insert(0, updatedShapes);
        }
      });
      syncShapesFromYjs();
    };

    // Socket listener for remote user cursors
    const handleRemoteCursorMoved = ({ socketId, username, color, cursor }) => {
      if (socketId === socket.id) return;
      setRemoteCursors((prev) => ({
        ...prev,
        [socketId]: { socketId, username, color, cursor, updatedAt: Date.now() },
      }));
    };

    const handleRemoteCursorRemoved = ({ socketId }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    socket.on('canvas-initial-state', handleInitialState);
    socket.on('canvas-shapes-remote-update', handleRemoteShapesUpdate);
    socket.on('remote-cursor-moved', handleRemoteCursorMoved);
    socket.on('remote-cursor-removed', handleRemoteCursorRemoved);

    return () => {
      yShapes.unobserve(observer);
      socket.off('canvas-initial-state', handleInitialState);
      socket.off('canvas-shapes-remote-update', handleRemoteShapesUpdate);
      socket.off('remote-cursor-moved', handleRemoteCursorMoved);
      socket.off('remote-cursor-removed', handleRemoteCursorRemoved);
    };
  }, [socket, currentRoom, syncShapesFromYjs]);

  // Function to commit shape changes to Yjs doc & broadcast via socket
  const pushShapesToYjsAndSocket = (newShapesList, action = 'update') => {
    const doc = docRef.current;
    const yShapes = doc.getArray('shapes');

    doc.transact(() => {
      yShapes.delete(0, yShapes.length);
      if (newShapesList && newShapesList.length > 0) {
        yShapes.insert(0, newShapesList);
      }
    });

    setShapes(newShapesList);

    if (socket && currentRoom) {
      socket.emit('canvas-shapes-update', {
        roomId: currentRoom,
        shapes: newShapesList,
        action,
      });
    }
  };

  const addShape = (shape) => {
    const updated = [...shapes, shape];
    pushShapesToYjsAndSocket(updated, 'add');
  };

  const clearCanvas = () => {
    pushShapesToYjsAndSocket([], 'clear');
  };

  const emitCursorMove = (x, y) => {
    if (socket && currentRoom) {
      socket.emit('cursor-move', {
        roomId: currentRoom,
        x,
        y,
      });
    }
  };

  return {
    shapes,
    addShape,
    clearCanvas,
    pushShapesToYjsAndSocket,
    remoteCursors,
    emitCursorMove,
  };
};
