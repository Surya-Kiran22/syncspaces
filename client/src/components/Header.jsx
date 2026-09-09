import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Copy, Check, LogOut, History } from 'lucide-react';
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
        height: '48px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        userSelect: 'none'
      }}>
        {/* Left: App Title & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#ffffff' }}>
              SyncSpace
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: isConnected ? '#5cb85c' : '#d9534f'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#5cb85c' : '#d9534f',
              display: 'inline-block'
            }} />
            <span>{isConnected ? 'Online' : 'Connecting'}</span>
          </div>
        </div>

        {/* Center: Room Code, Replay, & Astra AI */}
        {currentRoom && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '13px'
            }}>
              <span style={{ color: '#888888', fontWeight: '500' }}>Room:</span>
              <span style={{ fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace' }}>
                {currentRoom}
              </span>
              <button
                onClick={handleCopyRoomId}
                title="Copy Room Code"
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#5cb85c' : '#cccccc',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <button
              onClick={() => setShowReplay(!showReplay)}
              style={{
                backgroundColor: showReplay ? '#007acc' : '#333333',
                color: '#ffffff',
                border: '1px solid #3e3e42',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <History size={14} />
              <span>Replay History</span>
            </button>
          </div>
        )}

        {/* Right: Active Users & Leave */}
        {currentRoom && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} style={{ color: '#888888' }} />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {roomUsers.map((user, idx) => (
                  <div
                    key={user.socketId || idx}
                    title={`${user.username} ${user.socketId === currentUser?.socketId ? '(You)' : ''}`}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: user.color || '#007acc',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      border: '1px solid #252526',
                      marginLeft: idx === 0 ? 0 : '-6px'
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: '#aaaaaa' }}>
                ({roomUsers.length})
              </span>
            </div>

            <button
              onClick={leaveRoom}
              style={{
                backgroundColor: '#333333',
                border: '1px solid #3e3e42',
                color: '#ff6b6b',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LogOut size={14} />
              Leave
            </button>
          </div>
        )}
      </header>

      <ReplayBar isOpen={showReplay} onClose={() => setShowReplay(false)} />
    </>
  );
};
