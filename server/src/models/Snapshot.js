import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
  },
  timestamp: {
    type: Number,
    default: () => Date.now(),
    index: true,
  },
  actionType: {
    type: String,
    enum: ['canvas_draw', 'canvas_clear', 'code_edit', 'initial_session'],
    default: 'canvas_draw',
  },
  shapes: {
    type: Array,
    default: [],
  },
  code: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    default: 'Anonymous',
  }
}, {
  timestamps: true,
});

export const Snapshot = mongoose.models.Snapshot || mongoose.model('Snapshot', snapshotSchema);
