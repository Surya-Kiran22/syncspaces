import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useYjsCode } from '../../hooks/useYjsCode';
import { useSocket } from '../../context/SocketContext';
import { Code, Check, Copy, History } from 'lucide-react';

export const CodeEditorPane = () => {
  const { code, language, updateCode, updateLanguage } = useYjsCode();
  const { replaySnapshot } = useSocket();
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);

  const displayCode = replaySnapshot ? (replaySnapshot.code || '') : code;

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCopyCode = () => {
    if (displayCode) {
      navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Basic Code Editor Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={16} style={{ color: '#007acc' }} />
          <select
            value={language}
            onChange={(e) => updateLanguage(e.target.value)}
            disabled={!!replaySnapshot}
            style={{
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '12px',
              outline: 'none',
              cursor: replaySnapshot ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
          </select>
        </div>

        <button
          onClick={handleCopyCode}
          style={{
            backgroundColor: '#1e1e1e',
            color: copied ? '#5cb85c' : '#cccccc',
            border: '1px solid #3e3e42',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
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
          <span>REPLAY MODE (Read Only) — Snapshot at {new Date(replaySnapshot.timestamp).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Editor */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={language}
          value={displayCode}
          onChange={(value) => !replaySnapshot && updateCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly: !!replaySnapshot,
            fontSize: 14,
            fontFamily: 'Fira Code, Consolas, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbersMinChars: 3,
            padding: { top: 8, bottom: 8 }
          }}
        />
      </div>

      {/* Status Bar */}
      <div style={{
        height: '24px',
        backgroundColor: replaySnapshot ? '#d9534f' : '#007acc',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '11px'
      }}>
        <div>Language: {language.toUpperCase()}</div>
        <div>{replaySnapshot ? 'REPLAY TIMELINE VIEW (Read Only)' : 'Real-Time Sync Active'}</div>
      </div>
    </div>
  );
};
