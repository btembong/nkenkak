# Nkenkak Platform — Build Log

Date: 2026-05-08

---

## Overview

Full-stack community platform for the Nkenkak people. Built with React + Vite (frontend), Node.js + Express (backend), Prisma ORM, PostgreSQL (Neon.tech).

---

## 1. Team Section Improvements

### TeamCard.jsx — Rewritten
- Image-left layout with gradient overlay at bottom
- Name/role overlaid on photo
- Social icons appear on hover from the right
- Team badge display
- "View Profile" link to `/team/:id`
- Wrapped in `<Link>` for full-card click

### TeamMemberPage.jsx — New file (`/team/:id`)
- Large avatar overlapping a cover banner
- Name, role, team, location display
- Social links row
- Bio section
- 3 info cards (joined date, team, location)
- Same-team colleagues section
- Join CTA at bottom
- API: `GET /api/team/:id`

### backend/src/routes/team.js — Added single member route
```js
router.get('/:id', async (req, res) => {
  const member = await prisma.teamMember.findUnique({ where: { id: req.params.id } })
  if (!member || !member.isActive) return res.status(404).json({ error: 'Not found' })
  res.json(member)
})
```

---

## 2. Anthropology Page (`/anthropology`)

### AnthropologyPage.jsx — New file
8 sections with sticky quick-nav:
1. **History & Origins** — Founder/clan image panel (left image + right text) above info cards
2. **Language** — Overview of the Nkenkak language
3. **Social Structure** — Clan system, age grades, gender roles
4. **Ceremonies & Rituals** — Key ceremonies listed
5. **Arts, Music & Dance** — Subnav tabs (Overview / Photos / Videos)
   - Overview: 6 art form cards
   - Photos: gallery grid with lightbox modal
   - Videos: 2-col video cards with YouTube/Vimeo embed detection, play button overlay, inline playback
   - Fetches `GET /gallery?tag=cultural-arts` via React Query
6. **Cuisine** — 2-column food card grid, each card has image-left, numbered badge, gradient
7. **Attire** — Image-left layout with large images (`md:w-96`, min-height 320px), keyword tag pills
8. **Proverbs** — Click-to-reveal interactive cards

### Gallery route — Extended with tag/type filtering
```js
router.get('/', async (req, res) => {
  const { tag, type } = req.query
  const items = await prisma.gallery.findMany({
    where: {
      ...(tag  && { tags: { has: tag } }),
      ...(type && { mediaType: type }),
    },
  })
})
```

### Navbar — Updated
- "About" converted to dropdown with sub-items: About Us, Anthropology, Our Language, Governance, Village Map
- "Pages" dropdown expanded with 8 new items: Notices, Documents, Scholarships, Transparency, Memorial, Directory, Mentorship, Cultural Calendar
- Mobile menu updated with all new links

---

## 3. New Public Pages (11 pages)

| Page | Route | Description |
|------|-------|-------------|
| VillageMapPage | `/village-map` | SVG illustrated map, 12 clickable pins, legend, list view |
| LanguagePage | `/language` | Flashcard vocabulary, category tabs, CSS flip animation |
| CulturalCalendarPage | `/cultural-calendar` | Month grid + list view, annual traditions |
| GovernancePage | `/governance` | Static, sticky TOC with IntersectionObserver, 10 sections |
| TransparencyPage | `/transparency` | Financial reports, allocation bars, year filter, income/expenses stats |
| MemorialPage | `/memorial` | In Memoriam + Village Heroes tabs, dark gradient cards |
| NoticesPage | `/notices` | Priority-filtered notices, pulsing urgent banner, read-more toggle |
| DocumentsPage | `/documents` | File rows with download tracking, category filters, search |
| ScholarshipsPage | `/scholarships` | Scholar cards, level/year/status filters, impact stats |
| BusinessDirectoryPage | `/directory` | Featured + regular grid, category/diaspora filters, submit modal |
| MentorshipPage | `/mentorship` | Mentor cards, expertise tags, per-mentor apply modal with thank-you state |

---

## 4. New Admin Pages (8 pages)

