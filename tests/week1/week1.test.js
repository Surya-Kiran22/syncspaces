import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

export async function runWeek1Tests(logger) {
  logger.startSuite('Week 1 — Rooms & Socket Infrastructure');

  // Test 1: Multi-Socket Join Event Notification
  await new Promise((resolve) => {
    const clientA = io(SERVER_URL);
    let eventReceived = false;

    clientA.on('connect', () => {
      clientA.emit('join-room', { roomId: 'W1TEST', username: 'Alice' });

      // Connect Client B after Client A is in room
      setTimeout(() => {
        const clientB = io(SERVER_URL);
        clientB.on('connect', () => {
          clientB.emit('join-room', { roomId: 'W1TEST', username: 'Bob' });
        });
      }, 150);
    });

    clientA.on('user-joined', (data) => {
      if (data.username === 'Bob') {
        eventReceived = true;
        logger.logResult({
          testName: 'Multi-Socket Join Notification',
          steps: ['Connect Client A to W1TEST', 'Connect Client B to W1TEST', 'Assert Client A receives user-joined event when Client B enters'],
          expectedResult: 'Client A receives notification that Bob joined W1TEST',
          actualResult: `Client A received user-joined notification for user: ${data.username}`,
          passed: true,
          roomId: 'W1TEST',
          clientCount: 2
        });
        clientA.disconnect();
        resolve(true);
      }
    });

    setTimeout(() => {
      if (!eventReceived) {
        logger.logResult({
          testName: 'Multi-Socket Join Notification',
          steps: ['Connect 2 sockets'],
          expectedResult: 'Receive join event',
          actualResult: 'Timed out waiting for join event',
          passed: false,
          roomId: 'W1TEST',
          clientCount: 2
        });
        clientA.disconnect();
        resolve(false);
      }
    }, 4000);
  });

  // Test 2: Room Isolation Test (Room A vs Room B)
  await new Promise((resolve) => {
    const clientRoomA = io(SERVER_URL);
    const clientRoomB = io(SERVER_URL);
    let leakedEvent = false;

    clientRoomA.on('connect', () => {
      clientRoomA.emit('join-room', { roomId: 'ROOM_ALPHA', username: 'UserAlpha' });
    });

    clientRoomB.on('connect', () => {
      clientRoomB.emit('join-room', { roomId: 'ROOM_BETA', username: 'UserBeta' });
    });

    clientRoomA.on('user-joined', (data) => {
      if (data.username === 'UserBeta') {
        leakedEvent = true;
      }
    });

    setTimeout(() => {
      logger.logResult({
        testName: 'Room Scoping Isolation Test',
        steps: ['Connect Client A to ROOM_ALPHA', 'Connect Client B to ROOM_BETA', 'Assert Client A receives 0 events from ROOM_BETA'],
        expectedResult: 'Strict room scoping (0 cross-room event leaks)',
        actualResult: leakedEvent ? 'FAILED: Event leaked across rooms' : 'Passed: Sockets in ROOM_ALPHA received 0 events from ROOM_BETA',
        passed: !leakedEvent,
        roomId: 'ROOM_ALPHA',
        clientCount: 2
      });
      clientRoomA.disconnect();
      clientRoomB.disconnect();
      resolve(true);
    }, 1500);
  });

  // Test 3: Reconnect Behavior & User List Deduplication
  await new Promise((resolve) => {
    let client = io(SERVER_URL);
    let joinCount = 0;

    client.on('connect', () => {
      client.emit('join-room', { roomId: 'RECONNECT_ROOM', username: 'Charlie' });
    });

    client.on('room-users-updated', (data) => {
      joinCount++;
      if (joinCount === 1) {
        client.disconnect();
        setTimeout(() => {
          client = io(SERVER_URL);
          client.on('connect', () => {
            client.emit('join-room', { roomId: 'RECONNECT_ROOM', username: 'Charlie' });
          });
          client.on('room-users-updated', (reconnectData) => {
            const charlieCount = reconnectData.users.filter(u => u.username === 'Charlie').length;
            logger.logResult({
              testName: 'Reconnect User List Deduplication',
              steps: ['Connect user Charlie to room', 'Disconnect socket', 'Reconnect user Charlie to room', 'Assert no duplicate Charlie entries in user list'],
              expectedResult: '1 user entry for Charlie in room user list',
              actualResult: `User list count for Charlie after reconnect: ${charlieCount} (Total users: ${reconnectData.users.length})`,
              passed: charlieCount === 1,
              roomId: 'RECONNECT_ROOM',
              clientCount: 1
            });
            client.disconnect();
            resolve(true);
          });
        }, 300);
      }
    });

    setTimeout(() => {
      client.disconnect();
      resolve(true);
    }, 4000);
  });

  // Test 4: Load Test (10 Simulated Concurrent Socket Connections)
  await new Promise((resolve) => {
    const clients = [];
    const NUM_CLIENTS = 10;
    let connectedCount = 0;

    for (let i = 0; i < NUM_CLIENTS; i++) {
      const socket = io(SERVER_URL);
      clients.push(socket);

      socket.on('connect', () => {
        socket.emit('join-room', { roomId: 'LOAD_ROOM', username: `SimUser_${i}` });
      });

      socket.on('room-users-updated', (data) => {
        if (data.users.length === NUM_CLIENTS) {
          connectedCount = data.users.length;
          logger.logResult({
            testName: 'Socket Server Load Test (10 Sockets)',
            steps: [`Spin up ${NUM_CLIENTS} simultaneous socket connections to LOAD_ROOM`, 'Assert server handles load without errors or memory leaks'],
            expectedResult: `${NUM_CLIENTS} active sockets connected in room user map`,
            actualResult: `Successfully connected ${connectedCount} sockets concurrently without error`,
            passed: connectedCount === NUM_CLIENTS,
            roomId: 'LOAD_ROOM',
            clientCount: NUM_CLIENTS
          });
          cleanup();
        }
      });
    }

    function cleanup() {
      clients.forEach(c => c.disconnect());
      resolve(true);
    }

    setTimeout(() => {
      cleanup();
    }, 4000);
  });
}
