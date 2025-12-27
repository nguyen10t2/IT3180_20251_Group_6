# Controllers API Documentation

Tài liệu mô tả chi tiết các hàm controller để rewrite sang Elysia với TypeBox.

---

## 📁 authController.js

### 1. `register`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { email: string, password: string, fullname: string }` |
| **Services gọi** | `OtpService.createOtp()`, `Otp.create()`, `User.isExists()`, `User.create()`, `EmailService.sendOtpEmail()` |
| **Validation** | `validateEmail()`, `validatePassword()`, `validateFullname()` |
| **Lỗi trả về** | `400`: Validation failed<br>`409`: Email đã tồn tại<br>`500`: Lỗi khi tạo OTP / Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Đăng kí thành công' }` |

### 2. `login`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { email: string, password: string }` |
| **Services gọi** | `User.findOne()`, `Session.create()`, `argon2.verify()`, `jwt.sign()` |
| **Validation** | `validateEmail()`, `validatePassword()` |
| **Lỗi trả về** | `400`: Validation failed<br>`401`: Email hoặc mật khẩu không đúng<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Đăng nhập thành công', access_token: string }`<br>Cookie: `refresh_token` |

### 3. `logout`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.cookies.refresh_token: string` |
| **Services gọi** | `Session.deleteOne()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `204`: No Content (clear cookie `refresh_token`) |

### 4. `refreshToken`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.session: { user_id: string }` (từ middleware) |
| **Services gọi** | `User.findUserById()`, `jwt.sign()` |
| **Lỗi trả về** | `404`: User không tồn tại<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ access_token: string }` |

### 5. `verifyOtp`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { email: string, otp: string }` |
| **Services gọi** | `User.isExists()`, `Otp.getOTPRecord()`, `User.verifyUser()`, `Otp.updateOTP()`, `argon2.verify()` |
| **Validation** | `validateEmail()`, `validateOtp()` |
| **Lỗi trả về** | `400`: Email không tồn tại / Không tìm thấy OTP / OTP hết hạn<br>`401`: OTP không hợp lệ<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Xác thực thành công', email: string }` |

### 6. `resendOtp`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { email: string }` |
| **Services gọi** | `User.isExists()`, `Otp.getLastOTP()`, `Otp.resendCount()`, `OtpService.createOtp()`, `Otp.create()`, `EmailService.sendOtpEmail()` |
| **Validation** | `validateEmail()` |
| **Lỗi trả về** | `400`: Email không tồn tại<br>`429`: Rate limit (retry_after) / Quá nhiều yêu cầu<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Đã gửi lại OTP' }` |

### 7. `forgetPass`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { email: string }` |
| **Services gọi** | `OtpService.createOtp()`, `Otp.create()`, `ResetToken.create()`, `EmailService.sendOtpEmail()` |
| **Validation** | `validateEmail()` |
| **Lỗi trả về** | `400`: Validation failed<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Đã gửi OTP' }`<br>Cookie: `reset_token` |

### 8. `resetPass`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { email: string, new_password: string }`, `req.cookies.reset_token: string` |
| **Services gọi** | `ResetToken.findOne()`, `User.updateUser()`, `ResetToken.deleteOne()`, `argon2.hash()` |
| **Validation** | `validateEmail()`, `validatePassword()` |
| **Lỗi trả về** | `400`: Token không hợp lệ / Validation failed<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Cập nhật tài khoản thành công' }` (clear cookie `reset_token`) |

---

## 📁 userController.js

### 1. `authMe`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string` (từ middleware JWT) |
| **Services gọi** | `User.findUserById()` |
| **Lỗi trả về** | `400`: Không có quyền truy cập<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `User object` |

### 2. `changePass`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.body: { old_password: string, new_password: string }` |
| **Services gọi** | `User.findUserById()`, `User.updateUser()`, `argon2.verify()`, `argon2.hash()` |
| **Validation** | `validatePassword()` |
| **Lỗi trả về** | `400`: Validation failed<br>`401`: Mật khẩu cũ không đúng<br>`404`: User không tồn tại<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Đổi mật khẩu thành công' }` |