| Page | Route | Description |
|------|-------|-------------|
| AdminDocuments | `/admin/documents` | Slide-in panel form, download stats |
| AdminScholarships | `/admin/scholarships` | Photo thumbnails, level/status badges, modal form |
| AdminNotices | `/admin/notices` | Priority badges, inline publish toggle, expiry display |
| AdminDirectory | `/admin/directory` | Pending approval tab, one-click approve action |
| AdminMentors | `/admin/mentors` | Two tabs: Mentors + Applications, inline Accept/Reject |
| AdminMemorial | `/admin/memorial` | Three-tab filter, achievements as comma-separated |
| AdminVocab | `/admin/vocab` | Inline row editing without modal, category breakdown stats |
| AdminReports | `/admin/reports` | Computed surplus/deficit, aggregated stats, publish toggle |

---

## 5. New Backend Routes (8 files)

| File | Base URL | Features |
|------|----------|----------|
| vocab.js | `/api/vocab` | GET (category filter), POST/PATCH/DELETE (admin) |
| documents.js | `/api/documents` | GET/all, POST, PATCH, DELETE, POST /:id/download |
| scholarships.js | `/api/scholarships` | GET (year/level/status filters), POST/PATCH/DELETE |
| notices.js | `/api/notices` | GET (active, non-expired), GET /all (admin), POST/PATCH/DELETE |
| businesses.js | `/api/businesses` | GET (approved), GET /all, POST /submit (public), POST/PATCH/DELETE |
| mentors.js | `/api/mentors` | GET, GET /all, POST /:id/apply, GET/PATCH /applications, POST/PATCH/DELETE |
| memorial.js | `/api/memorial` | GET (type filter), POST/PATCH/DELETE |
| reports.js | `/api/reports` | GET (year filter), GET /all, POST/PATCH/DELETE |

---

## 6. New Prisma Models (9 models)

