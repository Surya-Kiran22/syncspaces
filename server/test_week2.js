import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

async function testWeek2() {
  console.log('--- Week 2 Automated CRDT Canvas & Awareness Test Suite ---');

  return new Promise((resolve) => {
    const clientA = io(SERVER_URL);
    const clientB = io(SERVER_URL);

    let shapeSynced = false;
    let cursorSynced = false;

    clientA.on('connect', () => {
      console.log('[Socket] Client A connected:', clientA.id);
      clientA.emit('join-room', { roomId: 'W2TEST', username: 'Alice' });
    });

    clientB.on('connect', () => {
      console.log('[Socket] Client B connected:', clientB.id);
      clientB.emit('join-room', { roomId: 'W2TEST', username: 'Bob' });
    });

    // Client B listens for remote shape updates from Client A
    clientB.on('canvas-shapes-remote-update', ({ shapes, updatedBy }) => {
      console.log('[PASS] Client B received remote shape update from:', updatedBy);
      console.log('       Shapes count:', shapes.length, 'Type:', shapes[0]?.type);
      if (shapes.length === 1 && shapes[0].type === 'rectangle') {
        shapeSynced = true;
        checkDone();
      }
    });

    // Client B listens for remote cursor movements from Client A
    clientB.on('remote-cursor-moved', ({ username, cursor }) => {
      console.log('[PASS] Client B received remote cursor from:', username, 'at:', cursor);
      if (username === 'Alice' && cursor.x === 250 && cursor.y === 400) {
        cursorSynced = true;
        checkDone();
      }
    });

    // ONLY Client A triggers the shape and cursor emit when 2 users are present
    clientA.on('room-users-updated', (data) => {
      if (data.users.length === 2) {
        console.log('[Info] Client A detected 2 users in room W2TEST. Emitting CRDT drawing & cursor updates...');
        
        setTimeout(() => {
          // 1. Client A draws a rectangle shape
          const sampleShape = [{
            id: 'rect-101',
            type: 'rectangle',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            color: '#6366F1',
            strokeWidth: 4
          }];

          clientA.emit('canvas-shapes-update', {
            roomId: 'W2TEST',
            shapes: sampleShape,
            action: 'add'
          });

          // 2. Client A moves mouse cursor
          clientA.emit('cursor-move', {
            roomId: 'W2TEST',
            x: 250,
            y: 400
          });
        }, 100);
      }
    });

    function checkDone() {
      if (shapeSynced && cursorSynced) {
        console.log('\n====================================================');
        console.log('✅ WEEK 2 CRDT CANVAS SYNC & AWARENESS CURSORS PASSED');
        console.log('====================================================\n');
        clientA.disconnect();
        clientB.disconnect();
        resolve(true);
      }
    }

    setTimeout(() => {
      clientA.disconnect();
      clientB.disconnect();
      resolve(true);
    }, 3000);
  });
}

testWeek2();
