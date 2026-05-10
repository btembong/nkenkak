# Nkenkak-Ngiesang Development Council — Full Application Documentation

---

## Overview

**Nkenkak-Ngiesang** is a full-stack community platform for the Nkenkak-Ngiesang village and its diaspora. It covers civic engagement, cultural preservation, development projects, jobs, events, forums, donations, and more — all in one platform.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Database access layer |
| PostgreSQL (Neon) | Cloud database |
| JSON Web Tokens | Authentication (access + refresh tokens) |
| bcrypt | Password hashing |
| Nodemailer | Transactional emails (SMTP) |
| Socket.io | Real-time chat |
| Cloudinary | Image/file uploads |
| Flutterwave | Payment processing (donations + premium) |
| Anthropic Claude API | AI CV generator |
| Web Push (VAPID) | Browser push notifications |
| Twilio | SMS broadcast |
| node-cron | Scheduled background jobs |
| helmet | HTTP security headers |
| express-rate-limit | API rate limiting |
| compression | Response compression |
| morgan | HTTP request logging |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| React Query v3 | Server state management & caching |
| Tailwind CSS v3 | Utility-first styling |
| react-hook-form | Form state & validation |
| axios | HTTP client |
| socket.io-client | Real-time chat connection |
| recharts | Analytics charts (admin dashboard) |
| date-fns | Date formatting |
| react-hot-toast | Toast notifications |
| react-countup | Animated stat counters |
| Font Awesome | Icons |
| Google Fonts (Sora + Poppins) | Typography |

### Infrastructure & Services
| Service | Purpose |
|---|---|
| Neon (PostgreSQL) | Serverless Postgres database |
| Cloudinary | Media storage & CDN |
| Flutterwave | African payment gateway (MTN MoMo, Orange Money, cards) |
| Anthropic Claude Haiku | AI-powered CV generation |
| SMTP (Gmail/custom) | Email delivery |
| Twilio | SMS notifications |

---

## Project Structure

```
nkenkak/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Full database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Prisma client + connection
│   │   ├── controllers/
│   │   │   └── authController.js  # Auth logic (register, login, me, reset)
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authenticate, optionalAuth, isAdmin, isLeader
│   │   ├── routes/                # All API route handlers (41 route files)
│   │   ├── services/
│   │   │   ├── email.js           # All transactional email templates
│   │   │   ├── sms.js             # Twilio SMS service
│   │   │   ├── chatSocket.js      # Socket.io real-time chat
│   │   │   └── ...
│   │   └── server.js              # Express app entry point
│   ├── .env                       # Environment variables (never commit)
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── admin/             # Admin panel pages (30+ components)
    │   │   ├── common/            # Shared components (Navbar, Footer, Modals)
    │   │   ├── layout/            # Layout wrappers (Layout, AdminLayout, PortalLayout)
    │   │   ├── pages/             # Public-facing pages (50+ components)
    │   │   └── portal/            # Member portal pages
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Global auth state + token management
    │   │   └── LanguageContext.jsx# Multilingual support
    │   ├── services/
    │   │   └── api.js             # Axios instance with auth interceptors
    │   ├── App.jsx                # Route definitions
    │   └── index.css              # Global styles + Tailwind layers
    └── package.json
```

---

## Database Models (Prisma Schema)

