import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Text } from 'react-konva';
import { useYjsCanvas } from '../../hooks/useYjsCanvas';
import { useSocket } from '../../context/SocketContext';
import { Pencil, Square, Type, Eraser, Trash2, History } from 'lucide-react';

const COLORS = ['#0f172a', '#dc2626', '#2563eb', '#166534', '#d97706', '#9333ea'];
const STROKE_WIDTHS = [{ label: 'Thin', value: 2 }, { label: 'Medium', value: 4 }, { label: 'Thick', value: 8 }];

export const WhiteboardPane = () => {
  const { shapes, addShape, clearCanvas, pushShapesToYjsAndSocket, remoteCursors, emitCursorMove } = useYjsCanvas();
  const { replaySnapshot } = useSocket();

  const displayShapes = replaySnapshot ? (replaySnapshot.shapes || []) : shapes;

  const [tool, setTool] = useState('pencil');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });

  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const currentShapeRef = useRef(null);

  useEffect(() => {
    const el = canvasContainerRef.current || containerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el) {
        setDimensions({
          width: el.offsetWidth || el.clientWidth || 600,
          height: el.offsetHeight || el.clientHeight || 600,
        });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(el);
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (replaySnapshot) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    if (tool === 'pencil') {
      setIsDrawing(true);
      const newLine = {
        id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'pencil',
        points: [point.x, point.y],
        color: selectedColor,
        strokeWidth: strokeWidth,
      };
      currentShapeRef.current = newLine;
    } else if (tool === 'rectangle') {
      setIsDrawing(true);
      const newRect = {
        id: `rect-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'rectangle',
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color: selectedColor,
        strokeWidth: strokeWidth,
      };
      currentShapeRef.current = newRect;
    } else if (tool === 'text') {
      setTextInput({
        visible: true,
        x: point.x,
        y: point.y,
        value: '',
      });
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    emitCursorMove(point.x, point.y);

    if (!isDrawing || !currentShapeRef.current) return;

    if (tool === 'pencil') {
      const shape = currentShapeRef.current;
      shape.points = shape.points.concat([point.x, point.y]);
      pushShapesToYjsAndSocket([...shapes.filter((s) => s.id !== shape.id), shape], 'drawing');
    } else if (tool === 'rectangle') {
      const shape = currentShapeRef.current;
      shape.width = point.x - shape.x;
      shape.height = point.y - shape.y;
      pushShapesToYjsAndSocket([...shapes.filter((s) => s.id !== shape.id), shape], 'drawing');
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentShapeRef.current) {
      addShape(currentShapeRef.current);
      currentShapeRef.current = null;
    }
  };

  const handleShapeClick = (shapeId) => {
    if (tool === 'eraser') {
      const filtered = shapes.filter((s) => s.id !== shapeId);
      pushShapesToYjsAndSocket(filtered, 'erase');
    }
  };

  const handleTextSubmit = (e) => {
    if (e.key === 'Enter' && textInput.value.trim()) {
      const newText = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        text: textInput.value.trim(),
        color: selectedColor,
        fontSize: Math.max(16, strokeWidth * 4),
      };
      addShape(newText);
      setTextInput({ visible: false, x: 0, y: 0, value: '' });
    } else if (e.key === 'Escape') {
      setTextInput({ visible: false, x: 0, y: 0, value: '' });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Whiteboard Toolbar Header */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #cbd5e1',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 10
      }}>
        {/* Panel Title & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Whiteboard Canvas
          </span>

          <div style={{ height: '16px', width: '1px', backgroundColor: '#cbd5e1' }} />

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#ffffff', padding: '2px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => setTool('pencil')}
              title="Pencil"
              style={{
                backgroundColor: tool === 'pencil' ? '#166534' : 'transparent',
                color: tool === 'pencil' ? '#ffffff' : '#0f172a',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              <Pencil size={13} /> Pencil
            </button>

            <button
              onClick={() => setTool('rectangle')}
              title="Rectangle"
              style={{
                backgroundColor: tool === 'rectangle' ? '#166534' : 'transparent',
                color: tool === 'rectangle' ? '#ffffff' : '#0f172a',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              <Square size={13} /> Rect
            </button>

            <button
              onClick={() => setTool('text')}
              title="Text"
              style={{
                backgroundColor: tool === 'text' ? '#166534' : 'transparent',
                color: tool === 'text' ? '#ffffff' : '#0f172a',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              <Type size={13} /> Text
            </button>

            <button
              onClick={() => setTool('eraser')}
              title="Eraser"
              style={{
                backgroundColor: tool === 'eraser' ? '#dc2626' : 'transparent',
                color: tool === 'eraser' ? '#ffffff' : '#0f172a',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              <Eraser size={13} /> Eraser
            </button>
          </div>

          {/* Color Swatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: selectedColor === c ? '2px solid #0f172a' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  boxShadow: selectedColor === c ? '0 0 0 1px #ffffff' : 'none'
                }}
              />
            ))}
          </div>

          {/* Stroke Width Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                onClick={() => setStrokeWidth(sw.value)}
                style={{
                  backgroundColor: strokeWidth === sw.value ? '#2563eb' : '#ffffff',
                  color: strokeWidth === sw.value ? '#ffffff' : '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {sw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Button */}
        <button
          onClick={clearCanvas}
          style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Replay Mode Banner */}
      {replaySnapshot && (
        <div style={{
          backgroundColor: '#eff6ff',
          borderBottom: '1px solid #bfdbfe',
          color: '#1e40af',
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 20
        }}>
          <History size={14} />
          <span>TIME-MACHINE REPLAY (Read Only) — Snapshot at {new Date(replaySnapshot.timestamp).toLocaleTimeString()} ({displayShapes.length} Shapes)</span>
        </div>
      )}

      {/* Konva Canvas */}
      <div
        ref={canvasContainerRef}
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          cursor: replaySnapshot ? 'default' : tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair'
        }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {displayShapes.map((shape) => {
              if (shape.type === 'pencil') {
                return (
                  <Line
                    key={shape.id}
                    points={shape.points}
                    stroke={shape.color}
                    strokeWidth={shape.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    onClick={() => handleShapeClick(shape.id)}
                  />
                );
              } else if (shape.type === 'rectangle') {
                return (
                  <Rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={shape.color}
                    strokeWidth={shape.strokeWidth}
                    fill={shape.color + '15'}
                    cornerRadius={2}
                    onClick={() => handleShapeClick(shape.id)}
                  />
                );
              } else if (shape.type === 'text') {
                return (
                  <Text
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    text={shape.text}
                    fill={shape.color}
                    fontSize={shape.fontSize || 18}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    onClick={() => handleShapeClick(shape.id)}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>

        {textInput.visible && (
          <input
            type="text"
            autoFocus
            placeholder="Type text & press Enter"
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onKeyDown={handleTextSubmit}
            style={{
              position: 'absolute',
              top: `${textInput.y}px`,
              left: `${textInput.x}px`,
              backgroundColor: '#ffffff',
              color: selectedColor,
              border: `2px solid ${selectedColor}`,
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '14px',
              fontWeight: '700',
              outline: 'none',
              zIndex: 30,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        )}

        {/* Remote Cursors */}
        {Object.values(remoteCursors).map((rc) => {
          if (!rc.cursor) return null;
          return (
            <div
              key={rc.socketId}
              style={{
                position: 'absolute',
                left: `${rc.cursor.x}px`,
                top: `${rc.cursor.y}px`,
                pointerEvents: 'none',
                zIndex: 40,
                transition: 'all 0.05s ease-out'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill={rc.color || '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
              <div
                style={{
                  backgroundColor: rc.color || '#2563eb',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                  marginTop: '-2px',
                  marginLeft: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                }}
              >
                {rc.username}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
