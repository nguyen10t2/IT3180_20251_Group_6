# 🏘️ IT3180 - Apartment Management System

Hệ thống quản lý chung cư được xây dựng với Bun runtime, ElysiaJS, Next.js và PostgreSQL.

## 📋 Mục lục

- [Tech Stack](#-tech-stack)
- [Cấu trúc Project](#-cấu-trúc-project)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt môi trường](#-cài-đặt-môi-trường)
- [Cấu hình Environment Variables](#-cấu-hình-environment-variables)
- [Khởi chạy ứng dụng](#-khởi-chạy-ứng-dụng)
- [Scripts](#-scripts-có-sẵn)
- [Troubleshooting](#-troubleshooting)

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Bun (latest)
- **Framework:** ElysiaJS
- **Database:** PostgreSQL (Neon DB)
- **Cache/Session:** Upstash Redis
- **ORM:** Drizzle ORM
- **Language:** TypeScript

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS

---

## 📁 Cấu trúc Project

```
BlueMoon/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── server.ts          # Entry point
│   │   ├── database/          # Database config
│   │   ├── handlers/          # Request handlers
│   │   ├── helpers/           # Helper functions
│   │   ├── models/            # Drizzle ORM models
│   │   ├── plugins/           # Auth & authorization
│   │   ├── services/          # Business logic
│   │   ├── sql/               # SQL scripts
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App router
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                       # Documentation
```

---

## 🔧 Yêu cầu hệ thống

### 1. Cài đặt Node.js

**Khuyến nghị:** Node.js v18.0.0 trở lên

#### Linux/macOS:
```bash
# Sử dụng nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, sau đó cài Node.js
nvm install 20
nvm use 20

# Kiểm tra version
node --version
npm --version
```

#### Windows:
- Tải Node.js từ [nodejs.org](https://nodejs.org/)
- Chọn phiên bản LTS (Long Term Support)
- Chạy installer và làm theo hướng dẫn

### 2. Cài đặt Bun

Bun là JavaScript runtime siêu nhanh, tương thích với Node.js.

#### Linux/macOS:
```bash
# Cài đặt Bun
curl -fsSL https://bun.sh/install | bash

# Hoặc sử dụng npm
npm install -g bun

# Kiểm tra version
bun --version
```

#### Windows:
```bash
# Sử dụng npm
npm install -g bun

# Hoặc sử dụng PowerShell
powershell -c "irm bun.sh/install.ps1|iex"
```

---

## ⚙️ Cài đặt môi trường

### 1. Clone Repository

```bash
git clone <repository-url>
cd BlueMoon
```

### 2. Tạo tài khoản và dịch vụ cần thiết

#### A. Neon DB (PostgreSQL Cloud)

Neon là serverless PostgreSQL database.

1. **Đăng ký tài khoản:**
   - Truy cập [https://neon.tech](https://neon.tech)
   - Đăng ký với GitHub hoặc email

2. **Tạo Project:**
   - Click "Create Project"
   - Chọn region gần bạn nhất (ví dụ: Singapore, Tokyo)
   - Đặt tên project: `apartment-management`

3. **Lấy Connection String:**
   - Sau khi tạo project, click vào "Connection Details"
   - Copy **Connection String** (có dạng: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
   - Lưu lại để dùng cho `.env`

4. **Cấu hình Database:**
   ```bash
   # Neon tự động tạo database mặc định
   # Không cần chạy thêm lệnh setup
   ```

#### B. Upstash Redis (Cache & Session)

Upstash cung cấp Redis serverless cho caching và session.

1. **Đăng ký tài khoản:**
   - Truy cập [https://upstash.com](https://upstash.com)
   - Đăng ký với GitHub hoặc email

2. **Tạo Redis Database:**
   - Click "Create Database"
   - Chọn type: **Regional** (miễn phí)
   - Region: Chọn gần bạn nhất
   - Đặt tên: `apartment-cache`

3. **Lấy Connection Details:**
   - Sau khi tạo, click vào database
   - Tab "Details" → Copy:
     - **UPSTASH_REDIS_REST_URL**: `https://xxx.upstash.io`
     - **UPSTASH_REDIS_REST_TOKEN**: `AXXXxxx...`
   - Lưu lại cho `.env`

#### C. SMTP Email Service

Dùng để gửi email xác thực, reset password, thông báo.

**Tùy chọn 1: Gmail SMTP (Khuyến nghị cho dev)**

1. **Bật 2-Step Verification:**
   - Truy cập [Google Account Security](https://myaccount.google.com/security)
   - Bật "2-Step Verification"

2. **Tạo App Password:**
   - Vào [App Passwords](https://myaccount.google.com/apppasswords)
   - Select app: "Mail"
   - Select device: "Other" → Đặt tên "Apartment System"
   - Click "Generate"
   - Copy password 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)

3. **Lưu thông tin:**
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP User: `your-email@gmail.com`
   - SMTP Password: App password vừa tạo

**Tùy chọn 2: SendGrid (Production)**

1. Đăng ký tại [https://sendgrid.com](https://sendgrid.com)
2. Tạo API Key trong Settings → API Keys
3. Verify Sender Identity (email hoặc domain)

**Tùy chọn 3: Mailtrap (Testing)**

1. Đăng ký tại [https://mailtrap.io](https://mailtrap.io)
2. Vào Email Testing → Inboxes → Copy SMTP credentials

---

## 🔐 Cấu hình Environment Variables

### Backend (.env)

Tạo file `.env` trong thư mục `backend/`:

```bash
cd backend
touch .env
```

Nội dung file `.env`:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Neon DB Connection String
# Format: postgresql://user:password@host/database?sslmode=require
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require

# ============================================
# REDIS CONFIGURATION (Upstash)
# ============================================
# Upstash Redis REST API
UPSTASH_REDIS_URL=https://xxx-xxx-xxx.upstash.io

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# JWT SECRETS
# ============================================
# Generate strong random strings (64+ characters)
# Có thể generate bằng: openssl rand -base64 64
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random-string

# ============================================
# SMTP EMAIL CONFIGURATION
# ============================================
# Gmail SMTP example:
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-16-characters

# ============================================
```

### Frontend (.env.local)

Tạo file `.env.local` trong thư mục `frontend/`:

```bash
cd frontend
touch .env.local
```

Nội dung file `.env.local`:

```env
# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000

# ============================================
# SITE CONFIGURATION
# ============================================
NEXT_PUBLIC_SITE_NAME=Apartment Management
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### Tạo JWT Secrets ngẫu nhiên

```bash
# Linux/macOS
openssl rand -base64 64

# Hoặc dùng Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🚀 Khởi chạy ứng dụng

### 1. Cài đặt Dependencies

```bash
# Backend
cd backend
bun install

# Frontend
cd ../frontend
bun install
# Hoặc: npm install
```

### 2. Khởi tạo Database

```bash
cd backend

# Seed data (optional - tạo dữ liệu mẫu)
bun run seed
```

### 3. Chạy Development Server

**Option 1: Chạy cả Backend và Frontend**

```bash
# Terminal 1: Backend
cd backend
bun run dev

# Terminal 2: Frontend  
cd frontend
bun run dev
```

**Option 2: Chạy từ root (nếu có script)**

```bash
# Từ thư mục gốc
bun run start
```

### 4. Truy cập ứng dụng

- **Frontend:** http://localhost:3000 (hoặc 3001)
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/docs (nếu có)

---

## 📜 Scripts có sẵn

### Backend Scripts

```bash
cd backend

# Development
bun run dev              # Chạy dev server với hot reload
bun run start            # Chạy production server

# Database
bun run seed             # Seed dữ liệu mẫu

# Build
bun run build            # Build production
```

### Frontend Scripts

```bash
cd frontend

# Development
npm run dev              # Chạy dev server
npm run build            # Build production
npm run start            # Chạy production build
npm run lint             # Lint code
```

---

## 🐛 Troubleshooting

### Backend Issues

#### ❌ Database connection error

**Lỗi:** `Error: connect ECONNREFUSED` hoặc `Connection refused`

**Giải pháp:**
```bash
# 1. Kiểm tra DATABASE_URL trong .env
# Đảm bảo format đúng và có ?sslmode=require ở cuối

# 2. Test connection với psql
psql "postgresql://user:pass@host/db?sslmode=require"

# 3. Kiểm tra Neon DB dashboard
# - Database có đang active không?
# - IP có bị block không?
```

#### ❌ Redis connection error

**Lỗi:** `UPSTASH_REDIS_REST_URL is not set`

**Giải pháp:**
```bash
# 1. Kiểm tra .env có UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN
# 2. Kiểm tra Upstash dashboard - database có active không?
# 3. Copy lại credentials từ Upstash
```

#### ❌ Email sending failed

**Lỗi:** `Invalid login` hoặc `Username and Password not accepted`

**Giải pháp (Gmail):**
```bash
# 1. Kiểm tra 2-Step Verification đã bật
# 2. Tạo lại App Password
# 3. Đảm bảo dùng App Password chứ không phải password Gmail thật
# 4. Kiểm tra SMTP_HOST=smtp.gmail.com và SMTP_PORT=587
```

#### ❌ Port already in use

**Lỗi:** `EADDRINUSE: address already in use :::3000`

**Giải pháp:**
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
PORT=3001
```

#### ❌ JWT errors

**Lỗi:** `JsonWebTokenError: invalid signature`

**Giải pháp:**
```bash
# 1. Tạo lại JWT secrets
openssl rand -base64 64

# 2. Cập nhật JWT_SECRET và JWT_REFRESH_SECRET trong .env
# 3. Restart server
```

### Frontend Issues

#### ❌ API connection refused

**Lỗi:** `fetch failed` hoặc `ECONNREFUSED`

**Giải pháp:**
```bash
# 1. Kiểm tra backend đang chạy
curl http://localhost:3000

# 2. Kiểm tra NEXT_PUBLIC_API_URL trong .env.local
# 3. Kiểm tra CORS settings trong backend
```

#### ❌ Environment variables not working

**Lỗi:** `NEXT_PUBLIC_API_URL is undefined`

**Giải pháp:**
```bash
# 1. Đảm bảo file tên là .env.local (không phải .env)
# 2. Đảm bảo biến có prefix NEXT_PUBLIC_
# 3. Restart dev server
npm run dev
```

### Installation Issues

#### ❌ Bun command not found

```bash
# Reinstall Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (Linux/macOS)
export PATH="$HOME/.bun/bin:$PATH"

# Restart terminal
```

#### ❌ Permission denied

```bash
# Linux/macOS
sudo chown -R $USER:$USER .

# Hoặc dùng sudo
sudo bun install
```

---

## 📚 Documentation

- [API Controllers](docs/CONTROLLERS_API.md) - API endpoints documentation
- [Workflow Diagrams](docs/Sơ%20đồ%20luồng%20hoạt%20động/) - Process flows

---

## 🔗 Useful Links

- **ElysiaJS:** [https://elysiajs.com](https://elysiajs.com)
- **Bun:** [https://bun.sh](https://bun.sh)
- **Drizzle ORM:** [https://orm.drizzle.team](https://orm.drizzle.team)
- **Next.js:** [https://nextjs.org](https://nextjs.org)
- **Neon DB:** [https://neon.tech/docs](https://neon.tech/docs)
- **Upstash Redis:** [https://docs.upstash.com/redis](https://docs.upstash.com/redis)

---

## 👥 Contributors

IT3180_20251_Group_6

---

## 📝 License

This project is part of IT3180 course at HUST.

---

**Last Updated:** January 2, 2026
