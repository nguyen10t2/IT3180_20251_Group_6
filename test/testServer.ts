import { Elysia } from 'elysia';

// Load .env from root folder if exists
import { existsSync } from 'fs';
import { resolve } from 'path';

const rootEnv = resolve(import.meta.dir, '../.env');
const testEnv = resolve(import.meta.dir, '.env');

if (existsSync(testEnv)) {
  console.log('Loading .env from test directory');
} else if (existsSync(rootEnv)) {
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

const app = new Elysia();

// Health check endpoint
app.get('/', () => ({
  status: 'ok',
  message: 'Test Server is running',
  timestamp: new Date().toISOString(),
}));

// Test endpoint - Run all tests
app.get('/test/all', async () => {
  testRunner.clear();
  const startTime = Date.now();

  log.title('🚀 Starting All Service Tests');
  console.log('═'.repeat(60));

  try {
    await runAuthServiceTests();
    await runHouseServiceTests();
    await runNotificationServiceTests();
    await runResidentServiceTests();
    await runUserServiceTests();
  } catch (error: any) {
    log.error('Critical error during test execution: ' + error.message);
  }

  const summary = testRunner.getSummary();
  const duration = Date.now() - startTime;

  console.log('\n' + '═'.repeat(60));
  log.title('📊 Test Summary');
  console.log('═'.repeat(60));
  console.log(`${colors.bright}Total Tests:${colors.reset} ${summary.total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${summary.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${summary.failed}`);
  console.log(`${colors.cyan}Success Rate:${colors.reset} ${summary.percentage}%`);
  console.log(`${colors.yellow}Duration:${colors.reset} ${duration}ms`);
  console.log('═'.repeat(60));

  if (summary.errors.length > 0) {
    console.log(`\n${colors.red}${colors.bright}❌ Failed Tests:${colors.reset}`);
    console.log('─'.repeat(60));
    summary.errors.forEach((err, index) => {
      console.log(`${colors.red}${index + 1}. ${err.test}${colors.reset}`);
      console.log(`   ${colors.yellow}Error: ${err.error}${colors.reset}\n`);
    });
  }

  return {
    success: summary.failed === 0,
    summary: {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      percentage: summary.percentage,
      duration: `${duration}ms`,
    },
    errors: summary.errors,
    timestamp: new Date().toISOString(),
  };
});

// Test individual services
app.get('/test/auth', async () => {
  testRunner.clear();
  await runAuthServiceTests();
  return {
    service: 'Auth Service',
    summary: testRunner.getSummary(),
  };
});

app.get('/test/house', async () => {
  testRunner.clear();
  await runHouseServiceTests();
  return {
    service: 'House Service',
    summary: testRunner.getSummary(),
  };
});

app.get('/test/notification', async () => {
  testRunner.clear();
  await runNotificationServiceTests();
  return {
    service: 'Notification Service',
    summary: testRunner.getSummary(),
  };
});

app.get('/test/resident', async () => {
  testRunner.clear();
  await runResidentServiceTests();
  return {
    service: 'Resident Service',
    summary: testRunner.getSummary(),
  };
});

app.get('/test/user', async () => {
  testRunner.clear();
  await runUserServiceTests();
  return {
    service: 'User Service',
    summary: testRunner.getSummary(),
  };
});

// Get test results without running tests again
app.get('/test/results', () => {
  const summary = testRunner.getSummary();
  return {
    summary,
    timestamp: new Date().toISOString(),
  };
});

const PORT = Bun.env.TEST_PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n${colors.bright}${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}  🧪 Test Server is running on port ${PORT}${' '.repeat(19)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╠${'═'.repeat(58)}╣${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}  Available endpoints:${' '.repeat(36)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /                - Health check${' '.repeat(20)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /test/all       - Run all tests${' '.repeat(19)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /test/auth      - Test auth service${' '.repeat(15)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /test/house     - Test house service${' '.repeat(14)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /test/notification - Test notification service${' '.repeat(5)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /test/resident  - Test resident service${' '.repeat(11)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /test/user      - Test user service${' '.repeat(15)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}    GET /test/results   - Get last test results${' '.repeat(10)}${colors.bright}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}\n`);
});

export default app;
