import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Text } from 'react-konva';
import { useYjsCanvas } from '../../hooks/useYjsCanvas';
import { useSocket } from '../../context/SocketContext';
import { Pencil, Square, Type, Eraser, Trash2, History } from 'lucide-react';

const COLORS = ['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
const STROKE_WIDTHS = [{ label: 'Thin', value: 2 }, { label: 'Medium', value: 4 }, { label: 'Thick', value: 8 }];

export const WhiteboardPane = () => {
  const { shapes, addShape, clearCanvas, pushShapesToYjsAndSocket, remoteCursors, emitCursorMove } = useYjsCanvas();
  const { replaySnapshot } = useSocket();

  const displayShapes = replaySnapshot ? (replaySnapshot.shapes || []) : shapes;

  const [tool, setTool] = useState('pencil');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
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
        backgroundColor: '#181818',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Basic Whiteboard Toolbar */}
      <div style={{
        height: '42px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        zIndex: 10
      }}>
        {/* Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: '#1e1e1e', padding: '2px', borderRadius: '4px', border: '1px solid #3e3e42' }}>
            <button
              onClick={() => setTool('pencil')}
              title="Pencil"
              style={{
                backgroundColor: tool === 'pencil' ? '#007acc' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <Pencil size={13} /> Pencil
            </button>

            <button
              onClick={() => setTool('rectangle')}
              title="Rectangle"
              style={{
                backgroundColor: tool === 'rectangle' ? '#007acc' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <Square size={13} /> Rect
            </button>

            <button
              onClick={() => setTool('text')}
              title="Text"
              style={{
                backgroundColor: tool === 'text' ? '#007acc' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <Type size={13} /> Text
            </button>

            <button
              onClick={() => setTool('eraser')}
              title="Eraser"
              style={{
                backgroundColor: tool === 'eraser' ? '#d9534f' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <Eraser size={13} /> Eraser
            </button>
          </div>

          {/* Color Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: selectedColor === c ? '2px solid #ffffff' : '1px solid #3e3e42',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {/* Stroke Width Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                onClick={() => setStrokeWidth(sw.value)}
                style={{
                  backgroundColor: strokeWidth === sw.value ? '#007acc' : '#1e1e1e',
                  color: '#ffffff',
                  border: '1px solid #3e3e42',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                {sw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Canvas */}
        <button
          onClick={clearCanvas}
          style={{
            backgroundColor: '#333333',
            color: '#ff6b6b',
            border: '1px solid #3e3e42',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Replay Banner Indicator */}
      {replaySnapshot && (
        <div style={{
          backgroundColor: '#007acc',
          color: '#ffffff',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 20
        }}>
          <History size={14} />
          <span>REPLAY MODE (Read Only) — Snapshot at {new Date(replaySnapshot.timestamp).toLocaleTimeString()} ({displayShapes.length} Shapes)</span>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasContainerRef}
        style={{
          flex: 1,
          position: 'relative',
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
                    fill={shape.color + '22'}
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
              backgroundColor: '#1e1e1e',
              color: selectedColor,
              border: `1px solid ${selectedColor}`,
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '14px',
              outline: 'none',
              zIndex: 30
            }}
          />
        )}

        {/* Cursors */}
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
                  fill={rc.color || '#007acc'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
              <div
                style={{
                  backgroundColor: rc.color || '#007acc',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                  marginTop: '-2px',
                  marginLeft: '10px'
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
