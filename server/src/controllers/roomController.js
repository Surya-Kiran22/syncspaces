// In-memory room cache for Week 1 (Will be augmented with MongoDB in Week 3)
const activeRooms = new Map();

/**
 * Generate a random 6-character alphanumeric room code
 */
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * @desc    Create a new room or return existing
 * @route   POST /api/rooms
 */
export const createRoom = async (req, res) => {
  try {
    const { name, roomId: customRoomId } = req.body;
    const roomId = customRoomId ? customRoomId.trim().toUpperCase() : generateRoomId();

    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, {
        roomId,
        name: name || `Room ${roomId}`,
        createdAt: new Date().toISOString(),
        participants: []
      });
    }

    const room = activeRooms.get(roomId);
    return res.status(201).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ success: false, message: 'Server error creating room' });
  }
};

/**
 * @desc    Get room details / verify room existence
 * @route   GET /api/rooms/:roomId
 */
export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const normalizedId = roomId.trim().toUpperCase();

    if (!activeRooms.has(normalizedId)) {
      // For week 1, dynamically auto-create room if requested
      activeRooms.set(normalizedId, {
        roomId: normalizedId,
        name: `Room ${normalizedId}`,
        createdAt: new Date().toISOString(),
        participants: []
      });
    }

    const room = activeRooms.get(normalizedId);
    return res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching room' });
  }
};

export { activeRooms };
