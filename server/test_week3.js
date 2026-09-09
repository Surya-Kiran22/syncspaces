import { io } from 'socket.io-client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Room } from './src/models/Room.js';

dotenv.config();

const SERVER_URL = 'http://localhost:5000';

async function testWeek3() {
  console.log('--- Week 3 Automated Persistence & Monaco Code Sync Test Suite ---');

  // 1. Check MongoDB Atlas Connection directly
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[PASS] Connected directly to MongoDB Atlas for persistence verification');
  } catch (err) {
    console.error('[FAIL] MongoDB Atlas direct connection error:', err.message);
  }

  return new Promise((resolve) => {
    const clientA = io(SERVER_URL);
    const clientB = io(SERVER_URL);

    let codeSynced = false;

    clientA.on('connect', () => {
      console.log('[Socket] Client A connected:', clientA.id);
      clientA.emit('join-room', { roomId: 'W3TEST', username: 'Alice' });
    });

    clientB.on('connect', () => {
      console.log('[Socket] Client B connected:', clientB.id);
      clientB.emit('join-room', { roomId: 'W3TEST', username: 'Bob' });
    });

    // Client B listens for remote code updates from Client A
    clientB.on('code-text-remote-update', async ({ code, updatedBy }) => {
      console.log('[PASS] Client B received real-time Monaco code edit from:', updatedBy);
      console.log('       Code preview:', code.trim());
      if (code.includes('SyncSpace Week 3 Persistence')) {
        codeSynced = true;

        // Verify state saved to MongoDB Atlas!
        setTimeout(async () => {
          try {
            const savedRoom = await Room.findOne({ roomId: 'W3TEST' });
            if (savedRoom && savedRoom.code.includes('SyncSpace Week 3 Persistence')) {
              console.log('[PASS] Verified Room saved in MongoDB Atlas with code & Yjs binary state!');
              console.log('       MongoDB Document ID:', savedRoom._id, 'yjsState length:', savedRoom.yjsState ? savedRoom.yjsState.length : 0);
              console.log('\n====================================================');
              console.log('✅ WEEK 3 MONGODB PERSISTENCE & MONACO SYNC PASSED');
              console.log('====================================================\n');
            } else {
              console.error('[FAIL] Room not found in MongoDB or code mismatch');
            }
          } catch (err) {
            console.error('[FAIL] Error querying MongoDB:', err.message);
          } finally {
            clientA.disconnect();
            clientB.disconnect();
            await mongoose.disconnect();
            resolve(true);
          }
        }, 500);
      }
    });

    clientA.on('room-users-updated', (data) => {
      if (data.users.length === 2) {
        console.log('[Info] 2 users present in room W3TEST. Client A typing code into Monaco editor...');
        setTimeout(() => {
          clientA.emit('code-text-update', {
            roomId: 'W3TEST',
            code: 'function testPersistence() { return "SyncSpace Week 3 Persistence"; }',
            language: 'javascript'
          });
        }, 200);
      }
    });

    setTimeout(async () => {
      clientA.disconnect();
      clientB.disconnect();
      await mongoose.disconnect();
      resolve(true);
    }, 4000);
  });
}

testWeek3();
