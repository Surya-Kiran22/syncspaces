/**
 * Document Restore Service — Module M3 (Week 3 — Day 1: 20% Baseline Architecture)
 * 
 * Provides core serialization, snapshot parsing, version validation, and atomic state
 * restoration utilities for the SyncSpace collaborative document restore engine.
 */

// Validate Document Snapshot Structure
export const validateSnapshotVersion = (snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (!snapshot.versionId || typeof snapshot.versionId !== 'string') return false;
  if (!Array.isArray(snapshot.shapes)) return false;
  return true;
};

// Serialize Current Document Workspace State into a Restore Snapshot
export const serializeDocumentState = ({ roomId, shapes = [], code = '', language = 'javascript' }) => {
  const timestamp = new Date().toISOString();
  const versionId = `SNAP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return {
    versionId,
    roomId: roomId || 'DEFAULT_ROOM',
    timestamp,
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

// In-Memory Restore Snapshot Repository (Day 1 Scaffolding)
class DocumentRestoreRepository {
  constructor() {
    this.snapshots = [];
  }

  saveSnapshot(snapshot) {
    if (validateSnapshotVersion(snapshot)) {
      this.snapshots.unshift(snapshot);
      return true;
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
  }
}

export const restoreRepository = new DocumentRestoreRepository();
