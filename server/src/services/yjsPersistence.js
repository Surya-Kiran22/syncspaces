import * as Y from 'yjs';
import { Room } from '../models/Room.js';

/**
 * Load Yjs document state from MongoDB or create new Y.Doc
 */
export const loadRoomYDocFromMongoDB = async (roomId, doc) => {
  try {
    if (!roomId || typeof roomId !== 'string' || !doc) return null;
    const cleanRoomId = roomId.trim().toUpperCase();
    const roomRecord = await Room.findOne({ roomId: cleanRoomId });
    if (roomRecord) {
      if (roomRecord.yjsState && roomRecord.yjsState.length > 0) {
        Y.applyUpdate(doc, new Uint8Array(roomRecord.yjsState));
        console.log(`[Persistence] Restored Yjs binary state from MongoDB for room: ${cleanRoomId}`);
      } else if (roomRecord.shapes && roomRecord.shapes.length > 0) {
        const yShapes = doc.getArray('shapes');
        yShapes.insert(0, roomRecord.shapes);
      }
      return roomRecord;
    }
  } catch (error) {
    console.error(`[Persistence] Error loading room ${roomId} from MongoDB:`, error.message);
  }
  return null;
};

/**
 * Save Yjs document state to MongoDB
 */
export const saveRoomYDocToMongoDB = async (roomId, doc, language = 'javascript') => {
  try {
    if (!roomId || typeof roomId !== 'string' || !doc) return;
    const cleanRoomId = roomId.trim().toUpperCase();
    const binaryState = Buffer.from(Y.encodeStateAsUpdate(doc));
    const yShapes = doc.getArray('shapes').toArray();
    const yText = doc.getText('codetext').toString();

    await Room.findOneAndUpdate(
      { roomId: cleanRoomId },
      {
        roomId: cleanRoomId,
        yjsState: binaryState,
        shapes: yShapes,
        code: yText,
        language: language || 'javascript',
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );
    console.log(`[Persistence] Saved room '${cleanRoomId}' state to MongoDB (${yShapes.length} shapes, ${yText.length} chars code)`);
  } catch (error) {
    console.error(`[Persistence] Error saving room '${roomId}' to MongoDB:`, error.message);
  }
};
