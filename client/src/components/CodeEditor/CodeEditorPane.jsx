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
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Code Editor Toolbar Header */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #cbd5e1',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Code Editor Panel
          </span>

          <div style={{ height: '16px', width: '1px', backgroundColor: '#cbd5e1' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code size={15} style={{ color: '#2563eb' }} />
            <select
              value={language}
              onChange={(e) => updateLanguage(e.target.value)}
              disabled={!!replaySnapshot}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '700',
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
        </div>

        <button
          onClick={handleCopyCode}
          style={{
            backgroundColor: '#ffffff',
            color: copied ? '#166534' : '#334155',
            border: '1px solid #cbd5e1',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>

      {/* Replay Mode Indicator Banner */}
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
          <span>TIME-MACHINE REPLAY (Read Only) — Snapshot at {new Date(replaySnapshot.timestamp).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Monaco Light Editor */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={language}
          value={displayCode}
          onChange={(value) => !replaySnapshot && updateCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs"
          options={{
            readOnly: !!replaySnapshot,
            fontSize: 14,
            fontFamily: 'Fira Code, Consolas, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbersMinChars: 3,
            padding: { top: 10, bottom: 10 }
          }}
        />
      </div>

      {/* Bottom Status Bar */}
      <div style={{
        height: '26px',
        backgroundColor: '#f1f5f9',
        borderTop: '1px solid #cbd5e1',
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        <div>Language: <span style={{ color: '#0f172a', fontWeight: '700' }}>{language.toUpperCase()}</span></div>
        <div style={{ color: replaySnapshot ? '#dc2626' : '#166534', fontWeight: '700' }}>
          {replaySnapshot ? '● REPLAY TIMELINE VIEW (Read Only)' : '● CRDT Yjs Synchronization Active'}
        </div>
      </div>
    </div>
  );
};
