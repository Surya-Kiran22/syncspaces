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

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '600px',
      backgroundColor: '#252526',
      border: '1px solid #3e3e42',
      borderRadius: '6px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#007acc', fontWeight: 'bold' }}>
          <History size={15} />
          <span>Timeline Replay Mode</span>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#aaaaaa',
            cursor: 'pointer'
          }}
        >
          <X size={15} />
        </button>
      </div>

      {snapshots.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#aaaaaa', padding: '6px 0', textAlign: 'center' }}>
          No snapshots recorded yet for this room. Draw on the whiteboard or edit code to generate timeline history!
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setCurrentIndex(0)}
              disabled={currentIndex === 0}
              style={{
                background: '#1e1e1e',
                border: '1px solid #3e3e42',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <SkipBack size={13} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={snapshots.length === 0}
              style={{
                background: '#007acc',
                border: 'none',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={() => setCurrentIndex(snapshots.length - 1)}
              disabled={currentIndex === snapshots.length - 1}
              style={{
                background: '#1e1e1e',
                border: '1px solid #3e3e42',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <SkipForward size={13} />
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, snapshots.length - 1)}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
            style={{
              flex: 1,
              accentColor: '#007acc',
              cursor: 'pointer'
            }}
          />

          <span style={{ fontSize: '12px', color: '#aaaaaa', fontFamily: 'monospace' }}>
            {currentIndex + 1}/{snapshots.length}
          </span>
        </div>
      )}
    </div>
  );
};