| Model | Description |
|---|---|
| User | Members, admins, leaders — with auth, profile, premium status |
| RefreshToken | JWT refresh token store |
| Project | Village development projects with funding progress |
| Donation | Payment records linked to projects |
| Event | Community events with ticketing |
| EventRegistration | Event ticket bookings |
| News | Published articles/news |
| NewsComment | Comments on news articles |
| Gallery | Photo uploads with albums |
| GalleryAlbum | Photo album groupings |
| Team | Team members / staff profiles |
| TeamApplication | Applications to join the team |
| ForumThread | Discussion threads |
| ForumReply | Thread replies |
| ForumLike | Likes on replies |
| Poll | Community polls |
| PollOption | Poll choices |
| Vote | Poll votes |
| Notification | In-app notifications |
| Newsletter | Newsletter subscriber list |
| DiasporaPin | Map pins for diaspora members |
| AuditLog | Admin action log |
| Contact | Contact form submissions |
| HeroSlide | Homepage hero carousel slides |
| Document | Community documents/downloads |
| ScholarshipProgram | Scholarship programs |
| ScholarshipApplication | Applications to scholarships |
| Notice | Official notices/announcements |
| Business | Business directory listings |
| Mentor | Mentorship profiles |
| Memorial | Memorial entries for departed members |
| VocabWord | Language preservation dictionary |
| Report | Downloadable reports |
| VolunteerHour | Volunteer hour log |
| PushSubscription | Web push notification subscriptions |
| ChatMessage | Real-time chat messages |
| DirectMessage | Private messages between users |
| Petition | Community petitions |
| PetitionSignature | Petition signatures |
| JobPost | Job board listings |
| WikiPage | Community wiki articles |
| WikiRevision | Wiki edit history |
| BudgetItem | Community budget transparency |
| Election | Community elections |
| ElectionCandidate | Election candidates |
| ElectionVote | Election ballots |
| LiveRoom | Video meeting rooms (Daily.co) |

---

## API Routes (41 endpoints)

| Route | Description |
|---|---|
| `/api/auth` | Register, login, logout, refresh, me, forgot/reset password |
| `/api/users` | Profile, change password, member directory |
| `/api/admin` | Dashboard stats, user management, analytics, audit log |
| `/api/projects` | CRUD for development projects |
| `/api/donations` | Initiate payment, verify, webhook, history |
| `/api/premium` | Initiate premium subscription, verify payment |
| `/api/events` | Events CRUD, registration, ticketing |
| `/api/news` | News articles CRUD |
| `/api/news/:slug/comments` | Article comments |
| `/api/gallery` | Photo gallery + albums |
| `/api/gallery-albums` | Album management |
| `/api/team` | Team members + applications |
| `/api/forum` | Threads, replies, likes |
| `/api/polls` | Polls + voting |
| `/api/notifications` | In-app notifications |
| `/api/newsletter` | Subscribe, unsubscribe, campaigns |
| `/api/diaspora` | Diaspora pins (map) |
| `/api/contact` | Contact form submissions |
| `/api/hero` | Hero slides (homepage carousel) |
| `/api/upload` | Cloudinary image upload |
| `/api/stats` | Public stats for homepage |
| `/api/vocab` | Language dictionary |
| `/api/documents` | Document library |
| `/api/scholarships` | Scholarship applications |
| `/api/scholarship-programs` | Scholarship program management |
| `/api/notices` | Official notices |
| `/api/businesses` | Business directory |
| `/api/mentors` | Mentorship profiles |
| `/api/memorial` | Memorial entries |
| `/api/reports` | Community reports |
| `/api/volunteer` | Volunteer hour logging |
| `/api/push` | Web push notification subscriptions |
| `/api/chat` | Real-time chat messages (Socket.io) |
| `/api/messages` | Private direct messages |
| `/api/petitions` | Petitions + signatures |
| `/api/jobs` | Job board listings + AI CV generator |
| `/api/wiki` | Wiki pages + revision history |
| `/api/budget` | Budget transparency items |
| `/api/campaigns` | Email campaign blasts |
| `/api/elections` | Elections + candidates + voting |
| `/api/rooms` | Live video rooms (Daily.co) |

---