---

## 📁 feedbackController.js

### 1. `getFeedbacks`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string` |
| **Services gọi** | `Feedback.getFeedbacksByUser()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ feedbacks: Feedback[] }` |

### 2. `createFeedback`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.body: { type: string, priority?: string, title: string, content: string }` |
| **Services gọi** | `User.findUserById()`, `Resident.getResidentByUserId()`, `Feedback.create()` |
| **Lỗi trả về** | `400`: Thiếu thông tin bắt buộc<br>`401`: Lỗi xác thực<br>`403`: Tài khoản chưa kích hoạt<br>`500`: Lỗi hệ thống |
| **Thành công** | `201`: `{ message: 'Gửi phản hồi thành công', feedback: Feedback }` |

### 3. `getFeedbackDetails`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.params.feedback_id: string` |
| **Services gọi** | `Feedback.getFeedbackWithComments()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`404`: Không tìm thấy phản hồi<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ feedback: FeedbackWithComments }` |

---

## 📁 houseHoldController.js

### 1. `getHouseHolds`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `HouseHold.getAll()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `HouseHold[]` |

### 2. `createHouseHold`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { room_number: string, room_type: string, head_resident_id?: string, floor?: number, area?: number, notes?: string }` |
| **Services gọi** | `HouseHold.create()` |
| **Lỗi trả về** | `400`: Thiếu room_number hoặc room_type<br>`500`: Lỗi hệ thống |
| **Thành công** | `201`: `{ message: 'Tạo hộ dân thành công!', houseHold: HouseHold }` |

### 3. `getHouseHoldDetails`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `HouseHold.getById()` |
| **Lỗi trả về** | `404`: Không tìm thấy hộ dân<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ houseHold: HouseHold }` |

### 4. `updateHouseHold`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.body: Partial<HouseHold>` |
| **Services gọi** | `HouseHold.getById()`, `HouseHold.update()` |
| **Lỗi trả về** | `404`: Không tìm thấy hộ dân<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Cập nhật hộ dân thành công!' }` |

### 5. `deleteHouseHold`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `HouseHold.getById()`, `HouseHold.delete()` |
| **Lỗi trả về** | `404`: Không tìm thấy hộ dân<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Xóa hộ dân thành công!' }` |

---

## 📁 invoiceController.js

### 1. `getInvoices`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string` |
| **Services gọi** | `Resident.getResidentByUserId()`, `Invoice.getInvoicesByHouseHold()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ invoices: Invoice[] }` |

### 2. `getInvoiceDetails`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.params.invoice_id: string` |
| **Services gọi** | `Invoice.getInvoiceById()`, `Resident.getResidentByUserId()`, `Invoice.getInvoiceDetails()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`403`: Không có quyền truy cập hóa đơn này<br>`404`: Không tìm thấy hóa đơn<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ invoice: Invoice, items: InvoiceItem[] }` |

### 3. `payInvoice`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.params.invoice_id: string`, `req.body: { payment_method?: string, transaction_id?: string }` |
| **Services gọi** | `User.findUserById()`, `Invoice.getInvoiceById()`, `Resident.getResidentByUserId()`, `Invoice.payInvoice()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`403`: Tài khoản chưa kích hoạt / Không có quyền<br>`404`: Không tìm thấy hóa đơn<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Thanh toán thành công', invoice: Invoice }` |

---

## 📁 notificationController.js

### 1. `getNotifications`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string` |
| **Services gọi** | `Resident.getResidentByUserId()`, `Notification.getNotificationsForUser()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ notifications: Notification[] }` |

### 2. `markAsRead`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.params.notification_id: string` |
| **Services gọi** | `Notification.markAsRead()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Đã đánh dấu đã đọc' }` |

### 3. `markAllAsRead`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string` |
| **Services gọi** | `Resident.getResidentByUserId()`, `Notification.markAllAsRead()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Đã đánh dấu tất cả đã đọc' }` |

---

## 📁 residentController.js

