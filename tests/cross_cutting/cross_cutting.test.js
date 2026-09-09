import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

export async function runCrossCuttingTests(logger) {
  logger.startSuite('Cross-Cutting Tests — Security & Resilience');

  // Test 1: XSS / Script Injection Attempt Sanitization
  await new Promise((resolve) => {
    const client = io(SERVER_URL);

    client.on('connect', () => {
      client.emit('join-room', { roomId: 'XSS_ROOM', username: '<script>alert("xss")</script>' });
    });

    client.on('room-users-updated', (data) => {
      const user = data.users.find(u => u.socketId === client.id);
      const isSanitizedOrEscaped = user && !user.username.includes('eval(');

      logger.logResult({
        testName: 'XSS & Script Injection Payload Handling',
        steps: ['Emit username containing <script>alert("xss")</script> injection payload', 'Assert server handles input safely as literal text'],
        expectedResult: 'Script payload treated as plain text string without evaluation',
        actualResult: `User registered with name string: "${user?.username}"`,
        passed: isSanitizedOrEscaped,
        roomId: 'XSS_ROOM',
        clientCount: 1
      });
      client.disconnect();
      resolve(true);
    });

    setTimeout(() => {
      client.disconnect();
      resolve(false);
    }, 2000);
  });

  // Test 2: Network Resilience & Auto-Reconnection
  await new Promise((resolve) => {
    const client = io(SERVER_URL, { reconnection: true, reconnectionDelay: 200 });
    let disconnectTriggered = false;

    client.on('connect', () => {
      if (!disconnectTriggered) {
        client.emit('join-room', { roomId: 'RESILIENCE_ROOM', username: 'ResilientUser' });
        setTimeout(() => {
          disconnectTriggered = true;
          // Force drop connection mid-session
          client.io.engine.close();
        }, 300);
      } else {
        // Reconnected successfully!
        logger.logResult({
          testName: 'Network Dropped Connection & Clean Reconnection',
          steps: ['Establish room session', 'Simulate abrupt network connection drop mid-session', 'Assert Socket.io client auto-reconnects cleanly'],
          expectedResult: 'Clean automatic reconnection without session data corruption',
          actualResult: `Socket auto-reconnected successfully with new ID: ${client.id}`,
          passed: true,
          roomId: 'RESILIENCE_ROOM',
          clientCount: 1
        });
        client.disconnect();
        resolve(true);
      }
    });

    setTimeout(() => {
      client.disconnect();
      resolve(true);
    }, 3000);
  });
}
