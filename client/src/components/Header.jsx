import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Copy, Check, LogOut, History, Radio } from 'lucide-react';
import { ReplayBar } from './Replay/ReplayBar';

export const Header = () => {
  const { currentRoom, currentUser, roomUsers, leaveRoom, isConnected } = useSocket();
  const [copied, setCopied] = useState(false);
  const [showReplay, setShowReplay] = useState(false);

  const handleCopyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #cbd5e1',
        padding: '12px 20px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Title & Subtitle */}
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              SyncSpace — Real-Time Collaborative Workspace
            </h1>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '2px',
              fontWeight: '500'
            }}>
              CQRS Architecture • Yjs CRDT Synchronization • Monaco Editor & Whiteboard Canvas
            </p>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Connection Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isConnected ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '4px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: '600',
              color: isConnected ? '#166534' : '#dc2626'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#16a34a' : '#dc2626',
                display: 'inline-block'
              }} />
              <span>{isConnected ? 'Online & Synced' : 'Connecting...'}</span>
            </div>

            {/* Room Code Badge */}
            {currentRoom && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '13px'
              }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>Room:</span>
                <span style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                  {currentRoom}
                </span>
                <button
                  onClick={handleCopyRoomId}
                  title="Copy Room Code"
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '3px',
                    color: copied ? '#166534' : '#334155',
                    cursor: 'pointer',
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            {/* Replay History Button */}
            {currentRoom && (
              <button
                onClick={() => setShowReplay(!showReplay)}
                style={{
                  backgroundColor: showReplay ? '#1e5617' : '#166534',
                  color: '#ffffff',
                  border: '1px solid #14532d',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <History size={14} />
                <span>Replay History</span>
              </button>
            )}

            {/* User Avatars & Leave Button */}
            {currentRoom && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={15} style={{ color: '#64748b' }} />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {roomUsers.map((user, idx) => (
                      <div
                        key={user.socketId || idx}
                        title={`${user.username} ${user.socketId === currentUser?.socketId ? '(You)' : ''}`}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: user.color || '#2563eb',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          border: '2px solid #ffffff',
                          marginLeft: idx === 0 ? 0 : '-8px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginLeft: '4px' }}>
                    ({roomUsers.length})
                  </span>
                </div>

                <button
                  onClick={leaveRoom}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <LogOut size={13} />
                  Leave
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Line under Header */}
        <hr style={{ border: 'none', borderBottom: '1px solid #cbd5e1', marginTop: '12px' }} />
      </header>

      <ReplayBar isOpen={showReplay} onClose={() => setShowReplay(false)} />
    </>
  );
};
