import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Group } from 'react-konva';
import { MousePointer, Pencil, Minus, Square, Circle as CircleIcon, Type, Eraser, Hand, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const COLOR_PRESETS = ['#0f172a', '#dc2626', '#2563eb', '#166534', '#d97706', '#9333ea'];
const STROKE_WIDTH_OPTIONS = [
  { label: 'Thin', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 8 }
];

/**
 * KonvaCanvasBase Component — Module M5 (Part 4: 61% - 80% Color Palette, Stroke Styling & Stage Pan/Zoom Engine)
 * 
 * Includes:
 * - Konva Stage & Layer baseline hierarchy (Part 1 - 20%)
 * - Tool State Management & Freehand / Line Drawing (Part 2 - 40%)
 * - Geometric Shapes & Text Renderer & Konva Transformer Handles (Part 3 - 60%)
 * - Color Palette Picker Bar & Stroke Width Selector (Part 4 - 80%)
 * - Stage Pan Navigation (Hand Tool) & Mouse Wheel Focal Point Zooming (Part 4 - 80%)
 */
export const KonvaCanvasBase = ({ children, onStageClick, stageRef: externalStageRef }) => {
  const containerRef = useRef(null);
  const internalStageRef = useRef(null);
  const stageRef = externalStageRef || internalStageRef;
  const trRef = useRef(null);

  // Viewport & Transform State (Part 1 + Part 4)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Tool & Canvas State (Part 1 + Part 2 + Part 3 + Part 4)
  const [activeTool, setActiveTool] = useState('pencil'); // 'select', 'hand', 'pencil', 'line', 'rectangle', 'circle', 'text', 'eraser'
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  // Shape Data Lists & Selection
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

  // Update Color of Currently Selected Shape
  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (selectedId) {
      setShapes((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, color } : s))
      );
    }
  };

  // Update Stroke Width of Currently Selected Shape
  const handleStrokeWidthChange = (width) => {
    setStrokeWidth(width);
    if (selectedId) {
      setShapes((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, strokeWidth: width } : s))
      );
    }
  };

  // Focal Point Wheel Zoom Engine — Part 4 (61% - 80%)
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.08;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.min(Math.max(newScale, 0.4), 3.5);

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setStageScale(clampedScale);
    setStagePos(newPos);
  }, [stageScale, stagePos, stageRef]);

  // Zoom Reset Control
  const resetZoomAndPan = () => {
    setStageScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  // Mouse Down Handler — Creation & Pan Dragging Initialization
  const handleMouseDown = useCallback((e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    // Pan Tool Drag Start
    if (activeTool === 'hand' || e.evt.button === 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.evt.clientX - stagePos.x, y: e.evt.clientY - stagePos.y };
      return;
    }

    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('bg-rect');
    if (activeTool === 'select') {
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

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

  // Mouse Move Handler — Stage Pan & Dynamic Geometry Update
  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setStagePos({
        x: e.evt.clientX - panStartRef.current.x,
        y: e.evt.clientY - panStartRef.current.y
      });
      return;
    }

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
  }, [isPanning, isDrawing, stagePos, stageScale, stageRef]);

  // Mouse Up Handler — Finalize Creation or Panning
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
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
    const startX = -gridSize * 15;
    const startY = -gridSize * 15;
    const endX = dimensions.width + gridSize * 15;
    const endY = dimensions.height + gridSize * 15;

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
      {/* Floating Tool Switcher Bar — Part 4 (61% - 80% Full Tool Suite) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 20
        }}
      >
        <button
          onClick={() => { setActiveTool('select'); setSelectedId(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
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
          onClick={() => { setActiveTool('hand'); setSelectedId(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'hand' ? '#166534' : 'transparent',
            color: activeTool === 'hand' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Pan Stage Tool (Hand)"
        >
          <Hand size={14} />
          <span>Pan</span>
        </button>

        <span style={{ color: '#cbd5e1' }}>|</span>

        <button
          onClick={() => setActiveTool('pencil')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'pencil' ? '#166534' : 'transparent',
            color: activeTool === 'pencil' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
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
            padding: '6px 10px',
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
            padding: '6px 10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'rectangle' ? '#166534' : 'transparent',
            color: activeTool === 'rectangle' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Rectangle Geometry Tool"
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
            padding: '6px 10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'circle' ? '#166534' : 'transparent',
            color: activeTool === 'circle' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Circle Geometry Tool"
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
            padding: '6px 10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTool === 'text' ? '#166534' : 'transparent',
            color: activeTool === 'text' ? '#ffffff' : '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Text Node Tool"
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
            padding: '6px 10px',
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

      {/* Floating Color Palette & Stroke Width Styling Controls — Part 4 (61% - 80%) */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 12px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          zIndex: 20
        }}
      >
        {/* Color Swatch Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Color:</span>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: c,
                border: selectedColor === c ? '2px solid #0f172a' : '1px solid #cbd5e1',
                cursor: 'pointer',
                transform: selectedColor === c ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s'
              }}
              title={c}
            />
          ))}
        </div>

        <span style={{ color: '#cbd5e1' }}>|</span>

        {/* Stroke Width Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Width:</span>
          {STROKE_WIDTH_OPTIONS.map((sw) => (
            <button
              key={sw.value}
              onClick={() => handleStrokeWidthChange(sw.value)}
              style={{
                padding: '3px 8px',
                borderRadius: '3px',
                border: '1px solid #cbd5e1',
                backgroundColor: strokeWidth === sw.value ? '#166534' : '#f8fafc',
                color: strokeWidth === sw.value ? '#ffffff' : '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {sw.label}
            </button>
          ))}
        </div>
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
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={onStageClick}
        style={{ cursor: activeTool === 'hand' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair' }}
      >
        {/* Layer 1: Background Grid */}
        <Layer id="background-layer">
          <Rect
            name="bg-rect"
            x={-stagePos.x / stageScale}
            y={-stagePos.y / stageScale}
            width={dimensions.width / stageScale + 500}
            height={dimensions.height / stageScale + 500}
            fill="#ffffff"
            listening={true}
          />
          <Group listening={false}>{renderGridDots()}</Group>
        </Layer>

        {/* Layer 2: Main Interactive Geometric & Vector Content Layer */}
        <Layer id="main-shapes-layer">
          {shapes.map((s) => {
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

          {/* Konva Transformer Handle Overlay */}
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

      {/* Engine Status & Viewport Zoom Diagnostics Overlay — Part 4 */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 500,
          color: '#64748b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(4px)',
          zIndex: 10
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          M5 Active: {activeTool.toUpperCase()}
        </span>
        <span>|</span>
        <span>Zoom: {Math.round(stageScale * 100)}%</span>
        <button
          onClick={resetZoomAndPan}
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#334155'
          }}
          title="Reset Zoom & Pan Offset"
        >
          Reset
        </button>
        <span>|</span>
        <span>Cursor: X: {cursorPos.x}, Y: {cursorPos.y}</span>
      </div>
    </div>
  );
};
