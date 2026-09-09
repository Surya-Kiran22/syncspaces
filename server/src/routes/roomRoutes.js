import express from 'express';
import { createRoom, getRoom } from '../controllers/roomController.js';
import { getRoomReplaySnapshots } from '../controllers/replayController.js';

const router = express.Router();

// @route   POST /api/rooms
router.post('/', createRoom);

// @route   GET /api/rooms/:roomId
router.get('/:roomId', getRoom);

// @route   GET /api/rooms/:roomId/replay
router.get('/:roomId/replay', getRoomReplaySnapshots);

export default router;
