# 🧪 Test Suite - Hướng Dẫn Sử Dụng

## ✅ Setup (Chỉ làm 1 lần)

```bash
# Bước 1: Vào thư mục test
cd test

# Bước 2: Install dependencies
bun install
```

**Xong!** IDE sẽ không còn báo đỏ nữa.

---

## 🚀 Chạy Tests

### Từ thư mục test:
```bash
cd test
bun run test
```

Hoặc ngắn gọn hơn:
```bash
cd test
bun test.ts
```

---

## 📊 Output Mẫu

```
╔══════════════════════════════════════════════════════════════╗
║            🧪 AUTO TEST RUNNER - SERVICE TESTS               ║
╚══════════════════════════════════════════════════════════════╝

ℹ Checking database connection...
✓ Database connection OK
Database has: ✓ users, ✓ houses, ✓ residents

[████████████████████] 100% All tests completed!

════════════════════════════════════════════════════════════════
📊 FINAL TEST SUMMARY
════════════════════════════════════════════════════════════════
Total Tests:      27
✓ Passed:         23
✗ Failed:         4
Success Rate:     85.19% █████████████████░░░
⏱  Duration:      0.23s
📦 Test Suites:   5/5 completed
════════════════════════════════════════════════════════════════
```

---

## 📁 Cấu Trúc

```
test/
├── package.json       ← Dependencies riêng (đã cài)
├── tsconfig.json      ← TypeScript config (IDE dùng)
├── node_modules/      ← Dependencies (tự động tạo sau bun install)
│
├── test.ts           ← Entry point (chạy file này)
├── run.ts            ← Main test runner
├── testServer.ts     ← HTTP test server
│
├── helpers/
│   ├── testHelpers.ts  ← Test utilities
│   └── dbHelper.ts     ← Database helpers
│
├── mock/
│   └── mockDb.ts       ← Mock data
│
└── services/
    ├── authServices.test.ts
    ├── houseServices.test.ts
    ├── notificationServices.test.ts
    ├── residentServices.test.ts
    └── userServices.test.ts
```

---

## 🔧 Scripts Có Sẵn

```bash
# Chạy tất cả tests
bun run test

# Chạy test server với HTTP endpoints
bun run test:server

# Inspect database
bun run inspect

# Setup environment
bun run setup
```

---

## ⚙️ Environment Variables

Test suite tự động load `.env` từ:
1. `test/.env` (nếu có)
2. Hoặc `../.env` (root folder)

Không cần làm gì thêm!

---

## 💡 Workflow Của Bạn

```bash
# Lần đầu tiên
cd test
bun install

# Sau đó mỗi khi muốn test
cd test
bun run test
```

**Chỉ 2 lệnh!** ✨

---

## 🔍 Troubleshooting

### IDE vẫn báo đỏ?
```bash
# Restart TypeScript server trong IDE
# VSCode: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### DATABASE_URL not found?
```bash
# Kiểm tra file .env có tồn tại
ls -la ../.env

# Nếu chưa có, copy từ example
cp ../.env.example ../.env
# Sau đó sửa DATABASE_URL trong .env
```

### Tests fail?
- Đọc error messages - rất rõ ràng
- Chạy `bun run inspect` để xem data trong database
- Một số tests có thể fail nếu DB empty - điều này OK

---

## 📖 Giải Thích

### Tại sao tách riêng?

1. **IDE không báo lỗi** - có node_modules riêng
2. **Dependencies độc lập** - không ảnh hưởng backend
3. **TypeScript config riêng** - paths và settings tối ưu
4. **Dễ maintain** - mọi thứ trong 1 folder

### Tests chạy như thế nào?

```typescript
// Test import trực tiếp service từ backend
import * as houseServices from '../../backend/src/services/houseServices';

// Gọi function
const result = await houseServices.getAll();

// Kiểm tra kết quả
assert.isDefined(result.data);
```

**KHÔNG CẦN** Elysia server chạy!

---

## ✅ Checklist

- [x] `cd test`
- [x] `bun install` 
- [x] IDE không còn đỏ
- [x] `bun run test` chạy được
- [x] Xem kết quả với % success rate

Done! 🎉
