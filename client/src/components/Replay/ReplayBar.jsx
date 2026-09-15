import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, History, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const ReplayBar = ({ isOpen, onClose }) => {
  const { currentRoom, setReplaySnapshot } = useSocket();
  const [snapshots, setSnapshots] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentRoom) return;

    const fetchReplaySnapshots = async () => {
      try {
        const res = await fetch(`/api/rooms/${currentRoom}/replay?limit=100`);
        const data = await res.json();
        if (data.success && data.snapshots.length > 0) {
          setSnapshots(data.snapshots);
          setCurrentIndex(data.snapshots.length - 1);
          setReplaySnapshot(data.snapshots[data.snapshots.length - 1]);
        } else {
          setSnapshots([]);
          setReplaySnapshot(null);
        }
      } catch (err) {
        console.error('Error fetching replay history:', err);
      }
    };

    fetchReplaySnapshots();
  }, [isOpen, currentRoom]);

  useEffect(() => {
    let timer;
    if (isPlaying && snapshots.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, snapshots.length]);

  useEffect(() => {
    if (isOpen && snapshots.length > 0 && snapshots[currentIndex]) {
      setReplaySnapshot(snapshots[currentIndex]);
    }
  }, [currentIndex, snapshots, isOpen, setReplaySnapshot]);

  const handleClose = () => {
    setIsPlaying(false);
    setReplaySnapshot(null);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const currentSnap = snapshots[currentIndex];
  const firstSnap = snapshots[0];
  const lastSnap = snapshots[snapshots.length - 1];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '92%',
      maxWidth: '750px',
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '6px',
      padding: '16px 20px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: '800', fontSize: '14px' }}>
          <History size={16} />
          <span>State Scrubbing Time-Machine: Snapshot #{snapshots.length > 0 ? currentIndex + 1 : 0} of {snapshots.length}</span>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {snapshots.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#64748b', padding: '8px 0', textAlign: 'center', fontWeight: '500' }}>
          No historical snapshots recorded yet for room {currentRoom}. Draw on the whiteboard or edit code to generate timeline history!
        </div>
      ) : (
        <>
          {/* Controls & Range Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setCurrentIndex(0)}
                disabled={currentIndex === 0}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex === 0 ? 0.5 : 1
                }}
              >
                <SkipBack size={14} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={snapshots.length === 0}
                style={{
                  backgroundColor: '#166534',
                  border: '1px solid #14532d',
                  color: '#ffffff',
                  padding: '5px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={() => setCurrentIndex(snapshots.length - 1)}
                disabled={currentIndex === snapshots.length - 1}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: currentIndex === snapshots.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex === snapshots.length - 1 ? 0.5 : 1
                }}
              >
                <SkipForward size={14} />
              </button>
            </div>

            {/* Slider track */}
            <input
              type="range"
              min={0}
              max={Math.max(0, snapshots.length - 1)}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#2563eb',
                cursor: 'pointer',
                height: '6px'
              }}
            />
          </div>

          {/* Bottom Captions matching reference image */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#475569',
            fontWeight: '600',
            fontFamily: 'monospace',
            marginTop: '2px'
          }}>
            <div>
              v1: {firstSnap ? new Date(firstSnap.timestamp).toLocaleTimeString() : 'Initial'}
            </div>
            <div style={{ color: '#1e40af', fontWeight: '700' }}>
              Selected: {currentSnap ? `${new Date(currentSnap.timestamp).toLocaleTimeString()} (${currentSnap.shapes?.length || 0} shapes)` : 'None'}
            </div>
            <div>
              v{snapshots.length}: {lastSnap ? new Date(lastSnap.timestamp).toLocaleTimeString() : 'Latest'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