### 1. `getResidents`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string` |
| **Services gọi** | `Resident.getResidentByUserId()`, `User.findUserById()` |
| **Lỗi trả về** | `401`: Lỗi xác thực<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ resident: Resident \| null, isNewResident: boolean, userInfo?: { fullname, email } }` |

### 2. `createResident`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.body: { house_id?: string, fullname: string, id_card?: string, date_of_birth: string, phone_number: string, gender: string, role: string, status: string, occupation?: string }` |
| **Services gọi** | `Resident.getResidentIdFromUserId()`, `Resident.isIdCardExists()`, `Resident.isExists()`, `Resident.create()`, `User.updateResidentId()` |
| **Lỗi trả về** | `400`: Đã có thông tin cư dân / Thiếu thông tin / CCCD đã sử dụng / SĐT đã sử dụng<br>`401`: Lỗi xác thực<br>`500`: Lỗi hệ thống |
| **Thành công** | `201`: `{ message: 'Tạo thông tin cư dân thành công!...', resident: Resident }` |

### 3. `getHouseHolds`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `HouseHold.getAll()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ houseHolds: HouseHold[] }` |

### 4. `updateResident`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.user.user_id: string`, `req.body: { phone_number?: string, occupation?: string }` |
| **Services gọi** | `Resident.getResidentIdFromUserId()`, `Resident.updateResident()` |
| **Allowed Fields** | `phone_number`, `occupation` |
| **Lỗi trả về** | `400`: Không có trường nào để cập nhật<br>`401`: Lỗi xác thực<br>`404`: Không tìm thấy cư dân<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Cập nhật thành công', resident: Resident }` |

---

## 📁 managerController.js

### USERS

#### 1. `getUsers`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { lastCreated?: Date, limit?: number }` |
| **Services gọi** | `User.getUsersByLastCreatedAndLimit()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ users: User[] }` |

#### 2. `getPendingUsers`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `User.getPendingUsers()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ users: User[] }` |

#### 3. `getUserDetail`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `User.getUserWithResident()` |
| **Lỗi trả về** | `404`: Không tìm thấy user<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ user: UserWithResident }` |

#### 4. `approveUser`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.user.user_id: string` |
| **Services gọi** | `User.getUserWithResident()`, `User.approveUser()` |
| **Lỗi trả về** | `400`: Chỉ duyệt user pending / User chưa đăng ký resident<br>`404`: Không tìm thấy user<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Duyệt user thành công' }` |

#### 5. `rejectUser`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.body: { rejected_reason?: string }`, `req.user.user_id: string` |
| **Services gọi** | `User.findUserById()`, `User.rejectUser()` |
| **Lỗi trả về** | `400`: Chỉ từ chối user pending<br>`404`: Không tìm thấy user<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Từ chối user thành công' }` |

---

### HOUSEHOLDS (Manager)

#### 6. `getHouseHolds` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `HouseHold.getAll()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ houseHolds: HouseHold[] }` |

#### 7. `createHouseHold` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { room_number: string, room_type: string, head_resident_id?: string, floor?: number, area?: number, notes?: string }` |
| **Services gọi** | `HouseHold.create()` |
| **Lỗi trả về** | `400`: Thiếu thông tin<br>`500`: Lỗi hệ thống |
| **Thành công** | `201`: `{ message: 'Tạo hộ thành công', houseHold: HouseHold }` |

#### 8. `getHouseHoldById`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `HouseHold.getById()` |
| **Lỗi trả về** | `404`: Không tìm thấy hộ<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ houseHold: HouseHold }` |

#### 9. `updateHouseHold` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.body: Partial<HouseHold>` |
| **Services gọi** | `HouseHold.getById()`, `HouseHold.update()` |
| **Lỗi trả về** | `404`: Không tìm thấy hộ<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Cập nhật hộ thành công', houseHold: HouseHold }` |

#### 10. `deleteHouseHold` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `HouseHold.getById()`, `HouseHold.delete()` |
| **Lỗi trả về** | `404`: Không tìm thấy hộ<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Xóa hộ thành công', houseHold: HouseHold }` |

#### 11. `getHouseHoldMembers`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `Resident.getByHouseId()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ members: Resident[] }` |

---

### RESIDENTS (Manager)

