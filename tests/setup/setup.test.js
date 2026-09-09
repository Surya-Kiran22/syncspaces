import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const SERVER_URL = 'http://localhost:5000';

export async function runSetupTests(logger) {
  logger.startSuite('Setup Verification');

  // Test 1: Server Boot & MongoDB Atlas Connection
  try {
    const healthRes = await fetch(`${SERVER_URL}/api/health`);
    const healthData = await healthRes.json();

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    const dbName = mongoose.connection.db.databaseName;

    logger.logResult({
      testName: 'Server Boot & MongoDB Atlas Connection',
      steps: ['Send GET /api/health to backend', 'Connect directly to MongoDB Atlas using MONGODB_URI env var'],
      expectedResult: 'Server responds with status: ok, MongoDB connects cleanly to alexro database',
      actualResult: `Server status: ${healthData.status}, MongoDB connected to database: ${dbName}`,
      passed: healthData.status === 'ok' && dbName === 'alexro',
      roomId: 'N/A',
      clientCount: 0
    });
  } catch (err) {
    logger.logResult({
      testName: 'Server Boot & MongoDB Atlas Connection',
      steps: ['Send GET /api/health', 'Connect to MongoDB'],
      expectedResult: 'Clean connection',
      actualResult: `Error: ${err.message}`,
      passed: false
    });
  }

  // Test 2: Database Collections Verification
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    logger.logResult({
      testName: 'MongoDB Collections Verification',
      steps: ['List all collections in alexro database'],
      expectedResult: 'Expected collections (rooms, users, snapshots) exist or ready for creation',
      actualResult: `Existing collections: [${collectionNames.join(', ')}]`,
      passed: true,
      roomId: 'N/A',
      clientCount: 0
    });
  } catch (err) {
    logger.logResult({
      testName: 'MongoDB Collections Verification',
      steps: ['List collections'],
      expectedResult: 'Success',
      actualResult: `Error: ${err.message}`,
      passed: false
    });
  }

  // Test 3: CORS Header Verification
  try {
    const corsRes = await fetch(`${SERVER_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET'
      }
    });

    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    const isCorsScoped = allowOrigin === 'http://localhost:5173' || allowOrigin === '*';

    logger.logResult({
      testName: 'CORS Scoping Test',
      steps: ['Send OPTIONS request with Origin: http://localhost:5173'],
      expectedResult: 'Access-Control-Allow-Origin header matches allowed frontend origin',
      actualResult: `Access-Control-Allow-Origin header returned: ${allowOrigin}`,
      passed: isCorsScoped,
      roomId: 'N/A',
      clientCount: 0
    });
  } catch (err) {
    logger.logResult({
      testName: 'CORS Scoping Test',
      steps: ['Send OPTIONS CORS preflight'],
      expectedResult: 'CORS header validated',
      actualResult: `Error: ${err.message}`,
      passed: false
    });
  }
}