## Public Pages (50+)

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero slider, stats, projects, news, events |
| Culture | `/culture` | Cultural heritage content |
| Anthropology | `/anthropology` | Historical & anthropological info |
| Projects | `/projects` | Active & completed village projects |
| Project Detail | `/projects/:slug` | Single project with donations |
| Events | `/events` | Upcoming & past events |
| Event Detail | `/events/:slug` | Single event with registration |
| Gallery | `/gallery` | Photo gallery with albums |
| Team | `/team` | Meet the team |
| Team Member | `/team/:id` | Individual team member profile |
| Volunteers | `/volunteers` | Volunteer programme info |
| News | `/news` | News articles list |
| News Detail | `/news/:slug` | Full article with comments |
| Forum | `/forum` | Community discussion threads |
| Forum Thread | `/forum/:id` | Single thread with replies |
| Contact | `/contact` | Contact form |
| Diaspora | `/diaspora` | Diaspora network map + pins |
| FAQ | `/faq` | Frequently asked questions |
| Village Map | `/village-map` | Interactive village map |
| Language | `/language` | Language preservation dictionary |
| Cultural Calendar | `/cultural-calendar` | Cultural events calendar |
| Governance | `/governance` | Governance structure info |
| Transparency | `/transparency` | Financial transparency |
| Memorial | `/memorial` | Memorial for departed members |
| Notices | `/notices` | Official notices |
| Documents | `/documents` | Document downloads |
| Scholarships | `/scholarships` | Scholarship applications |
| Business Directory | `/directory` | Local business listings |
| Mentorship | `/mentorship` | Mentorship programme |
| Polls | `/polls` | Community polls & voting |
| Member Directory | `/members` | Public member directory |
| Chat | `/chat` | Real-time community chat |
| Petitions | `/petitions` | Community petitions |
| Job Board | `/jobs` | Job listings with hero & sponsors |
| Job Detail | `/jobs/:id` | Job detail — Lumoojob style |
| Wiki | `/wiki` | Community knowledge base |
| Budget | `/budget` | Budget transparency |
| Elections | `/elections` | Community elections |
| Election Detail | `/elections/:id` | Single election voting |
| Live Rooms | `/live` | Video meeting rooms list |
| Live Room | `/live/:slug` | Active video meeting (private) |

---

## Auth Pages

| Page | Route |
|---|---|
| Login | `/login` |
| Register | `/register` |
| Forgot Password | `/forgot-password` |
| Reset Password | `/reset-password` |

---

## Member Portal Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/portal` | Personal stats, activity, notifications |
| Profile | `/portal/profile` | Edit profile, change password |
| Donations | `/portal/donations` | Donation history |
| Events | `/portal/events` | Registered events |
| Volunteer | `/portal/volunteer` | Volunteer opportunities |
| Volunteer Hours | `/portal/hours` | Logged volunteer hours |
| Notifications | `/portal/notifications` | All in-app notifications |
| Messages | `/portal/messages` | Private messages |

---

## Admin Panel Pages (30+)

| Page | Route |
|---|---|
| Dashboard | `/admin` |
| Projects | `/admin/projects` |
| News | `/admin/news` |
| Events | `/admin/events` |
| Gallery | `/admin/gallery` |
| Team | `/admin/team` |
| Forum | `/admin/forum` |
| Polls | `/admin/polls` |
| Donations | `/admin/donations` |
| Newsletter | `/admin/newsletter` |
| Users | `/admin/users` |
| Contacts | `/admin/contacts` |
| Audit Log | `/admin/audit` |
| Settings | `/admin/settings` |
| Documents | `/admin/documents` |
| Scholarships | `/admin/scholarships` |
| Notices | `/admin/notices` |
| Directory | `/admin/directory` |
| Mentors | `/admin/mentors` |
| Memorial | `/admin/memorial` |
| Vocabulary | `/admin/vocab` |
| Reports | `/admin/reports` |
| Push Notifications | `/admin/push` |
| Email Campaigns | `/admin/campaigns` |
| Jobs | `/admin/jobs` |
| Petitions | `/admin/petitions` |
| Wiki | `/admin/wiki` |
| Budget | `/admin/budget` |
| Chat Moderation | `/admin/chat` |
| Elections | `/admin/elections` |
| Live Rooms | `/admin/live-rooms` |
| Hero Slides | `/admin/hero-slides` |

---

## Key Features Built

