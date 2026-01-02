## Hướng dẫn sử dụng Frontend BlueMoon

### Cài đặt dependencies

```bash
cd frontend
npm install
```

hoặc sử dụng bun:
```bash
bun install
```

### Tạo file .env

Sao chép file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

Cập nhật các biến môi trường:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BlueMoon
```

### Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

### Build production

```bash
npm run build
npm start
```

### Cấu trúc đã tạo

#### ✅ Đã hoàn thành:
1. **Core Setup**
   - TypeScript configuration
   - Tailwind CSS với theme system
   - Next.js 15 với App Router
   - React Query cho data fetching
   - Zustand cho state management

2. **Types System**
   - Enums (UserStatus, FeeStatus, FeedbackStatus, etc.)
   - User, Resident, House, Invoice, Feedback, Notification types
   - Request/Response types
   - Common utility types

3. **Services Layer**
   - API client với auto-refresh token
   - Auth service
   - User service
   - Resident service
   - House service
   - Invoice service
   - Feedback service
   - Notification service
   - Dashboard service

4. **State Management**
   - Auth store (user, token)
   - Theme store (light/dark/system)
   - Sidebar store

5. **Custom Hooks**
   - useAuth - Authentication & authorization
   - useTheme - Theme management
   - usePagination - Client-side pagination
   - useSearch - Client-side search
   - useSort - Client-side sorting

6. **UI Components**
   - Button, Input, Select, Textarea
   - Card, Badge, Modal
   - DataTable với pagination
   - SearchInput, StatusBadge
   - Loading, Toast
   - Header, Sidebar, DashboardLayout

7. **Pages**
   - Auth: Login, Register, Verify OTP
   - Manager: Dashboard, Users, Residents, Houses, Invoices, Feedbacks, Notifications
   - Accountant: Dashboard, Invoices
   - Resident: Dashboard, Profile, Household, Invoices, Feedbacks, Notifications

8. **Utils**
   - Helper functions (format, validate, etc.)
   - Labels & mappings
   - Validation schemas với Zod
   - Constants & configurations

### Tính năng chính

#### Authentication
- ✅ Login/Register với OTP
- ✅ Auto-refresh token
- ✅ Role-based routing
- ✅ Protected routes

#### Theme System
- ✅ Light mode
- ✅ Dark mode
- ✅ System preference
- ✅ Persistent theme

#### Data Management
- ✅ Client-side pagination
- ✅ Search functionality
- ✅ Column sorting
- ✅ React Query caching

#### UI/UX
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Modal dialogs

### Cần phát triển thêm

1. **Animations**
   - Integrate anime.js
   - Page transitions
   - Micro-interactions

2. **Advanced Features**
   - File upload components
   - Date picker
   - Rich text editor
   - Chart components

3. **Business Logic**
   - Complete CRUD operations
   - Form validations
   - Confirmation dialogs
   - Batch operations

4. **Optimization**
   - Code splitting
   - Image optimization
   - Performance monitoring
   - Error boundaries

### Testing

Để test hệ thống:
1. Start backend server trước
2. Đảm bảo backend chạy ở port 3000
3. Start frontend ở port 3000 (Next.js)
4. Truy cập http://localhost:3000

### Lưu ý

- Frontend này được xây dựng dựa trên backend có sẵn
- Tất cả API endpoints match với backend handlers
- Types được sync với backend models
- Role-based access control theo backend authorization

### Support

Nếu gặp lỗi, kiểm tra:
1. Backend có đang chạy không?
2. CORS đã được config đúng chưa?
3. Environment variables đã setup chưa?
4. Dependencies đã install đầy đủ chưa?
