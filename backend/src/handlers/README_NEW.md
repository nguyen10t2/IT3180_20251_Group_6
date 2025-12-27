# 📚 API Handlers Documentation (ElysiaJS)

> **Kế hoạch rewrite từ Express Controllers sang ElysiaJS Handlers**  
> Phiên bản: 3.0 | Cập nhật: 27/12/2025

---

## 📋 Mục lục

- [Tổng quan dự án](#tổng-quan-dự-án)
- [Kiến trúc Backend](#kiến-trúc-backend)
- [Gap Analysis](#gap-analysis)
- [Kế hoạch Rewrite](#kế-hoạch-rewrite)
- [Services Reference](#services-reference)
- [API Handlers Documentation](#api-handlers-documentation)
- [Timeline & Checklist](#timeline--checklist)

---

## 🎯 Tổng quan dự án

Hệ thống quản lý chung cư với các tính năng:

| Module | Mô tả | Trạng thái |
|--------|-------|------------|
| 🔐 Auth | Đăng ký, đăng nhập, OTP, reset password, account lock | ⚠️ Partial (3/8) |
| 👤 User | Thông tin user, đổi mật khẩu | ✅ Done (2/2) |
| 🏠 Resident | Quản lý cư dân, tìm kiếm, chuyển hộ, chuyển đi | ❌ Missing (0/8) |
| 🏢 HouseHold | Quản lý hộ gia đình, đổi chủ hộ, xe cộ, lịch sử | ❌ Missing (0/10) |
| 💰 Invoice | Hóa đơn, thanh toán, chi tiết, quá hạn | ❌ Missing (0/9) |
| 🔔 Notification | Thông báo, lên lịch, ghim | ❌ Missing (0/8) |
| 💬 Feedback | Phản hồi, comment, assign handler | ❌ Missing (0/7) |
| 👨‍💼 Manager | Admin panel, duyệt user, thống kê | ❌ Missing (0/20+) |

---

## 🏗️ Kiến trúc Backend

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **ElysiaJS** (Bun runtime) |
| Database | **PostgreSQL** + Drizzle ORM |
| Cache | **Redis** (OTP, Account Lock, Reset Token) |
| Auth | JWT + Refresh Token |
| Validation | TypeBox Schema |
| Password | Argon2 |

### Cấu trúc thư mục

```
backend/src/
├── handlers/              # API Routes (Elysia)
│   ├── authHandlers.ts       ✅ (3/8 routes)
│   └── userHandlers.ts       ✅ (2/2 routes)
│
├── services/              # Business Logic (100% Ready)
│   ├── authServices.ts       ✅ 18 functions (Redis-based)
│   ├── userServices.ts       ✅ 17 functions
│   ├── residentServices.ts   ✅ 14 functions
│   ├── houseServices.ts      ✅ 10 functions
│   ├── invoiceServices.ts    ✅ 12 functions
│   ├── notificationServices.ts ✅ 12 functions
│   ├── feetbackServices.ts   ✅ 11 functions
│   ├── roleServices.ts       ✅ 3 functions
│   └── baseServices.ts       ✅ 3 functions
│
├── models/                # Database Schema (Drizzle ORM)
│   ├── userSchema.ts
│   ├── authSchema.ts            # refreshToken
│   ├── residentSchema.ts
│   ├── houseSchema.ts
│   ├── houseHoldHeadHistorySchema.ts  ⭐ NEW
│   ├── invoiceSchema.ts
│   ├── invoiceDetailSchema.ts
│   ├── feeTypeSchema.ts
│   ├── notifycationSchema.ts
│   ├── notificationReadSchema.ts
│   ├── feedbackSchema.ts
│   └── feedbackCommentSchema.ts
│
├── plugins/               # Middleware
│   ├── authenticationPlugins.ts  ✅
│   └── authorizationPlugins.ts   ✅
│
├── helpers/               # Utilities
│   ├── tokenHelpers.ts
│   ├── password.ts
│   ├── emailHelpers.ts
│   ├── redisHelpers.ts       ⭐ Redis client
│   └── otpHelpers.ts
│
├── constants/
│   ├── errorContant.ts
│   └── timeContants.ts
│
└── types/                 # TypeScript Types
    ├── authTypes.ts
    ├── userTypes.ts
    ├── residentTypes.ts
    ├── houseTypes.ts
    ├── invoiceTypes.ts
    ├── notificationTypes.ts
    └── feedbackTypes.ts
```

---

## 📊 Gap Analysis

### Express Controllers vs Elysia Handlers

| Module | Express Routes | Elysia Routes | Gap | Services Ready |
|--------|---------------|---------------|-----|----------------|
| Auth | 8 | 3 | **5** | ✅ 100% |
| User | 2 | 2 | 0 | ✅ 100% |
| Resident | 4 | 0 | **4** | ✅ 100% |
| HouseHold | 6 | 0 | **6** | ✅ 100% |
| Invoice | 6 | 0 | **6** | ✅ 100% |
| Notification | 5 | 0 | **5** | ✅ 100% |
| Feedback | 5 | 0 | **5** | ✅ 100% |
| Manager | 20+ | 0 | **20+** | ✅ 100% |
| **TOTAL** | **~56** | **5** | **~51** | ✅ |

### Services có sẵn nhưng CHƯA có Handler

| Service Function | Module | Priority | Mô tả |
|-----------------|--------|----------|-------|
| `transferHeadResident` | House | 🔴 HIGH | Chuyển chủ hộ + tự động ghi lịch sử |
| `getHeadHistory` | House | 🔴 HIGH | Xem lịch sử chuyển chủ hộ |
| `moveOutResident` | Resident | 🔴 HIGH | Xử lý cư dân chuyển đi |
| `updateResidenceStatus` | Resident | 🔴 HIGH | Cập nhật trạng thái cư trú |
| `isAccountLocked` | Auth | 🔴 HIGH | Kiểm tra tài khoản bị khóa |
| `recordFailedLogin` | Auth | 🔴 HIGH | Rate limiting đăng nhập |
| `getOverdueInvoices` | Invoice | 🔴 HIGH | Báo cáo hóa đơn quá hạn |
| `addInvoiceDetail` | Invoice | 🔴 HIGH | Thêm chi tiết hóa đơn |
| `addCommentToFeedback` | Feedback | 🔴 HIGH | Comment vào feedback |
| `updateVehicleInfo` | House | 🟡 MEDIUM | Quản lý xe cộ của hộ |
| `scheduleNotification` | Notification | 🟡 MEDIUM | Lên lịch thông báo |
| `assignFeedbackHandler` | Feedback | 🟡 MEDIUM | Gán người xử lý feedback |
| `pinNotification` | Notification | 🟢 LOW | Ghim thông báo |
| `cleanupExpiredTokens` | Auth | 🟢 LOW | CRON job dọn token |

---

## 🔄 Kế hoạch Rewrite

### Phase 1: Complete Auth Module (🔴 HIGH Priority)

**File:** `handlers/authHandlers.ts`

| Route | Method | Status | Service sử dụng |
|-------|--------|--------|-----------------|
| `/auth/login` | POST | ✅ Done | `loginService`, `createRefreshToken`, `isAccountLocked` |
| `/auth/register` | POST | ✅ Done | `createUser`, `createOtp` |
| `/auth/logout` | POST | ✅ Done | `deleteRefreshTokensByUserId` |
| `/auth/refresh` | POST | 🔄 TODO | `getRefreshTokenByHash` |
| `/auth/verify-otp` | POST | 🔄 TODO | `verifyOtp`, `verifyEmail` |
| `/auth/resend-otp` | POST | 🔄 TODO | `createOtp`, `getOtpResendInfo` |
| `/auth/forgot-password` | POST | 🔄 TODO | `createResetPasswordToken`, `createOtp` |
| `/auth/reset-password` | POST | 🔄 TODO | `verifyResetPasswordToken`, `updateUserPassword` |

**Tính năng mới từ Services:**
- ⭐ **Account Lock:** `isAccountLocked`, `recordFailedLogin`, `resetLoginAttempts`
- ⭐ **OTP Rate Limit:** Max 3 lần gửi / 10 phút, Max 5 lần verify

---

### Phase 2: Resident Module (🔴 HIGH Priority)

**File:** `handlers/residentHandlers.ts` *(TẠO MỚI)*

| Route | Method | Status | Service sử dụng |
|-------|--------|--------|-----------------|
| `/residents/me` | GET | 🔄 TODO | `getResidentByUserId` |
| `/residents` | POST | 🔄 TODO | `createResident`, `getResidentByIdCard`, `getResidentByPhone` |
| `/residents/:id` | GET | 🔄 TODO | `getResidentById` |
| `/residents/:id` | PUT | 🔄 TODO | `updateResident` |
| `/residents/:id` | DELETE | ⭐ NEW | `deleteResident` |
| `/residents/search` | GET | ⭐ NEW | `getAll` + filters |
| `/residents/:id/move-out` | POST | ⭐ NEW | `moveOutResident` |
| `/residents/:id/transfer` | POST | ⭐ NEW | `updateResidentHouse`, `updateResidentHouseRole` |

**TypeBox Schema:**
```typescript
// CreateResidentBody
t.Object({
  house_id: t.Optional(t.String({ format: 'uuid' })),
  full_name: t.String({ minLength: 1 }),
  id_card: t.Optional(t.String({ minLength: 9, maxLength: 12 })),
  date_of_birth: t.String({ format: 'date' }),
  phone: t.String({ minLength: 10 }),
  gender: t.Union([t.Literal('male'), t.Literal('female'), t.Literal('other')]),
  house_role: t.Union([t.Literal('owner'), t.Literal('member'), t.Literal('tenant')]),
  residence_status: t.Union([
    t.Literal('thuongtru'),
    t.Literal('tamtru'),
    t.Literal('tamvang'),
    t.Literal('dachuyendi')
  ]),
  occupation: t.Optional(t.String())
})

// MoveOutBody
t.Object({
  reason: t.String({ minLength: 1 })
})

// TransferResidentBody
t.Object({
  new_house_id: t.String({ format: 'uuid' }),
  new_role: t.Optional(t.Union([t.Literal('owner'), t.Literal('member'), t.Literal('tenant')]))
})
```

---

### Phase 3: HouseHold Module (🔴 HIGH Priority)

**File:** `handlers/houseHandlers.ts` *(TẠO MỚI)*

| Route | Method | Status | Service sử dụng |
|-------|--------|--------|-----------------|
| `/houses` | GET | 🔄 TODO | `getAll` |
| `/houses/:id` | GET | 🔄 TODO | `getHouseById` |
| `/houses` | POST | 🔄 TODO | `createHouse` |
| `/houses/:id` | PUT | 🔄 TODO | `updateHouse` |
| `/houses/:id` | DELETE | 🔄 TODO | `deleteHouse` |
| `/houses/:id/members` | GET | 🔄 TODO | `getResidentsByHouseId`, `getMemberCount` |
| `/houses/:id/transfer-head` | POST | ⭐ NEW | `transferHeadResident` |
| `/houses/:id/head-history` | GET | ⭐ NEW | `getHeadHistory` |
| `/houses/:id/vehicle` | PUT | ⭐ NEW | `updateVehicleInfo` |
| `/houses/:id/status` | PUT | ⭐ NEW | `updateHouseStatus` |

**Tính năng đặc biệt - Transfer Head:**
```typescript
// transferHeadResident service tự động:
// 1. Cập nhật head_resident_id trong house
// 2. Ghi lịch sử vào houseHoldHeadHistorySchema
// 3. Cập nhật house_role = 'member' cho chủ hộ cũ
// 4. Cập nhật house_role = 'owner' cho chủ hộ mới
```

**TypeBox Schema:**
```typescript
// TransferHeadBody
t.Object({
  new_head_id: t.String({ format: 'uuid' }),
  reason: t.String({ minLength: 1 })
})

// UpdateVehicleBody
t.Object({
  motorbike_count: t.Number({ minimum: 0 }),
  car_count: t.Number({ minimum: 0 })
})
```

---

### Phase 4: Invoice Module (🟡 MEDIUM Priority)

**File:** `handlers/invoiceHandlers.ts` *(TẠO MỚI)*

| Route | Method | Status | Service sử dụng |
|-------|--------|--------|-----------------|
| `/invoices` | GET | 🔄 TODO | `getInvoicesByHouseId` |
| `/invoices/:id` | GET | 🔄 TODO | `getInvoiceById`, `getInvoiceDetails` |
| `/invoices/:id/pay` | POST | 🔄 TODO | `confirmPayment` |
| `/invoices` | POST | 🔄 TODO | `createInvoice` *(Manager)* |
| `/invoices/:id` | PUT | 🔄 TODO | `updateInvoice` *(Manager)* |
| `/invoices/:id` | DELETE | 🔄 TODO | `deleteInvoice` *(Manager)* |
| `/invoices/:id/details` | POST | ⭐ NEW | `addInvoiceDetail` |
| `/invoices/overdue` | GET | ⭐ NEW | `getOverdueInvoices` |
| `/invoices/mark-overdue` | POST | ⭐ NEW | `markOverdueInvoices` *(CRON)* |

---

### Phase 5: Notification Module (🟡 MEDIUM Priority)

**File:** `handlers/notificationHandlers.ts` *(TẠO MỚI)*

| Route | Method | Status | Service sử dụng |
|-------|--------|--------|-----------------|
| `/notifications` | GET | 🔄 TODO | `getNotificationsForUser` |
| `/notifications/:id/read` | PUT | 🔄 TODO | `markAsRead` |
| `/notifications/read-all` | PUT | 🔄 TODO | `markAllAsRead` |
| `/notifications` | POST | 🔄 TODO | `createNotification` *(Manager)* |
| `/notifications/:id` | PUT | 🔄 TODO | `updateNotification` *(Manager)* |
| `/notifications/:id` | DELETE | 🔄 TODO | `deleteNotification` *(Manager)* |
| `/notifications/schedule` | POST | ⭐ NEW | `scheduleNotification` |
| `/notifications/:id/pin` | PUT | ⭐ NEW | `togglePinNotification` |

---

### Phase 6: Feedback Module (🟡 MEDIUM Priority)

**File:** `handlers/feedbackHandlers.ts` *(TẠO MỚI)*

| Route | Method | Status | Service sử dụng |
|-------|--------|--------|-----------------|
| `/feedbacks` | GET | 🔄 TODO | `getFeedbacksByUser` |
| `/feedbacks/:id` | GET | 🔄 TODO | `getFeedbackWithComments` |
| `/feedbacks` | POST | 🔄 TODO | `createFeedback` |
| `/feedbacks/:id/comment` | POST | ⭐ NEW | `addCommentToFeedback` |
| `/feedbacks/:id/status` | PUT | ⭐ NEW | `updateFeedbackStatus` *(Manager)* |
| `/feedbacks/:id/assign` | PUT | ⭐ NEW | `assignFeedbackHandler` *(Manager)* |
| `/feedbacks/:id/respond` | POST | 🔄 TODO | `respondToFeedback` *(Manager)* |

---

### Phase 7: Manager Module (🟢 LOW Priority)

**File:** `handlers/managerHandlers.ts` *(TẠO MỚI)*

#### User Management
| Route | Method | Service |
|-------|--------|---------|
| `/manager/users` | GET | `getUsersWithPagination` |
| `/manager/users/pending` | GET | `getPendingUsers` |
| `/manager/users/:id` | GET | `getUserWithResident` |
| `/manager/users/:id/approve` | PUT | `approveUser` |
| `/manager/users/:id/reject` | PUT | `rejectUser` |
| `/manager/users/:id` | DELETE | `softDeleteUser` |

#### Full CRUD cho Admin
| Resource | Routes | Note |
|----------|--------|------|
| Houses | 6 routes | Full CRUD + members |
| Residents | 5 routes | Full CRUD |
| Invoices | 6 routes | Full CRUD + details |
| Notifications | 5 routes | Full CRUD + schedule |
| Feedbacks | 5 routes | Full CRUD + assign |

#### Statistics (⭐ NEW)
| Route | Method | Mô tả |
|-------|--------|-------|
| `/manager/stats/dashboard` | GET | Tổng quan hệ thống |
| `/manager/stats/residents` | GET | Thống kê cư dân theo trạng thái |
| `/manager/stats/invoices` | GET | Thống kê hóa đơn |
| `/manager/stats/revenue` | GET | Thống kê doanh thu theo tháng |

---

## 📚 Services Reference

### authServices.ts (18 functions)

| Function | Params | Return | Mô tả |
|----------|--------|--------|-------|
| `loginService` | `email` | `{ id, role, hashed_password }` | Lấy info đăng nhập |
| `getRefreshTokenByUserId` | `userId` | `RefreshToken \| null` | Lấy refresh token |
| `getRefreshTokenByHash` | `tokenHash` | `RefreshToken \| null` | Verify refresh token |
| `createRefreshToken` | `userId, tokenHash, expiresAt` | `RefreshToken` | Tạo refresh token |
| `deleteRefreshTokensByUserId` | `userId` | `void` | Xóa tất cả token |
| `deleteRefreshToken` | `tokenHash` | `void` | Xóa 1 token |
| `cleanupExpiredTokens` | - | `void` | Dọn token hết hạn |
| `createOtp` | `email` | `{ code, expiresIn } \| error` | Tạo OTP (Redis, TTL 5min) |
| `verifyOtp` | `email, code` | `{ verified } \| error` | Xác thực OTP (max 5 attempts) |
| `getOtpResendInfo` | `email` | `{ remaining, nextResendAt }` | Info resend OTP |
| `deleteOtp` | `email` | `void` | Xóa OTP |
| `createResetPasswordToken` | `email, token` | `{ token, expiresIn }` | Tạo reset token (15min) |
| `getResetPasswordToken` | `email` | `string \| null` | Lấy reset token |
| `verifyResetPasswordToken` | `email, token` | `{ verified } \| error` | Verify reset token |
| `deleteResetPasswordToken` | `email` | `void` | Xóa reset token |
| `isAccountLocked` | `email` | `{ locked, unlockAt? }` | ⭐ Check account lock |
| `recordFailedLogin` | `email` | `{ locked, remainingAttempts? }` | ⭐ Ghi login fail |
| `resetLoginAttempts` | `email` | `void` | Reset login attempts |

### userServices.ts (17 functions)

| Function | Mô tả |
|----------|-------|
| `getUsersWithPagination` | Phân trang danh sách users |
| `updateUserPassword` | Đổi mật khẩu |
| `getUserById` | Lấy user theo ID |
| `isExistingUserByEmail` | Check email tồn tại |
| `getUserByEmail` | Lấy user theo email |
| `getUserWithPasswordByEmail` | Lấy user + password |
| `createUser` | Tạo user mới |
| `verifyEmail` | Xác minh email |
| `linkResidentToUser` | Liên kết resident |
| `getPendingUsers` | Users chờ duyệt |
| `getPendingUsersWithoutResident` | Users chờ duyệt (chưa có resident) |
| `getUserWithResident` | User + resident info |
| `approveUser` | Duyệt user |
| `rejectUser` | Từ chối user |
| `softDeleteUser` | Soft delete |
| `updateLastLogin` | Cập nhật last login |
| `incrementFailedAttempts` | Tăng login fail count |

### residentServices.ts (14 functions)

| Function | Mô tả |
|----------|-------|
| `getAll` | Tất cả cư dân |
| `getResidentsByHouseId` | Cư dân theo hộ |
| `getResidentByPhone` | Tìm theo SĐT |
| `getResidentById` | Tìm theo ID |
| `updateResidenceStatus` | ⭐ Cập nhật trạng thái cư trú |
| `getResidentByUserId` | Cư dân của user |
| `getResidentIdByUserId` | Resident ID của user |
| `getResidentByIdCard` | Tìm theo CCCD |
| `createResident` | Tạo cư dân |
| `updateResident` | Cập nhật cư dân |
| `deleteResident` | Soft delete |
| `moveOutResident` | ⭐ Xử lý chuyển đi (set house_id = null) |
| `updateResidentHouse` | Chuyển hộ |
| `updateResidentHouseRole` | Cập nhật vai trò |

### houseServices.ts (10 functions)

| Function | Mô tả |
|----------|-------|
| `getAll` | Tất cả căn hộ (join head info) |
| `getHouseById` | Căn hộ theo ID |
| `createHouse` | Tạo căn hộ |
| `updateHouse` | Cập nhật căn hộ |
| `deleteHouse` | Soft delete |
| `transferHeadResident` | ⭐ Chuyển chủ hộ + ghi lịch sử |
| `updateHouseStatus` | Cập nhật trạng thái (active/inactive/suspended) |
| `updateVehicleInfo` | ⭐ Quản lý xe (motorbike_count, car_count) |
| `getMemberCount` | Đếm số thành viên |
| `getHeadHistory` | ⭐ Lịch sử chuyển chủ hộ |

### invoiceServices.ts (12 functions)

| Function | Mô tả |
|----------|-------|
| `getAll` | Tất cả hóa đơn |
| `getInvoiceById` | Hóa đơn theo ID |
| `createInvoice` | Tạo hóa đơn |
| `updateInvoice` | Cập nhật hóa đơn |
| `deleteInvoice` | Soft delete |
| `getInvoicesByHouseId` | Hóa đơn theo hộ |
| `getInvoiceDetails` | Chi tiết hóa đơn |
| `confirmPayment` | Xác nhận thanh toán |
| `updateInvoiceStatus` | Cập nhật trạng thái |
| `addInvoiceDetail` | ⭐ Thêm chi tiết |
| `getOverdueInvoices` | ⭐ HĐ quá hạn |
| `markOverdueInvoices` | ⭐ Đánh dấu quá hạn |

### notificationServices.ts (12 functions)

| Function | Mô tả |
|----------|-------|
| `getAll` | Tất cả thông báo |
| `getNotificationById` | Thông báo theo ID |
| `createNotification` | Tạo thông báo |
| `deleteNotification` | Soft delete |
| `getNotificationsForUser` | Thông báo của user (by house_id) |
| `markAllAsRead` | Đánh dấu tất cả đã đọc |
| `markAsRead` | Đánh dấu 1 TB đã đọc |
| `scheduleNotification` | ⭐ Lên lịch gửi |
| `getScheduledNotifications` | ⭐ Lấy TB đã lên lịch |
| `publishScheduledNotifications` | ⭐ Publish scheduled |
| `updateNotification` | Cập nhật |
| `togglePinNotification` | ⭐ Ghim/bỏ ghim |

### feetbackServices.ts (11 functions)

| Function | Mô tả |
|----------|-------|
| `getAll` | Tất cả feedback |
| `getFeedbackById` | Feedback theo ID |
| `respondToFeedback` | Phản hồi feedback |
| `getFeedbacksByUser` | Feedback của user |
| `createFeedback` | Tạo feedback |
| `getFeedbackWithComments` | Feedback + comments |
| `addCommentToFeedback` | ⭐ Thêm comment |
| `updateFeedbackStatus` | ⭐ Cập nhật trạng thái |
| `deleteFeedback` | Soft delete |
| `getFeedbacksByStatus` | ⭐ Lọc theo status |
| `assignFeedbackHandler` | ⭐ Gán người xử lý |

---

## 📝 API Handlers Documentation

### Auth Handler

**File:** `handlers/authHandlers.ts`

---

#### POST `/auth/login`

**Request Body:**
```typescript
t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 1 })
})
```

**Response Success (200):**
```json
{
  "accessToken": "<JWT_TOKEN>"
}
```

**Cookie Set:**
```typescript
refreshToken: {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 604800 // 7 days
}
```

**Errors:**
| Status | Message | Trigger |
|--------|---------|---------|
| 401 | Thông tin đăng nhập không chính xác | Email/password sai |
| 423 | Tài khoản đã bị khóa | ⭐ Account locked (5 fails) |
| 500 | Internal Server Error | Server error |

**Flow với Account Lock (⭐ NEW):**
```
1. isAccountLocked(email)
   → Nếu locked: return 423 + unlockAt
2. loginService(email) → get user
3. verifyPassword(password, hashed_password)
   → Sai: recordFailedLogin(email)
   → Đúng: resetLoginAttempts(email)
4. createRefreshToken()
5. getToken() → JWT
6. Set cookie
```

---

#### POST `/auth/register`

**Request Body:**
```typescript
t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 6 }),
  name: t.String({ minLength: 1 })
})
```

**Response Success (201):**
```json
{
  "message": "Đã tạo thành công người dùng",
  "data": { "id": "uuid", "email": "...", ... }
}
```

**Flow với OTP (Full):**
```
1. isExistingUserByEmail(email)
   → Tồn tại: return 409
2. hashedPassword(password)
3. createUser(email, hash, name) → status: pending
4. createOtp(email) → Redis (TTL 5min)
5. sendOtpEmail(email, code) → async
6. Return success
```

---

#### POST `/auth/logout`

**Auth:** Required (JWT)

**Response Success (200):**
```json
{
  "message": "Logout thành công"
}
```

**Flow:**
```
1. Get userId from ctx.user
2. deleteRefreshTokensByUserId(userId)
3. Clear cookie
```

---

#### POST `/auth/refresh` *(🔄 TODO)*

**Cookie:** `refreshToken`

**Response Success (200):**
```json
{
  "accessToken": "<NEW_JWT_TOKEN>"
}
```

**Flow:**
```
1. Get refreshToken from cookie
2. hash(refreshToken)
3. getRefreshTokenByHash(hash)
   → Not found/expired: return 401
4. getToken(user) → new JWT
```

---

#### POST `/auth/verify-otp` *(🔄 TODO)*

**Request Body:**
```typescript
t.Object({
  email: t.String({ format: 'email' }),
  otp: t.String({ minLength: 6, maxLength: 6 })
})
```

**Response Success (200):**
```json
{
  "message": "Xác thực thành công",
  "email": "<email>"
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | OTP_EXPIRED |
| 400 | INVALID_OTP (còn X lần) |
| 400 | MAX_ATTEMPTS_EXCEEDED |

**Flow:**
```
1. verifyOtp(email, otp)
   → MAX 5 attempts
   → Redis auto-delete after verify
2. verifyEmail(email) → status: verified
```

---

#### POST `/auth/resend-otp` *(🔄 TODO)*

**Request Body:**
```typescript
t.Object({
  email: t.String({ format: 'email' })
})
```

**Response Success (200):**
```json
{
  "message": "Đã gửi lại OTP",
  "remaining": 2,
  "nextResendAt": null
}
```

**Rate Limit:**
- Max 3 lần / 10 phút
- Nếu hết: return 429 + `nextResendAt`

---

#### POST `/auth/forgot-password` *(🔄 TODO)*

**Request Body:**
```typescript
t.Object({
  email: t.String({ format: 'email' })
})
```

**Response Success (200):**
```json
{
  "message": "Đã gửi OTP reset password"
}
```

**Cookie Set:**
```typescript
reset_token: {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 900 // 15 minutes
}
```

---

#### POST `/auth/reset-password` *(🔄 TODO)*

**Request Body:**
```typescript
t.Object({
  email: t.String({ format: 'email' }),
  otp: t.String({ minLength: 6, maxLength: 6 }),
  new_password: t.String({ minLength: 6 })
})
```

**Cookie:** `reset_token`

**Response Success (200):**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Flow:**
```
1. verifyOtp(email, otp)
2. verifyResetPasswordToken(email, cookie.reset_token)
3. hashedPassword(new_password)
4. updateUserPassword(userId, hash)
5. deleteResetPasswordToken(email)
6. Clear cookie
```

---

### User Handler

**File:** `handlers/userHandlers.ts`

---

#### GET `/user/authMe`

**Auth:** Required (JWT)

**Response Success (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "status": "active",
    "resident_id": "uuid | null",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

#### POST `/user/changePass`

**Auth:** Required (JWT)

**Request Body:**
```typescript
t.Object({
  old_password: t.String({ minLength: 1 }),
  new_password: t.String({ minLength: 6 })
})
```

**Response Success (200):**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 401 | Mật khẩu cũ không đúng |
| 404 | User không tồn tại |

---

## 📅 Timeline & Checklist

### Timeline

| Week | Phase | Tasks | Priority |
|------|-------|-------|----------|
| **1** | Auth | Complete OTP flow, Account Lock, Refresh Token | 🔴 HIGH |
| **2** | Resident | CRUD + Search + Move Out + Transfer | 🔴 HIGH |
| **3** | HouseHold | CRUD + Transfer Head + Vehicle + History | 🔴 HIGH |
| **4** | Invoice | CRUD + Payment + Details + Overdue | 🟡 MEDIUM |
| **5** | Notification | CRUD + Schedule + Pin | 🟡 MEDIUM |
| **6** | Feedback | CRUD + Comments + Assign | 🟡 MEDIUM |
| **7** | Manager | All admin routes + Statistics | 🟢 LOW |
| **8** | Testing | Unit tests + Integration tests | 🔴 HIGH |

---

### Checklist

#### Handlers cần tạo mới:
- [ ] `handlers/residentHandlers.ts` (8 routes)
- [ ] `handlers/houseHandlers.ts` (10 routes)
- [ ] `handlers/invoiceHandlers.ts` (9 routes)
- [ ] `handlers/notificationHandlers.ts` (8 routes)
- [ ] `handlers/feedbackHandlers.ts` (7 routes)
- [ ] `handlers/managerHandlers.ts` (20+ routes)

#### Auth handlers cần bổ sung:
- [ ] `POST /auth/refresh`
- [ ] `POST /auth/verify-otp`
- [ ] `POST /auth/resend-otp`
- [ ] `POST /auth/forgot-password`
- [ ] `POST /auth/reset-password`

#### Tính năng mới cần implement:
- [ ] Account Lock / Rate Limiting (Redis)
- [ ] Transfer Head Resident + History
- [ ] Vehicle Management
- [ ] Move Out Resident
- [ ] Invoice Details
- [ ] Overdue Invoices
- [ ] Scheduled Notifications
- [ ] Pin Notifications
- [ ] Feedback Comments
- [ ] Assign Feedback Handler
- [ ] Statistics Dashboard

---

## ⚙️ Constants & Configuration

| Constant | Value | Location |
|----------|-------|----------|
| `ACCESS_TOKEN_TTL` | 30s | `timeContants.ts` |
| `REFRESH_TOKEN_TTL` | 7 days | `timeContants.ts` |
| `OTP_TTL` | 5 min | `authServices.ts` |
| `MAX_OTP_ATTEMPTS` | 5 | `authServices.ts` |
| `MAX_OTP_RESEND` | 3/10min | `authServices.ts` |
| `RESET_TOKEN_TTL` | 15 min | `authServices.ts` |
| `MAX_LOGIN_ATTEMPTS` | 5 | `authServices.ts` |
| `ACCOUNT_LOCK_DURATION` | 15 min | `authServices.ts` |

---

## 📦 Dependencies

```json
{
  "elysia": "^1.x",
  "@elysiajs/cookie": "^1.x",
  "@elysiajs/jwt": "^1.x",
  "drizzle-orm": "^0.x",
  "postgres": "^3.x",
  "redis": "^4.x",
  "argon2": "^0.x",
  "@sinclair/typebox": "built-in"
}
```

---

## 📝 Lưu ý chung

### Validation (TypeBox)
```typescript
import { t } from 'elysia'

// Sử dụng trong route
.post('/example', handler, {
  body: t.Object({
    email: t.String({ format: 'email' }),
    age: t.Number({ minimum: 18 })
  }),
  params: t.Object({
    id: t.String({ format: 'uuid' })
  }),
  query: t.Object({
    page: t.Optional(t.Number({ minimum: 1 }))
  })
})
```

### Error Handling
```typescript
import { HttpError } from '../constants/errorContant'

// Throw error
throw new HttpError(404, 'Không tìm thấy')
throw new HttpError(401, 'Unauthorized')
throw new HttpError(403, 'Forbidden')
```

### Authentication Plugin
```typescript
import { authenticationPlugins } from '../plugins/authenticationPlugins'

// Sử dụng trong route
.use(authenticationPlugins)
.get('/protected', ({ user }) => {
  // user: { id, email, role }
})
```

### Authorization Plugin
```typescript
import { authorizationPlugins } from '../plugins/authorizationPlugins'

// Sử dụng cho admin routes
.use(authorizationPlugins(['admin', 'manager']))
```

---

> **Legend:**
> - ✅ Hoàn thành
> - 🔄 TODO (cần implement)
> - ⭐ Tính năng mới (có sẵn trong services)
> - 🔴 HIGH Priority
> - 🟡 MEDIUM Priority  
> - 🟢 LOW Priority
