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
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Left Whiteboard Pane */}
      <div style={{ width: `${leftWidthPercent}%`, height: '100%', display: 'flex' }}>
        <WhiteboardPane />
      </div>

      {/* Resizable Divider Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`gutter-divider ${isDragging ? 'dragging' : ''}`}
        title="Drag to resize split panes"
      >
        <div className="gutter-handle" />
      </div>

      {/* Right Code Editor Pane */}
      <div style={{ width: `${100 - leftWidthPercent}%`, height: '100%', display: 'flex' }}>
        <CodeEditorPane />
      </div>
    </div>
  );
};
