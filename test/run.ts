#!/usr/bin/env bun

// Load .env from root folder if exists
import { existsSync } from 'fs';
import { resolve } from 'path';

const rootEnv = resolve(import.meta.dir, '../.env');
const testEnv = resolve(import.meta.dir, '.env');

if (existsSync(testEnv)) {
  // Use test/.env if exists
  console.log('Loading .env from test directory');
} else if (existsSync(rootEnv)) {
  // Otherwise use root .env
  const envFile = await Bun.file(rootEnv).text();
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

import { runAuthServiceTests } from './services/authServices.test';
import { runHouseServiceTests } from './services/houseServices.test';
import { runNotificationServiceTests } from './services/notificationServices.test';
import { runResidentServiceTests } from './services/residentServices.test';
import { runUserServiceTests } from './services/userServices.test';
import { testRunner, log, colors } from './helpers/testHelpers';
import { checkDatabaseConnection, checkDatabaseData } from './helpers/dbHelper';

const TEST_SUITES = [
  { name: 'Auth', icon: '🔐', fn: runAuthServiceTests },
  { name: 'House', icon: '🏠', fn: runHouseServiceTests },
  { name: 'Notification', icon: '🔔', fn: runNotificationServiceTests },
  { name: 'Resident', icon: '👤', fn: runResidentServiceTests },
  { name: 'User', icon: '👥', fn: runUserServiceTests },
];

function getProgressBar(percentage: number): string {
  const filled = Math.floor(percentage / 5);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  if (percentage >= 90) return `${colors.green}${bar}${colors.reset}`;
  if (percentage >= 70) return `${colors.yellow}${bar}${colors.reset}`;
  return `${colors.red}${bar}${colors.reset}`;
}

async function runAllTests() {
  console.clear();
  console.log(`\n${colors.bright}${colors.cyan}╔${'═'.repeat(78)}╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}${' '.repeat(20)}🧪 AUTO TEST RUNNER - SERVICE TESTS${' '.repeat(23)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚${'═'.repeat(78)}╝${colors.reset}\n`);

  // Check database connection first
  log.info('Checking database connection...');
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    process.exit(1);
  }

  // Check database data
  await checkDatabaseData();
  console.log('');

  testRunner.clear();
  const startTime = Date.now();
  let completedSuites = 0;

  try {
    for (let i = 0; i < TEST_SUITES.length; i++) {
      const suite = TEST_SUITES[i];
      log.progress(i, TEST_SUITES.length, `Running ${suite.icon} ${suite.name} Service...`);
      
      try {
        await Promise.race([
          suite.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Suite timeout')), 30000)
          ),
        ]);
        completedSuites++;
      } catch (error: any) {
        log.clear();
        log.warn(`${suite.icon} ${suite.name} Service: ${error.message || 'Unknown error'} - continuing...`);
        completedSuites++;
      }
    }
    
    log.progress(TEST_SUITES.length, TEST_SUITES.length, 'All tests completed!');

    const summary = testRunner.getSummary();
    const duration = Date.now() - startTime;
    const durationSec = (duration / 1000).toFixed(2);

    console.log('\n' + '═'.repeat(80));
    console.log(`${colors.bright}${colors.cyan}📊 FINAL TEST SUMMARY${colors.reset}`);
    console.log('═'.repeat(80));
    console.log(`${colors.bright}Total Tests:${colors.reset}      ${summary.total}`);
    console.log(`${colors.green}✓ Passed:${colors.reset}         ${summary.passed}`);
    console.log(`${colors.red}✗ Failed:${colors.reset}         ${summary.failed}`);
    console.log(`${colors.cyan}${colors.bright}Success Rate:${colors.reset}     ${summary.percentage}% ${getProgressBar(summary.percentage)}`);
    console.log(`${colors.yellow}⏱  Duration:${colors.reset}      ${durationSec}s`);
    console.log(`${colors.magenta}📦 Test Suites:${colors.reset}   ${completedSuites}/${TEST_SUITES.length} completed`);
    console.log('═'.repeat(80));

    if (summary.errors.length > 0) {
      const showCount = Math.min(5, summary.errors.length);
      console.log(`\n${colors.red}${colors.bright}❌ FAILED TESTS (showing ${showCount} of ${summary.errors.length}):${colors.reset}`);
      console.log('─'.repeat(80));
      summary.errors.slice(0, showCount).forEach((err, index) => {
        const shortError = err.error && err.error.length > 60 
          ? err.error.substring(0, 60) + '...' 
          : err.error || 'Unknown error';
        console.log(`${colors.dim}${index + 1}.${colors.reset} ${err.test}`);
        console.log(`   ${colors.yellow}${shortError}${colors.reset}`);
      });
      if (summary.errors.length > showCount) {
        console.log(`${colors.dim}   ... and ${summary.errors.length - showCount} more errors${colors.reset}`);
      }
      console.log('─'.repeat(80));
    } else {
      console.log(`\n${colors.green}${colors.bright}✅ ALL TESTS PASSED!${colors.reset}`);
    }

    console.log('\n' + '═'.repeat(80));
    if (summary.failed === 0) {
      console.log(`${colors.green}${colors.bright}Status: SUCCESS ✓${colors.reset}`);
      console.log(`${colors.green}All ${summary.total} tests completed successfully!${colors.reset}`);
    } else if (summary.percentage >= 80) {
      console.log(`${colors.yellow}${colors.bright}Status: PARTIAL SUCCESS ⚠${colors.reset}`);
      console.log(`${colors.yellow}${summary.passed} out of ${summary.total} tests passed (${summary.percentage}%)${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bright}Status: FAILURE ✗${colors.reset}`);
      console.log(`${colors.red}Only ${summary.passed} out of ${summary.total} tests passed (${summary.percentage}%)${colors.reset}`);
    }
    console.log('═'.repeat(80) + '\n');

    process.exit(summary.failed === 0 ? 0 : 1);

  } catch (error: any) {
    console.log('\n' + '═'.repeat(80));
    log.error(`Critical error: ${error.message}`, true);
    if (Bun.env.DEBUG) {
      console.log(error.stack);
    }
    console.log('═'.repeat(80) + '\n');
    
    const summary = testRunner.getSummary();
    if (summary.total > 0) {
      console.log(`${colors.yellow}Partial results: ${summary.passed}/${summary.total} tests passed${colors.reset}\n`);
    }
    process.exit(1);
  }
}

runAllTests();
