import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

class TestLogger {
  constructor() {
    this.results = [];
    this.currentSuite = '';
  }

  startSuite(name) {
    this.currentSuite = name;
    console.log(`\n====================================================`);
    console.log(`🧪 SUITE: ${name}`);
    console.log(`====================================================`);
  }

  logResult({ testName, steps, expectedResult, actualResult, passed, roomId = 'N/A', clientCount = 0, yjsDump = null }) {
    const item = {
      suite: this.currentSuite,
      testName,
      steps,
      expectedResult,
      actualResult,
      passed,
      roomId,
      clientCount,
      yjsDump,
      timestamp: new Date().toISOString()
    };
    this.results.push(item);

    const badge = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n[${badge}] ${testName}`);
    console.log(`  • Steps: ${steps.join(' -> ')}`);
    console.log(`  • Expected: ${expectedResult}`);
    console.log(`  • Actual: ${actualResult}`);
    console.log(`  • Room ID: ${roomId} | Connected Clients: ${clientCount}`);
    if (!passed && yjsDump) {
      console.log(`  • Raw Yjs Document State Dump: ${yjsDump}`);
    }
  }

  printSummary() {
    const total = this.results.length;
    const passedCount = this.results.filter(r => r.passed).length;
    const failedCount = total - passedCount;

    console.log(`\n====================================================`);
    console.log(`📊 SYNCSPACE QA AUTOMATED TEST SUITE SUMMARY`);
    console.log(`====================================================`);
    console.log(`Total Executed Tests: ${total}`);
    console.log(`Passed: ${passedCount} ✅`);
    console.log(`Failed: ${failedCount} ❌`);
    console.log(`Overall Status: ${failedCount === 0 ? 'ALL PASSED (100% SUCCESS)' : 'SOME TESTS FAILED'}`);
    console.log(`====================================================\n`);
  }
}

async function runFullTestSuite() {
  console.log('⚡ STARTING FULL SYNCSPACE QA COMPREHENSIVE TEST SUITE...');
  const logger = new TestLogger();

  try {
    // 1. Establish MongoDB connection FIRST
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // 2. Dynamically import test modules after MongoDB is connected
    const { runSetupTests } = await import('./setup/setup.test.js');
    const { runWeek1Tests } = await import('./week1/week1.test.js');
    const { runWeek2Tests } = await import('./week2/week2.test.js');
    const { runWeek3Tests } = await import('./week3/week3.test.js');
    const { runWeek4Tests } = await import('./week4/week4.test.js');
    const { runCrossCuttingTests } = await import('./cross_cutting/cross_cutting.test.js');

    await runSetupTests(logger);
    await runWeek1Tests(logger);
    await runWeek2Tests(logger);
    await runWeek3Tests(logger);
    await runWeek4Tests(logger);
    await runCrossCuttingTests(logger);
  } catch (err) {
    console.error('Fatal Error during test suite execution:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    logger.printSummary();
    process.exit(0);
  }
}

runFullTestSuite();
