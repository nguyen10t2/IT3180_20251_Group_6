# Test Suite - Standalone Installation

## 📦 Dependencies hoàn toàn độc lập

Test folder này có `package.json` riêng và có thể chạy độc lập.

## 🚀 Quick Start

```bash
# Bước 1: Vào thư mục test
cd test

# Bước 2: Install dependencies
bun install

# Bước 3: Chạy tests
bun run test
```

## 📋 Available Scripts

```bash
bun run test          # Chạy tất cả tests (run.ts)
bun run test:server   # Chạy test server với HTTP endpoints
bun run inspect       # Inspect database
bun run setup         # Setup test environment
```

## 🔧 Structure

```
test/
├── package.json      ← Dependencies riêng
├── tsconfig.json     ← TypeScript config
├── run.ts           ← Main test runner
├── testServer.ts    ← HTTP test server
├── helpers/         ← Test utilities
├── mock/           ← Mock data
└── services/       ← Service tests
```

## 💻 IDE Setup

Sau khi `bun install`, IDE sẽ nhận TypeScript config và không còn báo lỗi đỏ.

## 📝 Notes

- Tests vẫn import code từ `../backend/src/` nhưng TypeScript config đã setup paths
- Bun runtime không cần transpile nên chạy trực tiếp được
- IDE sẽ dùng tsconfig.json để check types

## ⚙️ Environment

Test suite dùng `.env` từ root folder hoặc có thể tạo `.env` riêng trong `test/`.
