import React, { useState } from 'react';
import { Eye, Layers, Code, CheckCircle2, ArrowLeft, RotateCcw, GitCompare, ShieldCheck } from 'lucide-react';
import { computeDocumentDiff, restoreDocumentToState } from '../../services/documentRestoreService';

/**
 * DocumentRestorePreview Component — Module M3 (Week 3 — Day 4: 61% - 80% Atomic Rollback & State Re-hydration)
 * 
 * Renders side-by-side state diff comparison and executes atomic document state rollback.
 */
export const DocumentRestorePreview = ({ snapshot, currentState, onConfirmRestore, onBack }) => {
  const [isRestoring, setIsRestoring] = useState(false);
  if (!snapshot) return null;

  const diff = computeDocumentDiff(currentState, snapshot);

  const handleExecuteRollback = () => {
    setIsRestoring(true);
    setTimeout(() => {
      const rollbackResult = restoreDocumentToState(snapshot, currentState);
      setIsRestoring(false);
      if (onConfirmRestore) {
        onConfirmRestore(rollbackResult);
      }
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Snapshot Meta Header */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span
              style={{
                backgroundColor: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'monospace'
              }}
            >
              {snapshot.versionTag || 'v1'}
            </span>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
              {snapshot.label || 'Selected Restore Point'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{snapshot.versionId}</span> • Created at {snapshot.formattedTime}
          </div>
        </div>

        <button
          onClick={onBack}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
      </div>

      {/* State Diff Summary Panel */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
          <GitCompare size={15} style={{ color: '#2563eb' }} />
          <span>Workspace State Diff Comparison</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '4px' }}>
            <div style={{ color: '#64748b', fontWeight: 600, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={12} />
              <span>Canvas Shapes Diff</span>
            </div>
            <div style={{ color: '#0f172a', fontWeight: 700 }}>
              {diff.currentShapesCount} → {diff.targetShapesCount} shapes ({diff.shapesDelta >= 0 ? `+${diff.shapesDelta}` : diff.shapesDelta})
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '4px' }}>
            <div style={{ color: '#64748b', fontWeight: 600, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Code size={12} />
              <span>Code Buffer Length Diff</span>
            </div>
            <div style={{ color: '#0f172a', fontWeight: 700 }}>
              {diff.currentCodeLength} → {diff.targetCodeLength} chars ({diff.codeDelta >= 0 ? `+${diff.codeDelta}` : diff.codeDelta})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#166534', fontWeight: 600 }}>
          <ShieldCheck size={14} />
          <span>Safety Backup snapshot will be automatically created before atomic rollback.</span>
        </div>
      </div>

      {/* Code Snippet Preview Box */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', fontSize: '11px', fontWeight: 700, color: '#475569', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
          <span>Code Preview Buffer ({snapshot.language || 'javascript'})</span>
          <span>{snapshot.codeLength || 0} chars</span>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '12px',
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxHeight: '120px',
            overflowY: 'auto',
            lineHeight: 1.4
          }}
        >
          {snapshot.code || '// No code text saved in this restore point'}
        </pre>
      </div>

      {/* Action Button — Day 4 Atomic Rollback */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={handleExecuteRollback}
          disabled={isRestoring}
          style={{
            flex: 1,
            backgroundColor: isRestoring ? '#15803d' : '#166534',
            color: '#ffffff',
            border: '1px solid #14532d',
            borderRadius: '4px',
            padding: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isRestoring ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={15} />
          <span>{isRestoring ? 'Executing Atomic Rollback...' : 'Execute Atomic State Rollback (Day 4)'}</span>
        </button>
      </div>
    </div>
  );
};
