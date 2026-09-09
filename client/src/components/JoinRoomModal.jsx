import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Sparkles, ArrowRight, User, Hash } from 'lucide-react';
import { AstraGalaxyCanvas } from './AstraGalaxyCanvas';

export const JoinRoomModal = () => {
  const { joinRoom } = useSocket();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const generateRandomRoomId = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomCode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomId.trim()) {
      setError('Please enter or generate a Room ID');
      return;
    }
    setError('');
    joinRoom(roomId.trim().toUpperCase(), username.trim());
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#05070e',
      position: 'relative',
      padding: '20px',
      overflow: 'hidden'
    }}>
      <AstraGalaxyCanvas />

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#ffffff', marginBottom: '6px' }}>
            SyncSpace
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
            Real-Time Collaborative Whiteboard & Code Editor
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#3a1d1d',
            border: '1px solid #d9534f',
            color: '#ff6b6b',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cccccc', marginBottom: '6px' }}>
              Your Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
              <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3e3e42',
                  borderRadius: '4px',
                  padding: '10px 10px 10px 34px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Room ID */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#cccccc' }}>
                Room ID
              </label>
              <button
                type="button"
                onClick={generateRandomRoomId}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007acc',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} />
                Generate Code
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Hash size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
              <input
                type="text"
                placeholder="Enter Room Code (e.g. ROOM12)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3e3e42',
                  borderRadius: '4px',
                  padding: '10px 10px 10px 34px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Join Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px',
              marginTop: '8px'
            }}
          >
            <span>Join Room</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
