/**
 * Document Restore Service — Module M3 (Week 3 — Day 5: 81% - 100% Complete Document Restore Engine)
 * 
 * Provides core serialization, snapshot parsing, version validation, chronological indexing,
 * state diff calculation, atomic state rollback, auto-backup trigger, export/import file helpers,
 * and versioned history utilities for SyncSpace.
 */

// Validate Document Snapshot Structure
export const validateSnapshotVersion = (snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (!snapshot.versionId || typeof snapshot.versionId !== 'string') return false;
  if (!Array.isArray(snapshot.shapes)) return false;
  return true;
};

// Verify Snapshot Integrity & Integrity Guard — Day 5
export const verifySnapshotIntegrity = (snapshot) => {
  if (!validateSnapshotVersion(snapshot)) {
    return { valid: false, reason: 'Missing required snapshot metadata properties' };
  }
  if (typeof snapshot.code !== 'string') {
    return { valid: false, reason: 'Invalid code buffer format' };
  }
  return { valid: true, reason: 'Snapshot integrity verified 100%' };
};

// Serialize Current Document Workspace State into a Versioned Restore Snapshot
export const serializeDocumentState = ({ roomId, shapes = [], code = '', language = 'javascript', label = '' }) => {
  const timestamp = new Date().toISOString();
  const versionId = `SNAP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return {
    versionId,
    versionTag: '', // Assigned by repository
    roomId: roomId || 'DEFAULT_ROOM',
    label: label || 'Manual Restore Checkpoint',
    timestamp,
    formattedTime: new Date().toLocaleTimeString(),
    shapesCount: shapes.length,
    shapes: [...shapes],
    code: code || '',
    language,
    codeLength: code ? code.length : 0,
    created: timestamp
  };
};

// Parse Raw Snapshot Data for Restoration
export const parseSnapshotData = (rawData) => {
  try {
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    const check = verifySnapshotIntegrity(parsed);
    if (check.valid) {
      return { success: true, snapshot: parsed };
    }
    return { success: false, error: check.reason };
  } catch (err) {
    return { success: false, error: `JSON Parse Failure: ${err.message}` };
  }
};

// Export Snapshot Object to JSON File Download — Day 5
export const exportSnapshotToFile = (snapshot) => {
  if (!snapshot) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `syncspace-snapshot-${snapshot.versionTag || 'backup'}-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Compute Document State Diff
export const computeDocumentDiff = (currentState = { shapes: [], code: '' }, targetSnapshot) => {
  if (!targetSnapshot) {
    return { hasChanges: false, summary: 'No target snapshot selected' };
  }

  const currentShapesCount = currentState.shapes ? currentState.shapes.length : 0;
  const targetShapesCount = targetSnapshot.shapes ? targetSnapshot.shapes.length : 0;
  const shapesDelta = targetShapesCount - currentShapesCount;

  const currentCodeLength = currentState.code ? currentState.code.length : 0;
  const targetCodeLength = targetSnapshot.code ? targetSnapshot.code.length : 0;
  const codeDelta = targetCodeLength - currentCodeLength;

  const shapesSummary = shapesDelta === 0 
    ? 'Canvas shapes count unchanged' 
    : shapesDelta > 0 
      ? `Adds ${shapesDelta} canvas shape(s)` 
      : `Removes ${Math.abs(shapesDelta)} canvas shape(s)`;

  const codeSummary = codeDelta === 0 
    ? 'Code length unchanged' 
    : codeDelta > 0 
      ? `Adds +${codeDelta} code chars` 
      : `Removes -${Math.abs(codeDelta)} code chars`;

  return {
    hasChanges: shapesDelta !== 0 || codeDelta !== 0,
    currentShapesCount,
    targetShapesCount,
    shapesDelta,
    currentCodeLength,
    targetCodeLength,
    codeDelta,
    shapesSummary,
    codeSummary,
    summary: `${shapesSummary} • ${codeSummary}`
  };
};

// Atomic Document State Rollback Engine
export const restoreDocumentToState = (targetSnapshot, currentState = { shapes: [], code: '' }) => {
  const integrity = verifySnapshotIntegrity(targetSnapshot);
  if (!integrity.valid) {
    return { success: false, error: integrity.reason };
  }

  // 1. Generate automatic pre-rollback safety backup snapshot
  const safetyBackup = serializeDocumentState({
    roomId: targetSnapshot.roomId,
    shapes: currentState.shapes || [],
    code: currentState.code || '',
    label: `Pre-Rollback Safety Backup (${targetSnapshot.versionTag || targetSnapshot.versionId})`
  });
  restoreRepository.saveSnapshot(safetyBackup);

  // 2. Perform atomic re-hydration payload preparation
  const restoredShapes = Array.isArray(targetSnapshot.shapes) ? [...targetSnapshot.shapes] : [];
  const restoredCode = targetSnapshot.code || '';
  const restoredLanguage = targetSnapshot.language || 'javascript';

  return {
    success: true,
    versionTag: targetSnapshot.versionTag || 'Restored',
    versionId: targetSnapshot.versionId,
    shapes: restoredShapes,
    code: restoredCode,
    language: restoredLanguage,
    shapesCount: restoredShapes.length,
    codeLength: restoredCode.length,
    safetyBackupVersionId: safetyBackup.versionId,
    timestamp: new Date().toLocaleTimeString(),
    message: `Atomic rollback to version ${targetSnapshot.versionTag || targetSnapshot.versionId} completed cleanly!`
  };
};

// Versioned Restore Snapshot Repository Store
class DocumentRestoreRepository {
  constructor() {
    this.snapshots = [];
    this.versionCounter = 1;
    this.initDefaultHistory();
  }

  initDefaultHistory() {
    if (this.snapshots.length === 0) {
      const snap1 = serializeDocumentState({
        roomId: 'DEMO_ROOM',
        shapes: [
          { id: 's1', type: 'rectangle', x: 50, y: 50, width: 120, height: 80, color: '#2563eb', strokeWidth: 3 },
          { id: 's2', type: 'circle', x: 200, y: 150, radius: 40, color: '#166534', strokeWidth: 3 }
        ],
        code: '// SyncSpace Workspace Initial Setup\nfunction initWorkspace() {\n  console.log("Workspace initialized");\n}',
        label: 'Initial Architecture Scaffolding'
      });
      this.saveSnapshot(snap1);

      const snap2 = serializeDocumentState({
        roomId: 'DEMO_ROOM',
        shapes: [
          { id: 's1', type: 'rectangle', x: 50, y: 50, width: 120, height: 80, color: '#2563eb', strokeWidth: 3 },
          { id: 's2', type: 'circle', x: 200, y: 150, radius: 40, color: '#166534', strokeWidth: 3 },
          { id: 's3', type: 'text', x: 50, y: 220, text: 'Konva Canvas Active', color: '#0f172a', fontSize: 18 }
        ],
        code: '// SyncSpace Workspace Initial Setup\nfunction initWorkspace() {\n  console.log("Workspace initialized");\n}\n\ninitWorkspace();',
        label: 'Canvas Shapes & Code Execution Added'
      });
      this.saveSnapshot(snap2);
    }
  }

  saveSnapshot(snapshot) {
    if (validateSnapshotVersion(snapshot)) {
      const versionedSnapshot = {
        ...snapshot,
        versionTag: `v${this.versionCounter++}`,
        formattedTime: snapshot.formattedTime || new Date().toLocaleTimeString()
      };
      this.snapshots.unshift(versionedSnapshot);
      return versionedSnapshot;
    }
    return false;
  }

  getSnapshots() {
    return [...this.snapshots];
  }

  getSnapshotById(versionId) {
    return this.snapshots.find((s) => s.versionId === versionId) || null;
  }

  clearSnapshots() {
    this.snapshots = [];
    this.versionCounter = 1;
  }
}

export const restoreRepository = new DocumentRestoreRepository();
