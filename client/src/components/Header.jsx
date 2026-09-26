import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Copy, Check, LogOut, History, Radio, RotateCcw } from 'lucide-react';
import { ReplayBar } from './Replay/ReplayBar';
import { DocumentRestoreModal } from './DocumentRestore/DocumentRestoreModal';

export const Header = () => {
  const { currentRoom, currentUser, roomUsers, leaveRoom, isConnected } = useSocket();
  const [copied, setCopied] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [showDocumentRestore, setShowDocumentRestore] = useState(false);

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
              CQRS Architecture • Yjs CRDT Synchronization • Document Restore Engine (M3)
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
                    fontSize: '11px',
                    fontWeight: '700'
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {/* Document Restore Button (Week 3 M3 Day 1) */}
            <button
              onClick={() => setShowDocumentRestore(true)}
              style={{
                backgroundColor: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Open Document Restore Engine (M3 Day 1)"
            >
              <RotateCcw size={14} />
              <span>Restore Document</span>
            </button>

            {/* Replay History Scrubber Toggle */}
            {currentRoom && (
              <button
                onClick={() => setShowReplay(!showReplay)}
                style={{
                  backgroundColor: showReplay ? '#eff6ff' : '#ffffff',
                  color: showReplay ? '#1d4ed8' : '#334155',
                  border: `1px solid ${showReplay ? '#93c5fd' : '#cbd5e1'}`,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <History size={14} />
                <span>Time-Machine</span>
              </button>
            )}

            {/* Leave Room Action Button */}
            {currentRoom && (
              <button
                onClick={leaveRoom}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={14} />
                <span>Leave</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Render Replay Bar Component */}
      <ReplayBar isOpen={showReplay} onClose={() => setShowReplay(false)} />

      {/* Render Document Restore Modal (Week 3 M3 Day 1) */}
      <DocumentRestoreModal
        isOpen={showDocumentRestore}
        onClose={() => setShowDocumentRestore(false)}
        currentShapes={[]}
        currentCode=""
      />
    </>
  );
};
