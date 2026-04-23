# Nkenkak-Ngiesang Village Community Platform

Full-stack community platform built with:
- **Frontend**: React 18 + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)
- **File uploads**: Multer + Cloudinary
- **Email**: Nodemailer

## Project Structure
```
nkenkak/
├── backend/          # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/
│   └── migrations/   # SQL schema files
└── frontend/         # React + Tailwind
    └── src/
        ├── components/
        ├── pages/
        ├── context/
        ├── hooks/
        └── services/
```

## Quick Start

### 1. Database Setup
```bash
createdb nkenkak_db
psql nkenkak_db < backend/migrations/001_schema.sql
psql nkenkak_db < backend/migrations/002_seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on :5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # runs on :5173
```

## Roles
- `admin`  — Full CMS access, user management
- `leader` — Manage projects, post news/events
- `member` — Donate, vote, forum, profile
- `guest`  — Public read-only

## Payment Integration
Configure in `backend/.env`:
- `MTN_MOMO_*` — MTN Mobile Money API
- `ORANGE_*`   — Orange Money API
- `PAYPAL_*`   — PayPal REST API
- `STRIPE_*`   — Stripe API
