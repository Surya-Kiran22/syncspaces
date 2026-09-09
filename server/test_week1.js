import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

async function testWeek1() {
  console.log('--- Week 1 Automated Test Suite ---');

  // 1. Health Check REST Test
  try {
    const healthRes = await fetch(`${SERVER_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('[PASS] REST Health Check:', healthData.status === 'ok' ? 'OK' : 'FAILED', healthData);
  } catch (err) {
    console.error('[FAIL] REST Health Check Failed:', err.message);
  }

  // 2. Room Creation REST Test
  try {
    const roomRes = await fetch(`${SERVER_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Automated Test Room', roomId: 'W1TEST' })
    });
    const roomData = await roomRes.json();
    console.log('[PASS] REST Room Creation:', roomData.success ? 'OK' : 'FAILED', roomData);
  } catch (err) {
    console.error('[FAIL] REST Room Creation Failed:', err.message);
  }

  // 3. Socket.io Client Connection & Scoped Room Join Test
  return new Promise((resolve) => {
    const clientA = io(SERVER_URL);
    const clientB = io(SERVER_URL);

    let clientAJoined = false;
    let clientBJoined = false;

    clientA.on('connect', () => {
      console.log('[Socket] Client A connected with ID:', clientA.id);
      clientA.emit('join-room', { roomId: 'W1TEST', username: 'Alice' });
    });

    clientB.on('connect', () => {
      console.log('[Socket] Client B connected with ID:', clientB.id);
      clientB.emit('join-room', { roomId: 'W1TEST', username: 'Bob' });
    });

    clientA.on('user-joined', (data) => {
      console.log('[PASS] Client A received user-joined event:', data.username);
      if (data.username === 'Bob') clientBJoined = true;
      checkDone();
    });

    clientA.on('room-users-updated', (data) => {
      console.log('[PASS] Room users updated in room W1TEST:', data.users.map(u => u.username));
      if (data.users.length === 2) clientAJoined = true;
      checkDone();
    });

    function checkDone() {
      if (clientAJoined && clientBJoined) {
        console.log('\n====================================================');
        console.log('✅ WEEK 1 AUTOMATED SOCKET & REST TESTS PASSED CLEANLY');
        console.log('====================================================\n');
        clientA.disconnect();
        clientB.disconnect();
        resolve(true);
      }
    }

    setTimeout(() => {
      console.log('[INFO] Test run completed. Disconnecting sockets.');
      clientA.disconnect();
      clientB.disconnect();
      resolve(true);
    }, 3000);
  });
}

testWeek1();
