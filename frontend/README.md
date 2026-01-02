# BlueMoon Frontend

Hệ thống quản lý chung cư BlueMoon - Frontend Next.js 15 với TypeScript

## Đặc điểm

- ✅ **Next.js 15** với App Router
- ✅ **TypeScript** strict mode
- ✅ **Tailwind CSS** với dark/light/system theme
- ✅ **React Query** cho data fetching và caching
- ✅ **Zustand** cho state management
- ✅ **Zod** cho validation
- ✅ **Axios** với interceptors và auto-refresh token
- ✅ **Anime.js** cho animations (tối ưu performance)
- ✅ **Clean Architecture** - Tách module rõ ràng theo role

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── manager/           # Manager module
│   │   ├── accountant/        # Accountant module
│   │   ├── resident/          # Resident module
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   │
│   ├── components/            # Shared components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   └── layout/           # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── DashboardLayout.tsx
│   │
│   ├── modules/              # Feature modules (TO BE CREATED)
│   │   ├── manager/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── accountant/
│   │   └── resident/
│   │
│   ├── types/                # TypeScript types
│   │   ├── enums.ts
│   │   ├── user.ts
│   │   ├── house.ts
│   │   ├── invoice.ts
│   │   ├── feedback.ts
│   │   ├── notification.ts
│   │   └── common.ts
│   │
│   ├── services/             # API services
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── resident.service.ts
│   │   ├── house.service.ts
│   │   ├── invoice.service.ts
│   │   ├── feedback.service.ts
│   │   └── notification.service.ts
│   │
│   ├── store/                # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── theme.store.ts
│   │   └── sidebar.store.ts
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-theme.ts
│   │   ├── use-pagination.ts
│   │   ├── use-search.ts
│   │   └── use-sort.ts
│   │
│   ├── lib/                  # Core libraries
│   │   └── api-client.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── helpers.ts
│   │   ├── labels.ts
│   │   └── validation.ts
│   │
│   └── config/               # Configuration
│       └── constants.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Cấu trúc Modules theo Role

### 1. Manager Module
- Dashboard với thống kê tổng quan
- Quản lý users (approve/reject pending users)
- Quản lý residents
- Quản lý houses/households
- Quản lý invoices
- Quản lý feedbacks (respond to feedbacks)
- Quản lý notifications (create/delete)

### 2. Accountant Module
- Dashboard với thống kê tài chính
- Quản lý invoices (create/update/confirm payment)
- Báo cáo thu chi

### 3. Resident Module
- Dashboard cá nhân
- Profile management
- Xem và thanh toán invoices
- Gửi feedbacks
- Xem notifications
- Quản lý household info

## Các Features chính

### Authentication & Authorization
- Login/Register với OTP verification
- Role-based access control (Manager/Accountant/Resident)
- Auto-refresh token
- Protected routes

### UI/UX
- Dark/Light/System theme
- Responsive design (mobile-first)
- Smooth animations với anime.js
- Loading states
- Error handling với toast notifications
- Modal dialogs
- Confirmation dialogs

### Data Management
- Client-side pagination
- Search & filter
- Sorting
- React Query caching
- Optimistic updates

### Tables
- Horizontal data display
- Pagination (1, 2, 3, ...)
- Search functionality
- Filter by status/type
- Sort by columns
- Actions menu per row

## Performance Optimization

1. **Code Splitting**
   - Dynamic imports cho heavy components
   - Route-based code splitting

2. **Caching**
   - React Query với staleTime và cacheTime
   - LocalStorage cho user data

3. **Animations**
   - Anime.js với requestAnimationFrame
   - CSS transforms thay vì position
   - will-change cho animated elements

4. **Images**
   - Next.js Image với lazy loading
   - WebP format
   - Responsive images

## Cài đặt

```bash
cd frontend
npm install  # hoặc bun install
```

## Development

```bash
npm run dev
# hoặc
bun dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Conventions

### Naming
- Components: PascalCase (UserTable.tsx)
- Hooks: camelCase với prefix 'use' (useAuth.ts)
- Services: camelCase với suffix '.service' (auth.service.ts)
- Types: PascalCase (User, CreateUserRequest)
- Constants: UPPER_SNAKE_CASE

### File Organization
- 1 component = 1 file
- Export từ index.ts cho mỗi folder
- Grouping related files trong folders

### Git Commit
- feat: Thêm feature mới
- fix: Sửa bug
- refactor: Refactor code
- style: Format code
- docs: Cập nhật documentation

## TODO - Các phần cần hoàn thiện

### Auth Pages
- [ ] Login page
- [ ] Register page
- [ ] Verify OTP page
- [ ] Forgot password page

### Manager Module
- [ ] Dashboard page
- [ ] Users management page
- [ ] Residents management page
- [ ] Houses management page
- [ ] Invoices management page
- [ ] Feedbacks management page
- [ ] Notifications management page

### Accountant Module
- [ ] Dashboard page
- [ ] Invoices management page
- [ ] Reports page

### Resident Module
- [ ] Dashboard page
- [ ] Profile page
- [ ] Invoices page
- [ ] Feedbacks page
- [ ] Notifications page
- [ ] Household page

### Components
- [ ] ConfirmDialog component
- [ ] FileUpload component
- [ ] DatePicker component
- [ ] Stats card component

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand 5.0
- **Data Fetching**: TanStack Query 5.62
- **Forms**: React Hook Form 7.54 + Zod 3.24
- **HTTP Client**: Axios 1.7
- **Icons**: Lucide React
- **Animations**: Anime.js 3.2
- **Date**: date-fns 4.1

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - BlueMoon Project
