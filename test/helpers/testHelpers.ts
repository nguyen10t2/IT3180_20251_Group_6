// Test helpers and utilities

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  status: 'passed' | 'failed' | 'timeout' | 'skipped';
}

export class TestRunner {
  private results: TestResult[] = [];
  private currentTest: string = '';
  private startTime: number = 0;
  private defaultTimeout: number = 5000; // 5s default timeout

  startTest(name: string) {
    this.currentTest = name;
    this.startTime = Date.now();
  }

  pass() {
    const duration = Date.now() - this.startTime;
    this.results.push({
      name: this.currentTest,
      passed: true,
      duration,
      status: 'passed',
    });
  }

  fail(error: string) {
    const duration = Date.now() - this.startTime;
    this.results.push({
      name: this.currentTest,
      passed: false,
      error,
      duration,
      status: 'failed',
    });
  }

  timeout(message?: string) {
    const duration = Date.now() - this.startTime;
    this.results.push({
      name: this.currentTest,
      passed: false,
      error: message || `Test timeout after ${this.defaultTimeout}ms`,
      duration,
      status: 'timeout',
    });
  }

  skip(reason: string) {
    this.results.push({
      name: this.currentTest,
      passed: true, // Skipped tests don't count as failures
      error: reason,
      duration: 0,
      status: 'skipped',
    });
  }

  async runWithTimeout<T>(fn: () => Promise<T>, timeout: number = this.defaultTimeout): Promise<T | null> {
    return Promise.race([
      fn(),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ]).catch((error) => {
      if (error.message === 'Timeout') {
        this.timeout();
      }
      throw error;
    });
  }

  getResults() {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    const percentage = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

    return {
      total,
      passed,
      failed,
      percentage: parseFloat(percentage),
      errors: this.results
        .filter((r) => !r.passed)
        .map((r) => ({ test: r.name, error: r.error })),
    };
  }

  clear() {
    this.results = [];
  }
}

export const testRunner = new TestRunner();

// Assertion helpers
export const assert = {
  isDefined: (value: any, message?: string) => {
    if (value === undefined || value === null) {
      throw new Error(message || 'Value is undefined or null');
    }
  },

  isNull: (value: any, message?: string) => {
    if (value !== null) {
      throw new Error(message || `Expected null but got ${value}`);
    }
  },

  equals: (actual: any, expected: any, message?: string) => {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected} but got ${actual}`
      );
    }
  },

  deepEquals: (actual: any, expected: any, message?: string) => {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(
        message || `Expected ${expectedStr} but got ${actualStr}`
      );
    }
  },

  hasProperty: (obj: any, prop: string, message?: string) => {
    if (!obj || !(prop in obj)) {
      throw new Error(message || `Object does not have property '${prop}'`);
    }
  },

  isError: (value: any, message?: string) => {
    if (!value || !value.error) {
      throw new Error(message || 'Expected error but got success');
    }
  },

  isSuccess: (value: any, message?: string) => {
    if (!value || !value.data) {
      throw new Error(message || 'Expected success but got error');
    }
  },

  lengthEquals: (arr: any[], length: number, message?: string) => {
    if (!Array.isArray(arr) || arr.length !== length) {
      throw new Error(
        message || `Expected array length ${length} but got ${arr?.length || 0}`
      );
    }
  },
};

// Colorize console output
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

export const log = {
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string, showError = false) => {
    if (showError) {
      console.log(`${colors.red}✗ ${msg}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${colors.dim}${msg}${colors.reset}`);
    }
  },
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  progress: (current: number, total: number, msg: string) => {
    const percentage = ((current / total) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(current / total * 20));
    const empty = '░'.repeat(20 - Math.floor(current / total * 20));
    process.stdout.write(`\r${colors.cyan}[${bar}${empty}] ${percentage}%${colors.reset} ${msg}`);
    if (current === total) console.log(''); // New line when complete
  },
  clear: () => process.stdout.write('\r' + ' '.repeat(80) + '\r'),
};
