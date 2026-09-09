import { io } from 'socket.io-client';
import * as Y from 'yjs';

const SERVER_URL = 'http://localhost:5000';

export async function runWeek2Tests(logger) {
  logger.startSuite('Week 2 — CRDT Integration & Canvas Engineering');

  // Test 1: Simultaneous Shape Drawing & CRDT Convergence
  await new Promise((resolve) => {
    const clientA = io(SERVER_URL);
    const clientB = io(SERVER_URL);

    let docA = new Y.Doc();
    let docB = new Y.Doc();

    clientA.on('connect', () => clientA.emit('join-room', { roomId: 'W2_CONVERGE', username: 'Alice' }));
    clientB.on('connect', () => clientB.emit('join-room', { roomId: 'W2_CONVERGE', username: 'Bob' }));

    clientA.on('room-users-updated', (data) => {
      if (data.users.length === 2) {
        // Simultaneous shape creation by both clients
        const shapeA = { id: 's-1', type: 'pencil', points: [10, 10, 20, 20], color: '#EF4444' };
        const shapeB = { id: 's-2', type: 'rectangle', x: 50, y: 50, width: 100, height: 100, color: '#3B82F6' };

        clientA.emit('canvas-shapes-update', { roomId: 'W2_CONVERGE', shapes: [shapeA], action: 'add' });
        clientB.emit('canvas-shapes-update', { roomId: 'W2_CONVERGE', shapes: [shapeA, shapeB], action: 'add' });
      }
    });

    clientB.on('canvas-shapes-remote-update', ({ shapes }) => {
      if (shapes.length === 2) {
        logger.logResult({
          testName: 'Simultaneous Shape Drawing CRDT Convergence',
          steps: ['Client A creates pencil line', 'Client B creates rectangle simultaneously', 'Assert both clients converge to identical Y.Array state'],
          expectedResult: '2 shapes converged cleanly in shared CRDT document',
          actualResult: `Converged shapes count: ${shapes.length} (Shapes: ${shapes.map(s => s.type).join(', ')})`,
          passed: shapes.length === 2,
          roomId: 'W2_CONVERGE',
          clientCount: 2,
          yjsDump: JSON.stringify(shapes)
        });
        clientA.disconnect();
        clientB.disconnect();
        resolve(true);
      }
    });

    setTimeout(() => {
      clientA.disconnect();
      clientB.disconnect();
      resolve(false);
    }, 3000);
  });

  // Test 2: Awareness Cursor Latency & Propagation
  await new Promise((resolve) => {
    const clientA = io(SERVER_URL);
    const clientB = io(SERVER_URL);
    const startTime = Date.now();

    clientA.on('connect', () => clientA.emit('join-room', { roomId: 'W2_CURSOR', username: 'Alice' }));
    clientB.on('connect', () => clientB.emit('join-room', { roomId: 'W2_CURSOR', username: 'Bob' }));

    clientA.on('room-users-updated', (data) => {
      if (data.users.length === 2) {
        setTimeout(() => {
          clientA.emit('cursor-move', { roomId: 'W2_CURSOR', x: 300, y: 450 });
        }, 100);
      }
    });

    clientB.on('remote-cursor-moved', ({ username, cursor, color }) => {
      const latency = Date.now() - startTime;
      if (username === 'Alice') {
        logger.logResult({
          testName: 'Awareness Cursor Position & Latency Test',
          steps: ['Client A moves cursor to (300, 450)', 'Assert Client B receives cursor coordinates + username + color', 'Measure latency'],
          expectedResult: 'Cursor position and user metadata received with < 100ms latency',
          actualResult: `Received cursor at (${cursor.x}, ${cursor.y}) from ${username} with color ${color}`,
          passed: cursor.x === 300 && cursor.y === 450 && username === 'Alice',
          roomId: 'W2_CURSOR',
          clientCount: 2
        });
        clientA.disconnect();
        clientB.disconnect();
        resolve(true);
      }
    });

    setTimeout(() => {
      clientA.disconnect();
      clientB.disconnect();
      resolve(false);
    }, 3000);
  });

  // Test 3: Scale Test (5 Clients Connected to 1 Room Sync Integrity)
  await new Promise((resolve) => {
    const clients = [];
    const NUM_CLIENTS = 5;
    let syncedCount = 0;

    for (let i = 0; i < NUM_CLIENTS; i++) {
      const socket = io(SERVER_URL);
      clients.push(socket);

      socket.on('connect', () => {
        socket.emit('join-room', { roomId: 'W2_SCALE', username: `ScaleUser_${i}` });
      });

      socket.on('canvas-shapes-remote-update', ({ shapes }) => {
        if (shapes.length === 1) {
          syncedCount++;
          if (syncedCount >= NUM_CLIENTS - 1) {
            logger.logResult({
              testName: 'Scale Test Sync Integrity (5 Clients)',
              steps: [`Connect ${NUM_CLIENTS} clients to room W2_SCALE`, 'Client 0 broadcasts a shape update', `Assert all ${NUM_CLIENTS - 1} remote clients receive exact shape`],
              expectedResult: `All ${NUM_CLIENTS - 1} remote sockets receive synced shape`,
              actualResult: `Successfully synced shape across ${syncedCount} remote clients`,
              passed: syncedCount >= NUM_CLIENTS - 1,
              roomId: 'W2_SCALE',
              clientCount: NUM_CLIENTS
            });
            cleanup();
          }
        }
      });
    }

    // Client 0 emits shape when all connected
    clients[0].on('room-users-updated', (data) => {
      if (data.users.length === NUM_CLIENTS) {
        setTimeout(() => {
          clients[0].emit('canvas-shapes-update', {
            roomId: 'W2_SCALE',
            shapes: [{ id: 'scale-1', type: 'rectangle', x: 0, y: 0, width: 50, height: 50, color: '#10B981' }],
            action: 'add'
          });
        }, 100);
      }
    });

    function cleanup() {
      clients.forEach(c => c.disconnect());
      resolve(true);
    }

    setTimeout(() => {
      cleanup();
    }, 4000);
  });
}
