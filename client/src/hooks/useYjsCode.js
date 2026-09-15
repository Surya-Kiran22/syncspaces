import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { useSocket } from '../context/SocketContext';

const DEFAULT_CODE = `// Welcome to SyncSpace Real-Time Collaborative IDE
// Powered by Monaco Editor + Yjs CRDT Synchronization

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const numbers = [1, 3, 5, 7, 9, 11, 13];
console.log("Found target 7 at index:", binarySearch(numbers, 7));
`;

export const useYjsCode = () => {
  const { socket, currentRoom } = useSocket();
  const docRef = useRef(new Y.Doc());
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    if (!socket || !currentRoom) return;

    const doc = docRef.current;
    const yText = doc.getText('codetext');

    // Initial state listener from server (loaded from MongoDB)
    const handleInitialState = ({ code: initialCode }) => {
      if (initialCode && initialCode.trim()) {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, initialCode);
        });
        setCode(initialCode);
      }
    };

    // Remote code updates from another client
    const handleRemoteCodeUpdate = ({ code: updatedCode, language: newLang }) => {
      if (updatedCode !== undefined) {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, updatedCode);
        });
        setCode(updatedCode);
      }
      if (newLang) {
        setLanguage(newLang);
      }
    };

    socket.on('code-initial-state', handleInitialState);
    socket.on('code-text-remote-update', handleRemoteCodeUpdate);

    return () => {
      socket.off('code-initial-state', handleInitialState);
      socket.off('code-text-remote-update', handleRemoteCodeUpdate);
    };
  }, [socket, currentRoom]);

  // Push local code edits to Yjs doc & broadcast over socket
  const updateCode = (newCode, newLang = language) => {
    setCode(newCode);
    const doc = docRef.current;
    const yText = doc.getText('codetext');

    doc.transact(() => {
      yText.delete(0, yText.length);
      yText.insert(0, newCode);
    });

    if (socket && currentRoom) {
      socket.emit('code-text-update', {
        roomId: currentRoom,
        code: newCode,
        language: newLang,
      });
    }
  };

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    updateCode(code, newLang);
  };

  return {
    code,
    language,
    updateCode,
    updateLanguage,
  };
};