```prisma
model Document {
  id          String   @id @default(cuid())
  title       String
  category    String
  fileUrl     String
  fileType    String?
  year        Int?
  downloads   Int      @default(0)
  isPublished Boolean  @default(false)
  uploadedBy  User?    @relation("documentsUploaded", fields: [uploadedById], references: [id])
  uploadedById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Scholarship {
  id          String   @id @default(cuid())
  name        String
  level       String
  year        Int
  sponsor     String?
  amount      Float?
  status      String   @default("active")
  bio         String?
  photoUrl    String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Notice {
  id          String    @id @default(cuid())
  title       String
  body        String
  category    String    @default("general")
  priority    String    @default("normal")
  isPublished Boolean   @default(false)
  expiresAt   DateTime?
  authorId    String?
  author      User?     @relation("noticesAuthored", fields: [authorId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Business {
  id          String   @id @default(cuid())
  name        String
  category    String
  description String?
  ownerName   String?
  contact     String?
  location    String?
  website     String?
  logoUrl     String?
  isDiaspora  Boolean  @default(false)
  isApproved  Boolean  @default(false)
  isFeatured  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Mentor {
  id           String             @id @default(cuid())
  userId       String?            @unique
  user         User?              @relation("mentorProfile", fields: [userId], references: [id])
  name         String
  role         String?
  bio          String?
  photoUrl     String?
  expertise    String[]
  available    Boolean            @default(true)
  isPublished  Boolean            @default(false)
  applications MentorApplication[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
}

model MentorApplication {
  id        String   @id @default(cuid())
  mentorId  String
  mentor    Mentor   @relation(fields: [mentorId], references: [id])
  userId    String?
  user      User?    @relation("mentorApplications", fields: [userId], references: [id])
  name      String
  email     String
  message   String?
  status    String   @default("pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Memorial {
  id           String   @id @default(cuid())
  name         String
  type         String   @default("memorial")
  role         String?
  birthYear    Int?
  deathYear    Int?
  bio          String?
  photoUrl     String?
  achievements String[]
  isPublished  Boolean  @default(false)
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model VocabWord {
  id            String   @id @default(cuid())
  word          String
  translation   String
  category      String   @default("general")
  pronunciation String?
  example       String?
  exampleTrans  String?
  isPublished   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model FinancialReport {
  id            String   @id @default(cuid())
  title         String
  year          Int
  period        String   @default("Annual")
  fileUrl       String?
  totalIncome   Float?
  totalExpenses Float?
  summary       String?
  highlights    String[]
  isPublished   Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 7. AdminLayout Sidebar — Updated

New nav groups added:

**Content group:** Notices, Documents, Language (Vocab)

**Community group:** Mentors, Directory, Memorial

**Finance group:** Reports, Scholarships

---

## 8. App.jsx — Updated

Added imports and routes for all 11 new public pages and 8 new admin pages.

New public routes:
- `/village-map`, `/language`, `/cultural-calendar`, `/governance`, `/transparency`
- `/memorial`, `/notices`, `/documents`, `/scholarships`, `/directory`, `/mentorship`
- `/anthropology`, `/team/:id`

New admin routes:
- `/admin/documents`, `/admin/scholarships`, `/admin/notices`, `/admin/directory`
- `/admin/mentors`, `/admin/memorial`, `/admin/vocab`, `/admin/reports`

---

## 9. Database

- Provider: PostgreSQL (Neon.tech)
- Migration method: `prisma db push`
- Status: All 9 new models synced successfully

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router DOM v6 |
| Styling | Tailwind CSS + inline design-system styles |
| Data fetching | React Query (useQuery, useMutation) |
| Backend | Node.js, Express |
| ORM | Prisma v5 |
| Database | PostgreSQL on Neon.tech |
| Auth | JWT (Bearer token) |
| File uploads | Cloudinary (via upload route) |
| Rate limiting | express-rate-limit |
| Security | helmet, cors, compression |

---

## 2026-05-09 — Route-Based Code Splitting (Lazy Loading)

**Change:** Converted all 50+ page/admin/portal component imports in `App.jsx` from eager static imports to `React.lazy()` + `Suspense`.

**Build result:** ✅ Success
**Modules transformed:** 1,311
**Build time:** 3m 42s

### Chunk Breakdown

| Chunk | Raw | Gzip |
|---|---|---|
| `charts.js` (recharts) | 403.51 kB | 109.31 kB |
| `vendor.js` (react, react-dom, react-router-dom) | 164.90 kB | 53.82 kB |
| `index.js` (app core / router / layouts) | 123.06 kB | 35.94 kB |
| `ui.js` (react-hook-form, react-hot-toast, date-fns) | 60.27 kB | 20.55 kB |
| `index.css` | 60.68 kB | 10.98 kB |
| `query.js` (react-query) | 41.17 kB | 10.62 kB |
| `HomePage.js` | 48.58 kB | 11.94 kB |
| `AnthropologyPage.js` | 45.22 kB | 11.20 kB |
| `ProjectDetail.js` | 38.40 kB | 8.72 kB |
| `AdminForum.js` | 32.09 kB | 7.52 kB |
| `PortalNotifications.js` | 30.90 kB | 7.13 kB |
| `GovernancePage.js` | 24.50 kB | 6.56 kB |
| `MentorshipPage.js` | 24.41 kB | 5.68 kB |
| `EventDetail.js` | 24.18 kB | 6.08 kB |
| `AdminProjects.js` | 22.79 kB | 5.94 kB |
| `CulturePage.js` | 20.71 kB | 5.63 kB |
| `ForumThread.js` | 18.71 kB | 5.23 kB |
| `BusinessDirectoryPage.js` | 16.53 kB | 4.14 kB |
| `VillageMapPage.js` | 16.04 kB | 4.97 kB |
| `FAQPage.js` | 15.92 kB | 5.69 kB |
| `index.html` | 1.85 kB | 0.85 kB |
| *(remaining ~40 page chunks)* | 3–15 kB each | — |

### Impact
- **Initial load** now only downloads: `vendor.js` + `index.js` + `index.css` + the chunk for the current route.
- Admin panel chunks (22 pages) are never downloaded by regular users.
- Portal chunks load only after login and navigation.
- Chunks are cached by the browser after first visit — subsequent navigation is instant.
- `charts.js` (recharts, 403 kB) is the largest dependency — deferred until Admin Dashboard or Reports is visited.
- Before this change: all 50+ components shipped in a single bundle on every page load.
