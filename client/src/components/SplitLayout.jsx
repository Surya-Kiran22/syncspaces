import React, { useState, useRef, useCallback } from 'react';
import { WhiteboardPane } from './Whiteboard/WhiteboardPane';
import { CodeEditorPane } from './CodeEditor/CodeEditorPane';

export const SplitLayout = () => {
  // Left panel width percentage (default 50%)
  const [leftWidthPercent, setLeftWidthPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = moveEvent.clientX - rect.left;
      const newPercent = (newLeftWidth / rect.width) * 100;
      
      // Clamp between 20% and 80%
      if (newPercent >= 20 && newPercent <= 80) {
        setLeftWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f8fafc',
        padding: '16px',
        gap: '12px',
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Left Whiteboard Pane Card */}
      <div style={{
        width: `calc(${leftWidthPercent}% - 6px)`,
        height: '100%',
        display: 'flex',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <WhiteboardPane />
      </div>

      {/* Resizable Divider Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'col-resize',
          backgroundColor: isDragging ? '#e2e8f0' : 'transparent',
          borderRadius: '4px',
          transition: 'background-color 0.15s'
        }}
        title="Drag to resize split panes"
      >
        <div style={{
          width: '4px',
          height: '32px',
          backgroundColor: isDragging ? '#2563eb' : '#94a3b8',
          borderRadius: '2px'
        }} />
      </div>

      {/* Right Code Editor Pane Card */}
      <div style={{
        width: `calc(${100 - leftWidthPercent}% - 6px)`,
        height: '100%',
        display: 'flex',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <CodeEditorPane />
      </div>
    </div>
  );
};
