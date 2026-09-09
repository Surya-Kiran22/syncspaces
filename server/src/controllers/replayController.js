import { Snapshot } from '../models/Snapshot.js';

/**
 * @desc    Get session timeline replay snapshots for a room
 * @route   GET /api/rooms/:roomId/replay
 */
export const getRoomReplaySnapshots = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 100, page = 1 } = req.query;

    const normalizedId = roomId.trim().toUpperCase();
    const parsedLimit = Math.min(Math.max(parseInt(limit), 1), 200);
    const parsedPage = Math.max(parseInt(page), 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const snapshots = await Snapshot.find({ roomId: normalizedId })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const totalCount = await Snapshot.countDocuments({ roomId: normalizedId });

    return res.status(200).json({
      success: true,
      roomId: normalizedId,
      totalCount,
      page: parsedPage,
      totalPages: Math.ceil(totalCount / parsedLimit),
      snapshots,
    });
  } catch (error) {
    console.error('Error fetching replay snapshots:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching replay history' });
  }
};

/**
 * Save a new timestamped snapshot
 */
export const recordSnapshot = async (roomId, shapes, code, actionType = 'canvas_draw', createdBy = 'System') => {
  try {
    await Snapshot.create({
      roomId: roomId.trim().toUpperCase(),
      timestamp: Date.now(),
      actionType,
      shapes: shapes || [],
      code: code || '',
      createdBy,
    });
  } catch (error) {
    console.error('Error recording snapshot:', error.message);
  }
};
