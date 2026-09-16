import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Group, Text } from 'react-konva';

/**
 * KonvaCanvasBase Component — Module M5 (Part 1: Konva.js Integration & Canvas Base Setup)
 * 
 * Provides the foundational Konva Stage and Layer setup with dynamic viewport sizing,
 * infinite dot-grid background rendering, stage transform controls, and status diagnostics.
 */
export const KonvaCanvasBase = ({ children, onStageClick, stageRef: externalStageRef }) => {
  const containerRef = useRef(null);
  const internalStageRef = useRef(null);
  const stageRef = externalStageRef || internalStageRef;

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Auto-resize Stage based on parent container bounds
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setDimensions({
        width: el.clientWidth || 800,
        height: el.clientHeight || 600,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Handle stage pointer movement for coordinate diagnostics
  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (pointer) {
      setCursorPos({
        x: Math.round((pointer.x - stagePos.x) / stageScale),
        y: Math.round((pointer.y - stagePos.y) / stageScale)
      });
    }
  }, [stagePos, stageScale, stageRef]);

  // Render Dot-Grid Background Pattern for Canvas Base
  const renderGridDots = useCallback(() => {
    const dots = [];
    const gridSize = 30;
    const startX = -gridSize * 10;
    const startY = -gridSize * 10;
    const endX = dimensions.width + gridSize * 10;
    const endY = dimensions.height + gridSize * 10;

    for (let x = startX; x < endX; x += gridSize) {
      for (let y = startY; y < endY; y += gridSize) {
        dots.push(
          <Circle
            key={`dot-${x}-${y}`}
            x={x}
            y={y}
            radius={1.5}
            fill="#cbd5e1"
            listening={false}
          />
        );
      }
    }
    return dots;
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Konva Stage Core Setup */}
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onMouseMove={handleMouseMove}
        onClick={onStageClick}
        style={{ cursor: 'crosshair' }}
      >
        {/* Layer 1: Background Grid & Canvas Base */}
        <Layer id="background-layer">
          <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="#ffffff"
            listening={false}
          />
          <Group listening={false}>{renderGridDots()}</Group>
        </Layer>

        {/* Layer 2: Main Interactive Content Layer */}
        <Layer id="main-content-layer">
          {children}
        </Layer>
      </Stage>

      {/* Engine Status Bar & Viewport Diagnostics Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 500,
          color: '#64748b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          Konva.js v9 Stage Active
        </span>
        <span>|</span>
        <span>Canvas: {dimensions.width}px × {dimensions.height}px</span>
        <span>|</span>
        <span>Zoom: {Math.round(stageScale * 100)}%</span>
        <span>|</span>
        <span>Cursor: X: {cursorPos.x}, Y: {cursorPos.y}</span>
      </div>
    </div>
  );
};
