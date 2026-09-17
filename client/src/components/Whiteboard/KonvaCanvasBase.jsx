import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Group } from 'react-konva';
import { MousePointer, Pencil, Minus, Eraser } from 'lucide-react';

/**
 * KonvaCanvasBase Component — Module M5 (Part 2: 21% - 40% Vector Tool State & Freehand / Line Drawing)
 * 
 * Includes:
 * - Konva Stage & Layer baseline hierarchy (Part 1 - 20%)
 * - Tool State Management & Mouse Drag Event Handlers for Pencil & Straight Line Drawing (Part 2 - 40%)
 * - Floating Vector Drawing Tool Switcher Bar
 */
export const KonvaCanvasBase = ({ children, onStageClick, stageRef: externalStageRef }) => {
  const containerRef = useRef(null);
  const internalStageRef = useRef(null);
  const stageRef = externalStageRef || internalStageRef;

  // Viewport State
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Part 2 (21% - 40%): Drawing Tool & Stroke States
  const [activeTool, setActiveTool] = useState('pencil'); // 'select', 'pencil', 'line', 'eraser'
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const currentLineRef = useRef(null);

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

  // Mouse Down Event Handler — Start Drawing
  const handleMouseDown = useCallback((e) => {
    if (activeTool === 'select') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    setIsDrawing(true);

    const relativeX = (point.x - stagePos.x) / stageScale;
    const relativeY = (point.y - stagePos.y) / stageScale;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      const newLine = {
        id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tool: activeTool,
        points: [relativeX, relativeY],
        color: activeTool === 'eraser' ? '#ffffff' : selectedColor,
        strokeWidth: activeTool === 'eraser' ? strokeWidth * 4 : strokeWidth
      };
      currentLineRef.current = newLine;
      setLines((prev) => [...prev, newLine]);
    } else if (activeTool === 'line') {
      const newLine = {
        id: `straight-line-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tool: 'line',
        points: [relativeX, relativeY, relativeX, relativeY],
        color: selectedColor,
        strokeWidth: strokeWidth
      };
      currentLineRef.current = newLine;
      setLines((prev) => [...prev, newLine]);
    }
  }, [activeTool, selectedColor, strokeWidth, stagePos, stageScale]);

  // Mouse Move Event Handler — Continue Stroke / Update Coordinates
  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const relativeX = (pointer.x - stagePos.x) / stageScale;
    const relativeY = (pointer.y - stagePos.y) / stageScale;

    setCursorPos({
      x: Math.round(relativeX),
      y: Math.round(relativeY)
    });

    if (!isDrawing || !currentLineRef.current) return;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      const updatedLine = {
        ...currentLineRef.current,
        points: currentLineRef.current.points.concat([relativeX, relativeY])
      };
      currentLineRef.current = updatedLine;
      setLines((prevLines) =>
        prevLines.map((l) => (l.id === updatedLine.id ? updatedLine : l))
      );
    } else if (activeTool === 'line') {
      const startX = currentLineRef.current.points[0];
      const startY = currentLineRef.current.points[1];
      const updatedLine = {
        ...currentLineRef.current,
        points: [startX, startY, relativeX, relativeY]
      };
      currentLineRef.current = updatedLine;
      setLines((prevLines) =>
        prevLines.map((l) => (l.id === updatedLine.id ? updatedLine : l))
      );
    }
  }, [isDrawing, activeTool, stagePos, stageScale, stageRef]);

  // Mouse Up Event Handler — Finish Stroke
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    currentLineRef.current = null;
  }, []);

  // Render Dot-Grid Background Pattern
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
      {/* Floating Tool Switcher Bar — Part 2 (21% - 40%) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          zIndex: 20
        }}
      >
        <button
          onClick={() => setActiveTool('select')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'select' ? '#166534' : 'transparent',
            color: activeTool === 'select' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Select / Move Pointer"
        >
          <MousePointer size={14} />
          <span>Select</span>
        </button>

        <button
          onClick={() => setActiveTool('pencil')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'pencil' ? '#166534' : 'transparent',
            color: activeTool === 'pencil' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Pencil Freehand Tool"
        >
          <Pencil size={14} />
          <span>Pencil</span>
        </button>

        <button
          onClick={() => setActiveTool('line')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'line' ? '#166534' : 'transparent',
            color: activeTool === 'line' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Straight Line Tool"
        >
          <Minus size={14} />
          <span>Line</span>
        </button>

        <button
          onClick={() => setActiveTool('eraser')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'eraser' ? '#dc2626' : 'transparent',
            color: activeTool === 'eraser' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Eraser Tool"
        >
          <Eraser size={14} />
          <span>Eraser</span>
        </button>
      </div>

      {/* Konva Stage Core Setup */}
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={onStageClick}
        style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
      >
        {/* Layer 1: Background Grid */}
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

        {/* Layer 2: Freehand & Straight Line Vector Strokes Layer — Part 2 */}
        <Layer id="vector-strokes-layer">
          {lines.map((l) => (
            <Line
              key={l.id}
              points={l.points}
              stroke={l.color}
              strokeWidth={l.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={l.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          ))}
          {children}
        </Layer>
      </Stage>

      {/* Engine Status & Viewport Diagnostics Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
          M5 Vector Tool Active: {activeTool.toUpperCase()}
        </span>
        <span>|</span>
        <span>Strokes: {lines.length}</span>
        <span>|</span>
        <span>Canvas: {dimensions.width}px × {dimensions.height}px</span>
        <span>|</span>
        <span>Cursor: X: {cursorPos.x}, Y: {cursorPos.y}</span>
      </div>
    </div>
  );
};
