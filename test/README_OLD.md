# Test Suite for Backend Services

Hệ thống test tự động cho tất cả các services trong backend.

## 📁 Cấu trúc

```
test/
├── helpers/
│   └── testHelpers.ts          # Helper functions và test utilities
├── mock/
│   └── mockDb.ts               # Mock database và mock data
├── services/
│   ├── authServices.test.ts    # Tests cho Auth Service
│   ├── houseServices.test.ts   # Tests cho House Service
│   ├── notificationServices.test.ts  # Tests cho Notification Service
│   ├── residentServices.test.ts      # Tests cho Resident Service
│   └── userServices.test.ts    # Tests cho User Service
├── testServer.ts               # ElysiaJS test server với endpoints
├── run.ts                      # Test runner chính
└── README.md                   # Documentation
```

## 🚀 Cách sử dụng

### 1. Chạy tất cả tests qua CLI (Khuyến nghị)

```bash
bun test/run.ts
```

Hoặc sử dụng npm script:

```bash
bun run test
```

### 2. Chạy test server với ElysiaJS endpoints

```bash
bun test/testServer.ts
```

Sau đó truy cập:
- `http://localhost:3001/` - Health check
- `http://localhost:3001/test/all` - Chạy tất cả tests
- `http://localhost:3001/test/auth` - Test Auth Service
- `http://localhost:3001/test/house` - Test House Service
- `http://localhost:3001/test/notification` - Test Notification Service
- `http://localhost:3001/test/resident` - Test Resident Service
- `http://localhost:3001/test/user` - Test User Service
- `http://localhost:3001/test/results` - Xem kết quả test gần nhất

Hoặc sử dụng npm script:

```bash
bun run test:server
```

## 📊 Output Format

Khi chạy tests, bạn sẽ thấy:

1. **Real-time logs** cho từng test case
2. **Summary report** cuối cùng với:
   - Tổng số tests
   - Số tests passed/failed
   - Phần trăm hoàn thành
   - Thời gian chạy
   - Danh sách lỗi chi tiết (nếu có)

### Ví dụ output:

```
🔐 Testing Auth Services
✓ Login with invalid email returns error
✓ Login with wrong password returns error
✓ Refresh token created successfully
...

═══════════════════════════════════════════════════════════════
📊 FINAL TEST SUMMARY
═══════════════════════════════════════════════════════════════
Total Tests:     25
✓ Passed:        23
✗ Failed:        2
Success Rate:    92.00%
Duration:        1234ms
═══════════════════════════════════════════════════════════════

❌ FAILED TESTS (2):
────────────────────────────────────────────────────────────────

1. authServices.createRefreshToken
   └─ Error: Could not create refresh token - user may not exist in test DB

2. userServices.getUserById - Invalid
   └─ Error: Expected error but got success
```

## ⚙️ Configuration

### Environment Variables

Tạo file `.env` trong thư mục `test/` hoặc sử dụng `.env` của backend:

```env
# Test Database (optional - sẽ fallback sang DATABASE_URL nếu không có)
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/test_db

# Test Server Port (optional - default: 3001)
TEST_PORT=3001
```

## 🧪 Test Cases

### Auth Service (6 tests)
- Login với email không tồn tại
- Login với mật khẩu sai
- Tạo refresh token
- Lấy refresh token theo user ID
- Xóa refresh token
- Dọn dẹp expired tokens

### House Service (4 tests)
- Lấy tất cả houses
- Tạo house mới
- Lấy house theo ID (invalid)
- Lấy house theo ID (valid)

### Notification Service (4 tests)
- Lấy tất cả notifications
- Tạo notification mới
- Xóa notification
- Lấy notifications cho user

### Resident Service (6 tests)
- Lấy tất cả residents
- Lấy resident theo phone (invalid)
- Lấy resident theo ID (invalid)
- Lấy resident theo user ID
- Lấy resident ID theo user ID
- Lấy resident theo ID card (invalid)

### User Service (5 tests)
- Lấy users với pagination
- Cập nhật password
- Lấy user theo ID (invalid)
- Kiểm tra user tồn tại theo email
- Lấy user theo email (invalid)

## 📝 Notes

- Tests sử dụng database thật (hoặc test database nếu cấu hình)
- Một số tests có thể fail nếu database trống - điều này là bình thường
- Tests được thiết kế để log warnings thay vì fail khi gặp empty database
- Tất cả tests chạy độc lập và không ảnh hưởng đến backend hiện tại
- Mock data được định nghĩa trong `mock/mockDb.ts`

## 🔧 Troubleshooting

**Tests fail với database errors:**
- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo database đang chạy
- Thử chạy với `TEST_DATABASE_URL` riêng biệt

**Port đã được sử dụng:**
- Đổi `TEST_PORT` trong `.env`
- Hoặc stop process đang dùng port 3001

**Import errors:**
- Chạy `bun install` để cài dependencies
- Kiểm tra tsconfig.json có đúng cấu hình

## 🎯 Future Improvements

- [ ] Add database seeding cho test data
- [ ] Add integration tests
- [ ] Add performance benchmarks
- [ ] Add test coverage reports
- [ ] Add CI/CD integration