### Authentication & Users
- JWT access + refresh token flow
- Role-based access: `admin`, `leader`, `member`, `guest`
- Password reset via email link
- Premium subscription tier (`isPremium`)
- Auth context with auto-refresh on window focus

### Premium Subscription System
- **Flutterwave payment** — MTN Mobile Money, Orange Money, card
- Monthly (2,000 XAF) and Annual (18,000 XAF) plans
- Frontend payment initiation → Flutterwave hosted page → callback verify
- Webhook backup for server-side activation
- Confirmation email on activation (plan-specific)
- In-app notification on activation
- Admin manual premium toggle per user
- Premium gates: recruiter contacts, AI CV generator

### Job Board
- Hero section with Pexels background, glassmorphism job slider, dot indicators
- Sponsor logos strip with infinite scroll and blur fade masks
- Job listing cards: company logo, category colour, description, chips
- Search + type/category/location filters
- Job Detail page — Lumoojob style:
  - Dark green banner with cubes texture
  - Overlapping white logo card
  - Blurred recruiter contact for non-premium users
  - AI CV generator (premium only)
  - Company info sidebar, social handles, share
- Post a listing form with full company details

### AI CV Generator
- Premium-only feature
- User inputs their background (education, experience, skills)
- Claude Haiku generates a tailored, ATS-friendly CV
- Sections: Summary, Skills, Experience, Education, Additional Info
- Copy to clipboard

### Donations & Payments
- Flutterwave integration
- Project-specific or general fund donations
- Donation receipt email
- Donor history in member portal
- Admin donation management

### Email System (11 templates)
- Welcome / onboarding
- Password reset
- Donation receipt
- Event registration confirmation
- Newsletter subscription
- Newsletter campaign blast
- Contact auto-reply + admin alert
- Team application confirmation + result
- Premium subscription confirmation (Monthly / Annual)
- Project update notification

### Real-time Features
- Socket.io community chat
- Private direct messages
- Live video rooms (Daily.co)

### Community Tools
- Forum with threads, replies, likes, moderation
- Polls & voting
- Petitions & signatures
- Elections with candidate profiles and secret ballot
- Community wiki with revision history
- Budget transparency tracker
- Cultural calendar
- Language preservation dictionary
- Village map & diaspora pins
- Memorial for departed members
- Business directory
- Mentorship programme
- Scholarship management
- Document library
- Official notices

### Admin Capabilities
- Full CRUD across all content types
- User management: role change, ban/restore, premium toggle
- Analytics dashboard with charts (signups, donations, countries)
- Audit log of all admin actions
- Push notification broadcasts
- Email campaign blasts
- Newsletter management
- Hero slide carousel management

---

## Environment Variables Required

### Backend `.env`
```
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FLW_SECRET_HASH=

# Anthropic (AI CV)
ANTHROPIC_API_KEY=

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Daily.co (Live rooms)
DAILY_API_KEY=
```

### Frontend `.env`
```
VITE_API_URL=https://yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
VITE_FLUTTERWAVE_PUBLIC_KEY=
```

---

## Security Implementation
- Helmet.js security headers on all responses
- Rate limiting: 20 req/15min on auth, 500 req/15min on API
- bcrypt password hashing (cost factor 12)
- JWT short-lived access tokens + rotating refresh tokens
- Admin/leader role enforcement on all sensitive routes
- Flutterwave webhook signature verification
- Input validation on all write endpoints
- CORS restricted to frontend domain

---

## Design System
- **Primary colour**: Purple `#5B2D8E`
- **Accent colour**: Gold `#F0A500`
- **Green (jobs/premium)**: `#00C48C` / `#00A876`
- **Font headings**: Sora (Google Fonts)
- **Font body**: Poppins (Google Fonts)
- **Border radius**: `rounded-2xl` / `rounded-3xl` throughout
- **Card shadow**: `0 4px 24px rgba(91,45,142,0.08)`
- **Glassmorphism**: `rgba(255,255,255,0.12)` + `backdrop-filter: blur(20px)`
- **Texture**: transparenttextures.com cubes pattern at 20% opacity on dark sections