#### 12. `getResidents` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `Resident.getAll()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ residents: Resident[] }` |

#### 13. `getResidentById`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `Resident.findById()` |
| **Lỗi trả về** | `404`: Không tìm thấy cư dân<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ resident: Resident }` |

#### 14. `updateResident` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.body: Partial<Resident>` |
| **Services gọi** | `Resident.updateResident()` |
| **Lỗi trả về** | `404`: Không tìm thấy cư dân<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Cập nhật thành công', resident: Resident }` |

#### 15. `deleteResident`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `Resident.delete()` |
| **Lỗi trả về** | `404`: Không tìm thấy cư dân<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Xóa cư dân thành công' }` |

---

### INVOICES (Manager)

#### 16. `getInvoices` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `Invoice.getAll()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ invoices: Invoice[] }` |

#### 17. `createInvoice`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { house_hold_id: string, period_month: number, period_year: number, total_amount: number, due_date: Date, invoice_type?: string, notes?: string }`, `req.user.user_id: string` |
| **Services gọi** | `Invoice.create()` |
| **Lỗi trả về** | `400`: Thiếu thông tin bắt buộc<br>`500`: Lỗi hệ thống |
| **Thành công** | `201`: `{ message: 'Tạo hóa đơn thành công', invoice: Invoice }` |

#### 18. `getInvoiceById`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `Invoice.getInvoiceById()` |
| **Lỗi trả về** | `404`: Không tìm thấy hóa đơn<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ invoice: Invoice }` |

#### 19. `updateInvoice`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.body: Partial<Invoice>` |
| **Services gọi** | `Invoice.update()` |
| **Lỗi trả về** | `404`: Không tìm thấy hóa đơn<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Cập nhật hóa đơn thành công', invoice: Invoice }` |

#### 20. `deleteInvoice`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `Invoice.delete()` |
| **Lỗi trả về** | `404`: Không tìm thấy hóa đơn<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Xóa hóa đơn thành công' }` |

#### 21. `confirmInvoicePayment`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.user.user_id: string` |
| **Services gọi** | `Invoice.confirmPayment()` |
| **Lỗi trả về** | `404`: Không tìm thấy hóa đơn<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Xác nhận thanh toán thành công', invoice: Invoice }` |

---

### NOTIFICATIONS (Manager)

#### 22. `getNotifications` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `Notification.getAll()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ notifications: Notification[] }` |

#### 23. `createNotification`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.body: { title: string, content: string, type?: string }`, `req.user.user_id: string` |
| **Services gọi** | `Notification.create()` |
| **Lỗi trả về** | `400`: Thiếu title hoặc content<br>`500`: Lỗi hệ thống |
| **Thành công** | `201`: `{ message: 'Tạo thông báo thành công', notification: Notification }` |

#### 24. `deleteNotification`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string` |
| **Services gọi** | `Notification.delete()` |
| **Lỗi trả về** | `404`: Không tìm thấy thông báo<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Xóa thông báo thành công' }` |

---

### FEEDBACKS (Manager)

#### 25. `getFeedbacks` (manager)
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | None |
| **Services gọi** | `Feedback.getAll()` |
| **Lỗi trả về** | `500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ feedbacks: Feedback[] }` |

#### 26. `respondFeedback`
| Thuộc tính | Chi tiết |
|------------|----------|
| **Đầu vào** | `req.params.id: string`, `req.body: { response: string }`, `req.user.user_id: string` |
| **Services gọi** | `Feedback.respond()` |
| **Lỗi trả về** | `400`: Thiếu nội dung phản hồi<br>`404`: Không tìm thấy phản hồi<br>`500`: Lỗi hệ thống |
| **Thành công** | `200`: `{ message: 'Phản hồi thành công', feedback: Feedback }` |

---

## 📋 Tổng hợp Models cần thiết

