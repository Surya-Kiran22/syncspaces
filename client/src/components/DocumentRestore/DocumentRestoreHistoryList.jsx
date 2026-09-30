import React from 'react';
import { History, Layers, Code, Clock, ArrowRight, Download } from 'lucide-react';
import { restoreRepository, exportSnapshotToFile } from '../../services/documentRestoreService';

/**
 * DocumentRestoreHistoryList Component — Module M3 (Week 3 — Day 5: 81% - 100% History List & File Export)
 * 
 * Displays an interactive chronological list of versioned restore snapshots with metadata badges & export download.
 */
export const DocumentRestoreHistoryList = ({ onSelectSnapshot }) => {
  const snapshots = restoreRepository.getSnapshots();

  if (snapshots.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '13px' }}>
        <History size={24} style={{ marginBottom: '8px', color: '#94a3b8' }} />
        <div>No historical document restore checkpoints saved yet.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
      {snapshots.map((snap) => (
        <div
          key={snap.versionId}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            transition: 'border-color 0.15s'
          }}
        >
          {/* Left Metadata Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
                {snap.versionTag || 'v1'}
              </span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                {snap.label || 'Document Restore Point'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {snap.formattedTime}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={12} />
                {snap.shapesCount} shapes
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Code size={12} />
                {snap.codeLength} chars
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => exportSnapshotToFile(snap)}
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Download snapshot JSON file"
            >
              <Download size={13} />
            </button>

            <button
              onClick={() => onSelectSnapshot && onSelectSnapshot(snap)}
              style={{
                backgroundColor: '#166534',
                color: '#ffffff',
                border: '1px solid #14532d',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
              title="Restore this document version"
            >
              <span>Restore</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
