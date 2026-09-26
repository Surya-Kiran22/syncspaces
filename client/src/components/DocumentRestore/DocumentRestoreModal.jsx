import React, { useState } from 'react';
import { RotateCcw, FileCheck, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { serializeDocumentState, parseSnapshotData, restoreRepository } from '../../services/documentRestoreService';

/**
 * DocumentRestoreModal Component — Module M3 (Week 3 — Day 1: 20% Baseline Architecture)
 * 
 * Provides an interactive UI dialog to create, inspect, and trigger Document Restore points.
 */
export const DocumentRestoreModal = ({ isOpen, onClose, currentShapes = [], currentCode = '', onRestoreConfirmed }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'import'

  if (!isOpen) return null;

  // Day 1: Create New Document Snapshot
  const handleCreateSnapshot = () => {
    const snapshot = serializeDocumentState({
      roomId: 'CURRENT_ROOM',
      shapes: currentShapes,
      code: currentCode
    });
    restoreRepository.saveSnapshot(snapshot);
    setStatusMessage({ type: 'success', text: `Created Snapshot ${snapshot.versionId} with ${snapshot.shapesCount} shapes!` });
  };

  // Day 1: Import & Restore Document Snapshot
  const handleImportAndRestore = (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste snapshot JSON data' });
      return;
    }

    const res = parseSnapshotData(jsonInput.trim());
    if (res.success) {
      restoreRepository.saveSnapshot(res.snapshot);
      if (onRestoreConfirmed) {
        onRestoreConfirmed(res.snapshot);
      }
      setStatusMessage({ type: 'success', text: `Document restored successfully from version ${res.snapshot.versionId}!` });
      setJsonInput('');
    } else {
      setStatusMessage({ type: 'error', text: res.error });
    }
  };

  const storedSnapshots = restoreRepository.getSnapshots();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '18px' }}>
            <RotateCcw size={20} style={{ color: '#166534' }} />
            <span>Document Restore Engine (M3 Day 1)</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Status Alert Badge */}
        {statusMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: statusMessage.type === 'success' ? '#166534' : '#dc2626',
              padding: '10px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => { setActiveTab('create'); setStatusMessage(null); }}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: activeTab === 'create' ? '#166534' : '#ffffff',
              color: activeTab === 'create' ? '#ffffff' : '#334155',
              cursor: 'pointer'
            }}
          >
            Create Backup Point
          </button>

          <button
            onClick={() => { setActiveTab('import'); setStatusMessage(null); }}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: activeTab === 'import' ? '#166534' : '#ffffff',
              color: activeTab === 'import' ? '#ffffff' : '#334155',
              cursor: 'pointer'
            }}
          >
            Restore From JSON
          </button>
        </div>

        {/* Tab 1: Create Backup Point */}
        {activeTab === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', fontSize: '13px', color: '#334155' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Current Active State Summary:</div>
              <div>• Canvas Shapes: <strong>{currentShapes.length}</strong></div>
              <div>• Code Buffer: <strong>{currentCode.length} characters</strong></div>
            </div>

            <button
              onClick={handleCreateSnapshot}
              style={{
                backgroundColor: '#166534',
                color: '#ffffff',
                border: '1px solid #14532d',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FileCheck size={16} />
              <span>Generate Restore Snapshot (Day 1)</span>
            </button>
          </div>
        )}

        {/* Tab 2: Import & Restore JSON */}
        {activeTab === 'import' && (
          <form onSubmit={handleImportAndRestore} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <textarea
              rows={5}
              placeholder="Paste snapshot JSON string here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              style={{
                backgroundColor: '#166534',
                color: '#ffffff',
                border: '1px solid #14532d',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Upload size={16} />
              <span>Validate & Restore Document State</span>
            </button>
          </form>
        )}

        {/* Stored Snapshots Counter Footer */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>Day 1 Repository Store: <strong>{storedSnapshots.length} version(s)</strong></span>
          <span>Week 3 M3 Baseline</span>
        </div>
      </div>
    </div>
  );
};