| Model | Các methods chính |
|-------|-------------------|
| **User** | `isExists()`, `findOne()`, `findUserById()`, `create()`, `verifyUser()`, `updateUser()`, `getUsersByLastCreatedAndLimit()`, `getPendingUsers()`, `getUserWithResident()`, `approveUser()`, `rejectUser()`, `updateResidentId()` |
| **Session** | `create()`, `deleteOne()` |
| **Otp** | `create()`, `getOTPRecord()`, `updateOTP()`, `getLastOTP()`, `resendCount()` |
| **ResetToken** | `create()`, `findOne()`, `deleteOne()` |
| **HouseHold** | `getAll()`, `create()`, `getById()`, `update()`, `delete()` |
| **Resident** | `getResidentByUserId()`, `getResidentIdFromUserId()`, `isIdCardExists()`, `isExists()`, `create()`, `updateResident()`, `getByHouseId()`, `getAll()`, `findById()`, `delete()` |
| **Invoice** | `getInvoicesByHouseHold()`, `getInvoiceById()`, `getInvoiceDetails()`, `payInvoice()`, `getAll()`, `create()`, `update()`, `delete()`, `confirmPayment()` |
| **Notification** | `getNotificationsForUser()`, `markAsRead()`, `markAllAsRead()`, `getAll()`, `create()`, `delete()` |
| **Feedback** | `getFeedbacksByUser()`, `create()`, `getFeedbackWithComments()`, `getAll()`, `respond()` |

---

## 📋 Tổng hợp Services cần thiết

| Service | Methods |
|---------|---------|
| **OtpService** | `createOtp()` |
| **EmailService** | `sendOtpEmail()` |

---

## 🔐 Common Error Responses

| HTTP Status | Message |
|-------------|---------|
| `400` | Validation failed / Thiếu thông tin / Dữ liệu không hợp lệ |
| `401` | Lỗi xác thực / Email hoặc mật khẩu không đúng |
| `403` | Không có quyền / Tài khoản chưa kích hoạt |
| `404` | Không tìm thấy resource |
| `409` | Conflict (Email đã tồn tại) |
| `429` | Rate limit (Too many requests) |
| `500` | Lỗi hệ thống |

---

## 🍪 Cookies Used

| Cookie Name | Purpose | TTL |
|-------------|---------|-----|
| `refresh_token` | Session management | 7 days |
| `reset_token` | Password reset | 10 minutes |

---

## 🔑 JWT Payload Structure

```typescript
interface AccessTokenPayload {
  user_id: string;
  user_role: string;
}
```

---

## 📝 TypeBox Schema Examples (Gợi ý)

```typescript
import { t } from 'elysia';

// Auth schemas
const RegisterBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 6 }),
  fullname: t.String({ minLength: 2 })
});

const LoginBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String()
});

const OtpBody = t.Object({
  email: t.String({ format: 'email' }),
  otp: t.String({ minLength: 6, maxLength: 6 })
});

// Common response
const ErrorResponse = t.Object({
  message: t.String()
});

const SuccessResponse = t.Object({
  message: t.String()
});

// HouseHold
const CreateHouseHoldBody = t.Object({
  room_number: t.String(),
  room_type: t.String(),
  head_resident_id: t.Optional(t.String()),
  floor: t.Optional(t.Number()),
  area: t.Optional(t.Number()),
  notes: t.Optional(t.String())
});

// Resident
const CreateResidentBody = t.Object({
  house_id: t.Optional(t.String()),
  fullname: t.String(),
  id_card: t.Optional(t.String()),
  date_of_birth: t.String(),
  phone_number: t.String(),
  gender: t.String(),
  role: t.String(),
  status: t.String(),
  occupation: t.Optional(t.String())
});

// Feedback
const CreateFeedbackBody = t.Object({
  type: t.String(),
  priority: t.Optional(t.String({ default: 'medium' })),
  title: t.String(),
  content: t.String()
});

// Invoice
const CreateInvoiceBody = t.Object({
  house_hold_id: t.String(),
  period_month: t.Number(),
  period_year: t.Number(),
  total_amount: t.Number(),
  due_date: t.String(),
  invoice_type: t.Optional(t.String({ default: 'other' })),
  notes: t.Optional(t.String())
});

// Notification
const CreateNotificationBody = t.Object({
  title: t.String(),
  content: t.String(),
  type: t.Optional(t.String({ default: 'general' }))
});
```
