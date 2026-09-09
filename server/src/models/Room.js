import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    default: 'SyncSpace Room',
  },
  createdBy: {
    type: String,
    default: 'Anonymous User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  yjsState: {
    type: Buffer,
    default: null,
  },
  shapes: {
    type: Array,
    default: [],
  },
  code: {
    type: String,
    default: '// Welcome to SyncSpace Collaborative Technical IDE\n',
  },
  language: {
    type: String,
    default: 'javascript',
  }
}, {
  timestamps: true,
});

export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
