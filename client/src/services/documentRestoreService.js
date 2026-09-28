/**
 * Document Restore Service — Module M3 (Week 3 — Day 2: 21% - 40% Version Indexing & History Storage)
 * 
 * Provides core serialization, snapshot parsing, version validation, chronological indexing,
 * and versioned history utilities for the SyncSpace collaborative document restore engine.
 */

// Validate Document Snapshot Structure
export const validateSnapshotVersion = (snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (!snapshot.versionId || typeof snapshot.versionId !== 'string') return false;
  if (!Array.isArray(snapshot.shapes)) return false;
  return true;
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
    if (validateSnapshotVersion(parsed)) {
      return { success: true, snapshot: parsed };
    }
    return { success: false, error: 'Invalid document snapshot schema format' };
  } catch (err) {
    return { success: false, error: `JSON Parse Failure: ${err.message}` };
  }
};

// Versioned Restore Snapshot Repository Store — Day 2
class DocumentRestoreRepository {
  constructor() {
    this.snapshots = [];
    this.versionCounter = 1;
    this.initDefaultHistory();
  }

  // Pre-populate demo historical checkpoints for Day 2 inspection
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
