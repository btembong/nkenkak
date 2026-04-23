# 🌿 Nkenkak-Ngiesang — Full Stack Setup Guide

## Tech Stack
| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18 + Tailwind CSS + Vite |
| Backend    | Node.js 18+ + Express.js |
| Database   | PostgreSQL 14+ |
| Auth       | JWT (access + refresh tokens) |
| Email      | Nodemailer (SMTP) |
| Uploads    | Multer + Cloudinary |
| Payments   | MTN MoMo / Orange Money / PayPal / Stripe (stubs ready) |

---

## 📁 Project Structure

```
nkenkak/
├── backend/
│   ├── migrations/
│   │   ├── 001_schema.sql      ← All 21 DB tables + triggers
│   │   └── 002_seed.sql        ← Initial data
│   ├── src/
│   │   ├── server.js           ← Express entry point
│   │   ├── config/database.js  ← PostgreSQL pool
│   │   ├── middleware/auth.js  ← JWT + role guards
│   │   ├── controllers/        ← Business logic
│   │   ├── routes/             ← 16 API route files
│   │   └── services/email.js   ← Nodemailer service
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx             ← Router + auth guards
    │   ├── context/AuthContext.jsx
    │   ├── services/api.js     ← Axios + auto-refresh
    │   ├── components/
    │   │   ├── layout/         ← Layout, AdminLayout, PortalLayout
    │   │   ├── common/         ← Navbar, Footer, Cards, Modals
    │   │   ├── pages/          ← All 14 public pages
    │   │   ├── admin/          ← 8 admin panel pages
    │   │   └── portal/         ← 4 member portal pages
    │   └── index.css           ← Tailwind + custom design system
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
node --version   # 18+
psql --version   # 14+
```

### 2. Database Setup
```bash
# Create the database
createdb nkenkak_db

# Run schema (creates all 21 tables)
psql nkenkak_db < backend/migrations/001_schema.sql

# Seed initial data
psql nkenkak_db < backend/migrations/002_seed.sql
```

### 3. Backend
```bash
cd backend

# Copy and fill environment file
cp .env.example .env
# Edit .env with your values (see below)

# Install dependencies
npm install

# Start dev server (port 5000)
npm run dev
```

### 4. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev
```

### 5. Open the app
- **Website:** http://localhost:5173
- **API:**     http://localhost:5000/api
- **Admin:**   http://localhost:5173/admin

---

## 🔑 Default Credentials
```
Email:    admin@nkenkak-ngiesang.cm
Password: Admin@1234
```
> Change these immediately in production!

---

## ⚙️ Environment Variables (backend/.env)

### Required
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/nkenkak_db
JWT_SECRET=your_32_char_min_secret_here
JWT_REFRESH_SECRET=your_other_32_char_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Email (for verification + receipts)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password   # Not your login password — use App Password
EMAIL_FROM=noreply@nkenkak-ngiesang.cm
```

### File Uploads (Cloudinary)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 💳 Payment Integration

All four providers are stubbed in `backend/src/controllers/donationsController.js`.
Replace each `async function initXxx()` with your real SDK calls.

### MTN Mobile Money
1. Register at https://momodeveloper.mtn.com
2. Get Subscription Key, create API User + API Key
3. Fill `MTN_MOMO_*` variables in .env
4. Implement `initMtnMomo()` using Collections API v1

### Orange Money
1. Register at https://developer.orange.com
2. Fill `ORANGE_*` variables
3. Implement `initOrangeMoney()` using WebPay API

### PayPal
1. Create app at https://developer.paypal.com
2. Fill `PAYPAL_*` variables
3. `npm install @paypal/checkout-server-sdk` in backend
4. Implement `initPayPal()` using Orders v2

### Stripe
1. Get keys from https://dashboard.stripe.com
2. Fill `STRIPE_*` variables
3. `npm install stripe` in backend
4. Implement `initStripe()` using Payment Intents

### Webhook endpoint
```
POST /api/donations/webhook/:provider
```
Register this URL with each payment provider for status callbacks.

---

## 🗂️ API Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me              (auth)
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Projects
```
GET    /api/projects           ?status=active&category=education&featured=true&page=1&limit=12
GET    /api/projects/stats/summary
GET    /api/projects/:slug
POST   /api/projects           (leader+)
PATCH  /api/projects/:id       (leader+)
DELETE /api/projects/:id       (admin)
POST   /api/projects/:id/updates (leader+)
```

