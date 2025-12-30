# 🏘️ IT3180 - Apartment Management System

Hệ thống quản lý chung cư được xây dựng với Bun runtime, ElysiaJS và PostgreSQL.

## 📋 Mục lục

- [Tech Stack](#-tech-stack)
- [Cấu trúc Project](#-cấu-trúc-project)
- [Cài đặt Backend](#-cài-đặt-backend)
- [Test Suite](#-test-suite)
- [Scripts](#-scripts-có-sẵn)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Bun (latest)
- **Framework:** ElysiaJS
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Language:** TypeScript

### Testing
- **Test Runner:** Custom Bun Test Runner
- **Test Framework:** ElysiaJS Endpoints
- **Coverage:** 91.84% (45/49 tests passing)

---

## 📁 Cấu trúc Project

```
IT3180_20251_Group_6/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── server.ts          # Entry point
│   │   ├── constants/         # Constants
│   │   ├── database/          # Database config
│   │   ├── handlers/          # Request handlers
│   │   ├── helpers/           # Helper functions
│   │   ├── models/            # Drizzle ORM models
│   │   ├── plugins/           # Auth & authorization
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── sql/               # SQL scripts
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── test/                       # Test suite (standalone)
│   ├── services/              # Service tests
│   │   ├── authServices.test.ts
│   │   ├── houseServices.test.ts
│   │   ├── notificationServices.test.ts
│   │   ├── residentServices.test.ts
│   │   └── userServices.test.ts
│   ├── helpers/               # Test utilities
│   ├── mock/                  # Mock data
│   ├── run.ts                 # Test runner
│   ├── testServer.ts          # HTTP test server
│   ├── package.json           # Independent dependencies
│   ├── COVERAGE.md            # Coverage report
│   └── INSTALL.md             # Installation guide
│
└── docs/                       # Documentation
```

---

## 🚀 Cài đặt Backend

### Prerequisites
- Bun (v1.0+)
- PostgreSQL (v14+)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd IT3180_20251_Group_6

# Install dependencies
cd backend
bun install

# Setup database
# 1. Tạo database PostgreSQL
# 2. Copy .env.example thành .env
# 3. Cập nhật DATABASE_URL trong .env

# Run migrations
bun run src/sql/init.sql

# Start development server
bun run dev
```

Server sẽ chạy tại `http://localhost:3000`

---

## 🧪 Test Suite

### Tổng quan

Test suite hoàn toàn độc lập với 49 test cases covering tất cả services.

**Coverage Summary:**
- ✅ **45/49 tests passing** (91.84%)
- ⚡ **Duration:** ~0.68s
- 📦 **5/5 test suites** completed

### Quick Start

```bash
# Bước 1: Install test dependencies (chỉ cần 1 lần)
cd test
bun install

# Bước 2: Chạy tests
bun run test
```

### Chi tiết Coverage

#### 🔐 Auth Services (13 tests)
- Login validation
- Refresh token management
- OTP operations
- Reset password tokens
- Cleanup expired tokens

#### 🏠 House Services (6 tests)
- CRUD operations
- Get house by ID
- Update house details

#### 🔔 Notification Services (7 tests)
- CRUD operations
- User notifications
- Mark as read
- Scheduled notifications

#### 👤 Resident Services (9 tests)
- CRUD operations
- Get by phone/ID/card
- User-resident mapping

#### 👥 User Services (14 tests)
- CRUD operations
- Pagination
- Email verification
- Approval workflow
- Pending users management

### Test Options

#### 1. CLI Test Runner (Khuyến nghị)
```bash
cd test
bun run test
```

Hiển thị:
- ✅ Progress bar real-time
- 📊 Success rate percentage
- 🎨 Color-coded output
- 📝 Error summary
- ⏱️ Duration tracking

#### 2. HTTP Test Server
```bash
cd test
bun run test:server
```

Endpoints:
- `http://localhost:3001/` - Health check
- `http://localhost:3001/test/all` - Run all tests
- `http://localhost:3001/test/auth` - Test Auth Service
- `http://localhost:3001/test/house` - Test House Service
- `http://localhost:3001/test/notification` - Test Notification Service
- `http://localhost:3001/test/resident` - Test Resident Service
- `http://localhost:3001/test/user` - Test User Service
- `http://localhost:3001/test/results` - View last results

#### 3. Database Inspector
```bash
cd test
bun run inspect
```

Hiển thị:
- Database connection status
- Table counts
- Sample data
- Filter analysis

### Test Output Example

```
🔐 Testing Auth Services
✓ Login with invalid email returns error
✓ Login with wrong password returns error
✓ Refresh token created successfully
...

═══════════════════════════════════════════════════════════════
📊 FINAL TEST SUMMARY
═══════════════════════════════════════════════════════════════
Total Tests:     49
✓ Passed:        45
✗ Failed:        4
Success Rate:    91.84%
Duration:        678ms
═══════════════════════════════════════════════════════════════
```

### Known Issues (4 failures)

1. **authServices.createOtp** - Cần setup OTP table
2. **authServices.cleanupExpiredOtps** - Assertion mismatch
3. **notificationServices.markNotificationAsRead** - Assertion mismatch
4. **residentServices.updateResident** - Database constraint

Các lỗi này do:
- Database constraints
- Missing test data
- Assertion type mismatches (có thể fix)

Xem chi tiết: [test/COVERAGE.md](test/COVERAGE.md)

---

## 📜 Scripts có sẵn

### Backend Scripts
```bash
bun run dev              # Start development server
bun run start            # Start production server
bun run seed             # Seed database with test data
```

### Test Scripts
```bash
cd test

bun run test             # Run all tests (CLI)
bun run test:server      # Start HTTP test server
bun run inspect          # Inspect database
bun install              # Install test dependencies
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/apartment_db

# Server
PORT=3000

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Test (.env hoặc test/.env)
```env
# Test Database (optional - fallback to DATABASE_URL)
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/test_db

# Test Server Port (optional - default: 3001)
TEST_PORT=3001
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port đã được sử dụng:**
```bash
# Đổi PORT trong .env
PORT=3001
```

**Database connection error:**
```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql

# Kiểm tra DATABASE_URL trong .env
# Format: postgresql://username:password@host:port/database
```

**Import errors:**
```bash
cd backend
bun install
```

### Test Issues

**Tests fail với database errors:**
```bash
# Kiểm tra DATABASE_URL trong .env
# Hoặc tạo test database riêng
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/test_db
```

**IDE báo lỗi đỏ trong test folder:**
```bash
# Install dependencies trong test folder
cd test
bun install

# Restart IDE/TypeScript server
```

**Port 3001 đã được sử dụng:**
```bash
# Đổi TEST_PORT trong .env
TEST_PORT=3002
```

**Bun command not found:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Hoặc với npm
npm install -g bun
```

---

## 📚 Documentation

- [Backend README](backend/README.md) - Backend setup guide
- [Test Coverage](test/COVERAGE.md) - Detailed coverage report
- [Test Installation](test/INSTALL.md) - Test setup guide
- [Workflow Diagrams](docs/Sơ%20đồ%20luồng%20hoạt%20động/) - Process flows

---

## 🎯 Workflow

### Development
```bash
# Terminal 1: Backend
cd backend
bun run dev

# Terminal 2: Tests (optional)
cd test
bun run test
```

### Testing
```bash
# Quick test
cd test && bun run test

# Detailed inspection
cd test && bun run inspect

# HTTP endpoints
cd test && bun run test:server
```

---

## 👥 Contributors

IT3180_20251_Group_6

---

## 📝 License

This project is part of IT3180 course at HUST.

---

## 🔗 Links

- [ElysiaJS Documentation](https://elysiajs.com)
- [Bun Documentation](https://bun.sh/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [PostgreSQL](https://www.postgresql.org/docs/)

---

**Last Updated:** December 19, 2025
