import React, { useState } from 'react';
import { RotateCcw, FileCheck, Upload, AlertCircle, CheckCircle2, X, History, Eye } from 'lucide-react';
import { serializeDocumentState, parseSnapshotData, restoreRepository } from '../../services/documentRestoreService';
import { DocumentRestoreHistoryList } from './DocumentRestoreHistoryList';
import { DocumentRestorePreview } from './DocumentRestorePreview';

/**
 * DocumentRestoreModal Component — Module M3 (Week 3 — Day 3: 41% - 60% Version Preview & State Diff Engine)
 * 
 * Provides an interactive UI dialog to create, list history versions, preview diffs, and restore Document points.
 */
export const DocumentRestoreModal = ({ isOpen, onClose, currentShapes = [], currentCode = '', onRestoreConfirmed }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'create' | 'import' | 'preview'
  const [selectedPreviewSnapshot, setSelectedPreviewSnapshot] = useState(null);

  if (!isOpen) return null;

  const currentState = { shapes: currentShapes, code: currentCode };

  // Create New Document Snapshot
  const handleCreateSnapshot = () => {
    const snapshot = serializeDocumentState({
      roomId: 'CURRENT_ROOM',
      shapes: currentShapes,
      code: currentCode
    });
    const saved = restoreRepository.saveSnapshot(snapshot);
    setStatusMessage({ type: 'success', text: `Created Restore Point ${saved.versionTag} (${saved.versionId})!` });
    setActiveTab('history');
  };

  // Import & Restore Document Snapshot
  const handleImportAndRestore = (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste snapshot JSON data' });
      return;
    }

    const res = parseSnapshotData(jsonInput.trim());
    if (res.success) {
      const saved = restoreRepository.saveSnapshot(res.snapshot);
      setSelectedPreviewSnapshot(saved || res.snapshot);
      setActiveTab('preview');
      setJsonInput('');
    } else {
      setStatusMessage({ type: 'error', text: res.error });
    }
  };

  // Select Snapshot from History List for Day 3 Diff Preview
  const handleSelectHistorySnapshot = (snap) => {
    setSelectedPreviewSnapshot(snap);
    setActiveTab('preview');
  };

  // Final Confirmation of Restore Action
  const handleConfirmRestore = (snap) => {
    if (onRestoreConfirmed) {
      onRestoreConfirmed(snap);
    }
    setStatusMessage({ type: 'success', text: `Document restored successfully to version ${snap.versionTag || snap.versionId}!` });
    setActiveTab('history');
    setSelectedPreviewSnapshot(null);
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
          maxWidth: '560px',
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
            <span>Document Restore Engine (M3 Day 3)</span>
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

        {/* Tab Navigation Buttons — Day 3 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          <button
            onClick={() => { setActiveTab('history'); setStatusMessage(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: activeTab === 'history' ? '#166534' : '#ffffff',
              color: activeTab === 'history' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <History size={14} />
            <span>Version History ({storedSnapshots.length})</span>
          </button>

          {selectedPreviewSnapshot && (
            <button
              onClick={() => { setActiveTab('preview'); setStatusMessage(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: activeTab === 'preview' ? '#166534' : '#ffffff',
                color: activeTab === 'preview' ? '#ffffff' : '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Eye size={14} />
              <span>Version Diff Preview</span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab('create'); setStatusMessage(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: activeTab === 'create' ? '#166534' : '#ffffff',
              color: activeTab === 'create' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileCheck size={14} />
            <span>Create Backup</span>
          </button>
        </div>

        {/* Tab 1: History Version List */}
        {activeTab === 'history' && (
          <DocumentRestoreHistoryList onSelectSnapshot={handleSelectHistorySnapshot} />
        )}

        {/* Tab 2: State Diff Preview (Day 3 Engine) */}
        {activeTab === 'preview' && selectedPreviewSnapshot && (
          <DocumentRestorePreview
            snapshot={selectedPreviewSnapshot}
            currentState={currentState}
            onConfirmRestore={handleConfirmRestore}
            onBack={() => setActiveTab('history')}
          />
        )}

        {/* Tab 3: Create Backup Point */}
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
              <span>Generate Restore Checkpoint (Day 3)</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>Day 3 State Diff Engine: <strong>{storedSnapshots.length} version(s)</strong></span>
          <span>Week 3 M3 Version Diffing</span>
        </div>
      </div>
    </div>
  );
};
