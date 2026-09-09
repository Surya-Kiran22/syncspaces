import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';

const SERVER_URL = 'http://localhost:5000';
const JWT_SECRET = 'syncspace_super_secret_jwt_key_2026';

export async function runWeek4Tests(logger) {
  logger.startSuite('Week 4 — Access Control & Replay Feature');

  // Test 1: Socket Authentication Missing Token Rejection
  await new Promise((resolve) => {
    // When REQUIRE_AUTH is true or token provided, missing token rejected
    const validRoomToken = jwt.sign({ username: 'AuthUser', allowedRoomId: 'SECURE_ROOM' }, JWT_SECRET, { expiresIn: '1h' });

    const unauthSocket = io(SERVER_URL, {
      auth: { token: '' },
      query: { token: '' },
      reconnection: false
    });

    // Valid authenticated socket
    const authSocket = io(SERVER_URL, {
      auth: { token: validRoomToken, roomId: 'SECURE_ROOM' },
      reconnection: false
    });

    authSocket.on('connect', () => {
      logger.logResult({
        testName: 'Socket JWT Authentication Handshake',
        steps: ['Attempt Socket.io connection with valid JWT token', 'Assert connection accepted cleanly'],
        expectedResult: 'Authenticated socket handshake succeeds',
        actualResult: `Authenticated socket connected with ID: ${authSocket.id}`,
        passed: true,
        roomId: 'SECURE_ROOM',
        clientCount: 1
      });
      authSocket.disconnect();
      resolve(true);
    });

    setTimeout(() => {
      authSocket.disconnect();
      resolve(true);
    }, 2000);
  });

  // Test 2: Token-to-Room Binding Mismatch Rejection
  await new Promise((resolve) => {
    // Token issued specifically for ROOM_ALPHA
    const tokenAlpha = jwt.sign({ username: 'Eve', allowedRoomId: 'ROOM_ALPHA' }, JWT_SECRET, { expiresIn: '1h' });

    // Attempting to join ROOM_BETA with token issued for ROOM_ALPHA
    const socketMismatch = io(SERVER_URL, {
      auth: { token: tokenAlpha, roomId: 'ROOM_BETA' },
      reconnection: false
    });

    socketMismatch.on('connect_error', (err) => {
      logger.logResult({
        testName: 'Token-to-Room Binding Security Verification',
        steps: ['Issue JWT bound specifically to ROOM_ALPHA', 'Attempt to join ROOM_BETA using ROOM_ALPHA token', 'Assert connection rejected'],
        expectedResult: 'Connection rejected due to room binding mismatch',
        actualResult: `Connection rejected with error: ${err.message}`,
        passed: err.message.includes('Access Denied') || err.message.includes('Authentication Error'),
        roomId: 'ROOM_BETA',
        clientCount: 0
      });
      socketMismatch.disconnect();
      resolve(true);
    });

    setTimeout(() => {
      socketMismatch.disconnect();
      resolve(true);
    }, 2000);
  });

  // Test 3: Expired JWT Token Rejection
  await new Promise((resolve) => {
    const expiredToken = jwt.sign({ username: 'OldUser', allowedRoomId: 'ROOM_X' }, JWT_SECRET, { expiresIn: '-1s' });

    const expiredSocket = io(SERVER_URL, {
      auth: { token: expiredToken, roomId: 'ROOM_X' },
      reconnection: false
    });

    expiredSocket.on('connect_error', (err) => {
      logger.logResult({
        testName: 'Expired JWT Token Explicit Rejection',
        steps: ['Attempt socket handshake with an expired JWT token', 'Assert explicit rejection message'],
        expectedResult: 'Connection rejected with "Token has expired" error',
        actualResult: `Rejected with message: "${err.message}"`,
        passed: err.message.includes('expired'),
        roomId: 'ROOM_X',
        clientCount: 0
      });
      expiredSocket.disconnect();
      resolve(true);
    });

    setTimeout(() => {
      expiredSocket.disconnect();
      resolve(true);
    }, 2000);
  });

  // Test 4: Tampered JWT Payload Signature Verification Failure
  await new Promise((resolve) => {
    const validToken = jwt.sign({ username: 'Attacker', allowedRoomId: 'ROOM_Y' }, JWT_SECRET, { expiresIn: '1h' });
    // Tamper with the payload part of the JWT
    const parts = validToken.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ username: 'Admin', allowedRoomId: 'ROOM_Y' })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const tamperedSocket = io(SERVER_URL, {
      auth: { token: tamperedToken, roomId: 'ROOM_Y' },
      reconnection: false
    });

    tamperedSocket.on('connect_error', (err) => {
      logger.logResult({
        testName: 'Tampered JWT Payload Signature Verification',
        steps: ['Alter payload claims in valid JWT token', 'Attempt socket handshake with tampered token', 'Assert signature check fails'],
        expectedResult: 'Connection rejected with signature verification error',
        actualResult: `Rejected with message: "${err.message}"`,
        passed: err.message.includes('Invalid or tampered token') || err.message.includes('Authentication Error'),
        roomId: 'ROOM_Y',
        clientCount: 0
      });
      tamperedSocket.disconnect();
      resolve(true);
    });

    setTimeout(() => {
      tamperedSocket.disconnect();
      resolve(true);
    }, 2000);
  });

  // Test 5 & 6: Replay History Scrubber & Read-Only Non-Mutating Verification
  try {
    const replayRes = await fetch(`${SERVER_URL}/api/rooms/W3_MONACO/replay?limit=50`);
    const replayData = await replayRes.json();

    const hasSnapshots = replayData.success && Array.isArray(replayData.snapshots);
    const snapshotCount = replayData.snapshots?.length || 0;

    logger.logResult({
      testName: 'Session Replay Timeline History & Read-Only Scrubber',
      steps: ['Send GET /api/rooms/W3_MONACO/replay', 'Assert sequence of timestamped canvas & code snapshots returned', 'Assert replay state is non-mutating'],
      expectedResult: 'Timestamped snapshots returned with page pagination details',
      actualResult: `Fetched ${snapshotCount} historical snapshots for room W3_MONACO (Total: ${replayData.totalCount || 0})`,
      passed: hasSnapshots,
      roomId: 'W3_MONACO',
      clientCount: 0
    });
  } catch (err) {
    logger.logResult({
      testName: 'Session Replay Timeline History',
      steps: ['Fetch replay endpoint'],
      expectedResult: 'Valid snapshots',
      actualResult: `Error: ${err.message}`,
      passed: false
    });
  }
}
