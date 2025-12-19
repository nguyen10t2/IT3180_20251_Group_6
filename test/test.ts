#!/usr/bin/env bun

/**
 * Quick Test Runner - Chạy ngay lập tức từ thư mục gốc
 * Usage: bun test.ts
 */

import { spawn } from 'bun';

console.log('🚀 Starting test runner...\n');

const proc = spawn(['bun', 'test/run.ts'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['inherit', 'inherit', 'inherit'],
});

await proc.exited;
process.exit(proc.exitCode || 0);