### Donations
```
POST /api/donations/initiate   (optional auth)
POST /api/donations/webhook/:provider
GET  /api/donations            (admin)
GET  /api/donations/summary    (admin)
GET  /api/donations/my         (auth)
```

### Forum
```
GET  /api/forum/categories
GET  /api/forum/threads        ?category=slug&search=term
GET  /api/forum/threads/:id
POST /api/forum/threads        (auth)
POST /api/forum/threads/:id/replies (auth)
POST /api/forum/replies/:id/like    (auth)
```

### Admin (admin only)
```
GET   /api/admin/dashboard
GET   /api/admin/users         ?role=&status=&search=
PATCH /api/admin/users/:id
GET   /api/admin/team-applications
PATCH /api/admin/team-applications/:id
GET   /api/admin/audit-logs
```

---

## 🎨 Design System

### Colors (tailwind.config.js)
```
gold.DEFAULT   #C9A84C   gold.light #E8C97A   gold.dark  #8B6914
earth.DEFAULT  #3D2B1F   earth.light #5C3D2E
forest.DEFAULT #2D5016   forest.light #3D6B20
cream.DEFAULT  #F5EDD8   cream.light #FBF6EC
```

### Fonts
- **Cinzel** — Logo, numbers, headings
- **Playfair Display** — Section titles, serif content
- **Raleway** — Body text, UI elements

### Reusable CSS Classes
```css
.btn-gold        /* Gold gradient CTA button */
.btn-outline-gold /* Outlined gold button */
.btn-earth       /* Dark earth button */
.btn-forest      /* Forest green button */
.card            /* White card with hover lift */
.input           /* Form input field */
.label           /* Form label */
.badge-active    /* Green status badge */
.badge-upcoming  /* Blue status badge */
.badge-complete  /* Red status badge */
.section-eyebrow /* Decorative section label */
.section-title   /* Large serif section heading */
.modal-overlay   /* Full-screen modal backdrop */
.modal-box       /* Modal container (light) */
.modal-box-dark  /* Modal container (dark/earth) */
.sidebar-link    /* Admin/portal sidebar nav link */
```

---

## 🛡️ Security Features

- JWT access tokens (15min) + refresh tokens (7 days)
- bcrypt password hashing (12 rounds)
- Rate limiting on auth routes (20 req/15min)
- Helmet.js security headers
- CORS configured for frontend origin only
- Role-based route guards: `admin`, `leader`, `member`
- Input validation on all routes
- Audit log for admin actions

---

## 🚀 Production Deployment

### Backend (e.g. Railway, Render, VPS)
```bash
cd backend
npm start
# Set NODE_ENV=production
# Use connection pooling (PgBouncer recommended)
# Use a process manager: pm2 start src/server.js
```

### Frontend (e.g. Vercel, Netlify)
```bash
cd frontend
npm run build
# Deploy the /dist folder
# Set VITE_API_URL to your backend URL
# Update vite.config.js proxy for production
```

### Database (e.g. Supabase, Railway, Neon)
```bash
# Use DATABASE_URL with SSL:
DATABASE_URL=postgresql://user:pass@host:5432/nkenkak_db?sslmode=require
```

---

## 📋 Features Checklist

### Public Site
- [x] Hero slider with 3 slides
- [x] Animated stat counters
- [x] Culture & heritage pages
- [x] Projects with category filtering + search
- [x] Project detail with progress, updates, voting
- [x] Events with calendar
- [x] Gallery with lightbox
- [x] Team page with join application
- [x] News / blog
- [x] Community forum with replies + likes
- [x] Diaspora map with pin system
- [x] Contact page
- [x] Newsletter subscription
- [x] Donation modal (3-step: project → amount → details)
- [x] Floating donate button

### Auth
- [x] Register with email verification
- [x] Login / logout
- [x] JWT refresh token rotation
- [x] Forgot/reset password flow

### Member Portal
- [x] Personal dashboard
- [x] Profile editor
- [x] Donation history
- [x] Notification center

### Admin Panel
- [x] Stats dashboard with charts
- [x] Projects CMS (CRUD + feature/urgent toggle)
- [x] Donations management
- [x] User management with role editor
- [x] News editor with publish workflow
- [x] Events management
- [x] Team + join applications (approve/reject)
- [x] Forum moderation

### Payment Providers (stubs ready)
- [ ] MTN Mobile Money
- [ ] Orange Money
- [ ] PayPal
- [ ] Stripe
