import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Sparkles, ArrowRight, User, Hash } from 'lucide-react';

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
      backgroundColor: '#f8fafc',
      position: 'relative',
      padding: '24px',
      overflow: 'auto'
    }}>
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Card Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            SyncSpace Workspace Join
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.4', fontWeight: '500' }}>
            Enter your name and room identifier to join real-time collaboration.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Username Input Box */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Your Name / Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="e.g. Alex Rockwell"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '10px 10px 10px 34px',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: '500',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Room ID Input Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                Room Identifier Code
              </label>
              <button
                type="button"
                onClick={generateRandomRoomId}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '3px',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={13} />
                Generate ID
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Hash size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="e.g. ROOM-1001"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '10px 10px 10px 34px',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            style={{
              backgroundColor: '#166534',
              color: '#ffffff',
              border: '1px solid #14532d',
              borderRadius: '4px',
              padding: '11px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <span>Enter Workspace Room</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
