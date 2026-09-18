import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Group } from 'react-konva';
import { MousePointer, Pencil, Minus, Square, Circle as CircleIcon, Type, Eraser } from 'lucide-react';

/**
 * KonvaCanvasBase Component — Module M5 (Part 3: 41% - 60% Geometric Shapes, Interactive Text & Konva Transformer Handles)
 * 
 * Includes:
 * - Konva Stage & Layer baseline hierarchy (Part 1 - 20%)
 * - Tool State Management & Freehand / Line Drawing (Part 2 - 40%)
 * - Geometric Shape Renderers (Rectangles & Circles) (Part 3 - 60%)
 * - Interactive Text Node Controls (Part 3 - 60%)
 * - Konva Transformer Resize & Rotate Selection Handles (Part 3 - 60%)
 */
export const KonvaCanvasBase = ({ children, onStageClick, stageRef: externalStageRef }) => {
  const containerRef = useRef(null);
  const internalStageRef = useRef(null);
  const stageRef = externalStageRef || internalStageRef;
  const trRef = useRef(null);

  // Viewport State
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Tool & Canvas State (Part 1 + Part 2 + Part 3)
  const [activeTool, setActiveTool] = useState('pencil'); // 'select', 'pencil', 'line', 'rectangle', 'circle', 'text', 'eraser'
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  // Shape Data Lists
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Text Input Overlay State
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });

  const currentShapeRef = useRef(null);

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

  // Update Konva Transformer Selection Node Handles
  useEffect(() => {
    if (!trRef.current) return;
    if (selectedId && activeTool === 'select') {
      const stage = stageRef.current;
      if (!stage) return;
      const selectedNode = stage.findOne('#' + selectedId);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else {
      trRef.current.nodes([]);
    }
  }, [selectedId, activeTool, stageRef]);

  // Mouse Down Event Handler — Creation Initialization
  const handleMouseDown = useCallback((e) => {
    // If clicking on empty stage background in select mode, deselect shapes
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('bg-rect');
    if (activeTool === 'select') {
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const relativeX = (point.x - stagePos.x) / stageScale;
    const relativeY = (point.y - stagePos.y) / stageScale;

    if (activeTool === 'text') {
      setTextInput({
        visible: true,
        x: relativeX,
        y: relativeY,
        value: ''
      });
      return;
    }

    setIsDrawing(true);
    const shapeId = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      const newShape = {
        id: shapeId,
        type: 'pencil',
        tool: activeTool,
        points: [relativeX, relativeY],
        color: activeTool === 'eraser' ? '#ffffff' : selectedColor,
        strokeWidth: activeTool === 'eraser' ? strokeWidth * 4 : strokeWidth
      };
      currentShapeRef.current = newShape;
      setShapes((prev) => [...prev, newShape]);
    } else if (activeTool === 'line') {
      const newShape = {
        id: shapeId,
        type: 'line',
        points: [relativeX, relativeY, relativeX, relativeY],
        color: selectedColor,
        strokeWidth: strokeWidth
      };
      currentShapeRef.current = newShape;
      setShapes((prev) => [...prev, newShape]);
    } else if (activeTool === 'rectangle') {
      const newShape = {
        id: shapeId,
        type: 'rectangle',
        x: relativeX,
        y: relativeY,
        width: 0,
        height: 0,
        color: selectedColor,
        strokeWidth: strokeWidth
      };
      currentShapeRef.current = newShape;
      setShapes((prev) => [...prev, newShape]);
    } else if (activeTool === 'circle') {
      const newShape = {
        id: shapeId,
        type: 'circle',
        x: relativeX,
        y: relativeY,
        radius: 0,
        color: selectedColor,
        strokeWidth: strokeWidth
      };
      currentShapeRef.current = newShape;
      setShapes((prev) => [...prev, newShape]);
    }
  }, [activeTool, selectedColor, strokeWidth, stagePos, stageScale]);

  // Mouse Move Event Handler — Dynamic Geometry Preview
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

    if (!isDrawing || !currentShapeRef.current) return;

    const current = currentShapeRef.current;

    if (current.type === 'pencil') {
      const updated = {
        ...current,
        points: current.points.concat([relativeX, relativeY])
      };
      currentShapeRef.current = updated;
      setShapes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else if (current.type === 'line') {
      const updated = {
        ...current,
        points: [current.points[0], current.points[1], relativeX, relativeY]
      };
      currentShapeRef.current = updated;
      setShapes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else if (current.type === 'rectangle') {
      const updated = {
        ...current,
        width: relativeX - current.x,
        height: relativeY - current.y
      };
      currentShapeRef.current = updated;
      setShapes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else if (current.type === 'circle') {
      const dx = relativeX - current.x;
      const dy = relativeY - current.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const updated = {
        ...current,
        radius
      };
      currentShapeRef.current = updated;
      setShapes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
  }, [isDrawing, stagePos, stageScale, stageRef]);

  // Mouse Up Handler — Finalize Creation
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    currentShapeRef.current = null;
  }, []);

  // Submit Interactive Text Node
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.value.trim()) {
      const newTextShape = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        text: textInput.value.trim(),
        color: selectedColor,
        fontSize: 18
      };
      setShapes((prev) => [...prev, newTextShape]);
    }
    setTextInput({ visible: false, x: 0, y: 0, value: '' });
  };

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
      {/* Floating Tool Switcher Bar — Part 3 (41% - 60% Geometric Shapes & Text) */}
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
          onClick={() => { setActiveTool('select'); setSelectedId(null); }}
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
            cursor: 'pointer'
          }}
          title="Select / Transform Handles"
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
            cursor: 'pointer'
          }}
          title="Pencil Tool"
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
            cursor: 'pointer'
          }}
          title="Straight Line Tool"
        >
          <Minus size={14} />
          <span>Line</span>
        </button>

        <button
          onClick={() => setActiveTool('rectangle')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'rectangle' ? '#166534' : 'transparent',
            color: activeTool === 'rectangle' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Rectangle Geometry Tool (Part 3)"
        >
          <Square size={14} />
          <span>Rectangle</span>
        </button>

        <button
          onClick={() => setActiveTool('circle')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'circle' ? '#166534' : 'transparent',
            color: activeTool === 'circle' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Circle Geometry Tool (Part 3)"
        >
          <CircleIcon size={14} />
          <span>Circle</span>
        </button>

        <button
          onClick={() => setActiveTool('text')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'text' ? '#166534' : 'transparent',
            color: activeTool === 'text' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Text Node Tool (Part 3)"
        >
          <Type size={14} />
          <span>Text</span>
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
            cursor: 'pointer'
          }}
          title="Eraser Tool"
        >
          <Eraser size={14} />
          <span>Eraser</span>
        </button>
      </div>

      {/* On-Canvas Interactive Text Entry Popup */}
      {textInput.visible && (
        <form
          onSubmit={handleTextSubmit}
          style={{
            position: 'absolute',
            left: `${textInput.x * stageScale + stagePos.x}px`,
            top: `${textInput.y * stageScale + stagePos.y}px`,
            zIndex: 30
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder="Type text..."
            value={textInput.value}
            onChange={(e) => setTextInput((prev) => ({ ...prev, value: e.target.value }))}
            onBlur={handleTextSubmit}
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          />
        </form>
      )}

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
            name="bg-rect"
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="#ffffff"
            listening={true}
          />
          <Group listening={false}>{renderGridDots()}</Group>
        </Layer>

        {/* Layer 2: Main Interactive Geometric & Vector Content Layer */}
        <Layer id="main-shapes-layer">
          {shapes.map((s) => {
            const isSelected = s.id === selectedId;

            if (s.type === 'pencil' || s.type === 'line') {
              return (
                <Line
                  key={s.id}
                  id={s.id}
                  points={s.points}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth}
                  tension={s.type === 'pencil' ? 0.5 : 0}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={s.tool === 'eraser' ? 'destination-out' : 'source-over'}
                  draggable={activeTool === 'select'}
                  onClick={() => activeTool === 'select' && setSelectedId(s.id)}
                />
              );
            }

            if (s.type === 'rectangle') {
              return (
                <Rect
                  key={s.id}
                  id={s.id}
                  x={s.x}
                  y={s.y}
                  width={s.width}
                  height={s.height}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth}
                  cornerRadius={4}
                  draggable={activeTool === 'select'}
                  onClick={() => activeTool === 'select' && setSelectedId(s.id)}
                />
              );
            }

            if (s.type === 'circle') {
              return (
                <Circle
                  key={s.id}
                  id={s.id}
                  x={s.x}
                  y={s.y}
                  radius={Math.max(1, s.radius)}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth}
                  draggable={activeTool === 'select'}
                  onClick={() => activeTool === 'select' && setSelectedId(s.id)}
                />
              );
            }

            if (s.type === 'text') {
              return (
                <Text
                  key={s.id}
                  id={s.id}
                  x={s.x}
                  y={s.y}
                  text={s.text}
                  fontSize={s.fontSize || 18}
                  fill={s.color}
                  fontStyle="bold"
                  fontFamily="Inter, sans-serif"
                  draggable={activeTool === 'select'}
                  onClick={() => activeTool === 'select' && setSelectedId(s.id)}
                />
              );
            }

            return null;
          })}

          {/* Konva Transformer Handle Overlay — Part 3 (41% - 60%) */}
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            anchorSize={8}
            anchorCornerRadius={2}
            borderStroke="#2563eb"
            anchorStroke="#2563eb"
            anchorFill="#ffffff"
          />
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
          M5 Active Tool: {activeTool.toUpperCase()}
        </span>
        <span>|</span>
        <span>Shapes: {shapes.length}</span>
        <span>|</span>
        <span>Selected: {selectedId || 'None'}</span>
        <span>|</span>
        <span>Cursor: X: {cursorPos.x}, Y: {cursorPos.y}</span>
      </div>
    </div>
  );
};
