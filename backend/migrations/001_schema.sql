-- =============================================================
-- NKENKAK-NGIESANG VILLAGE COMMUNITY — DATABASE SCHEMA
-- PostgreSQL 14+
-- =============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- ENUMS
-- =============================================================
CREATE TYPE user_role AS ENUM ('admin','leader','member','guest');
CREATE TYPE user_status AS ENUM ('active','inactive','banned','pending');
CREATE TYPE project_status AS ENUM ('active','upcoming','completed','paused');
CREATE TYPE project_category AS ENUM ('education','health','infrastructure','environment','culture','agriculture','other');
CREATE TYPE donation_status AS ENUM ('pending','completed','failed','refunded');
CREATE TYPE payment_provider AS ENUM ('mtn_momo','orange_money','paypal','stripe','bank_transfer','cash');
CREATE TYPE event_category AS ENUM ('culture','education','health','sport','community','fundraiser','governance','other');
CREATE TYPE news_status AS ENUM ('draft','published','archived');
CREATE TYPE vote_type AS ENUM ('approve','reject','abstain');
CREATE TYPE notification_type AS ENUM ('donation','project_update','event_reminder','forum_reply','system','news');
CREATE TYPE media_type AS ENUM ('image','video','document');
CREATE TYPE forum_status AS ENUM ('open','closed','pinned','archived');

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'member',
  status        user_status NOT NULL DEFAULT 'pending',

  -- Profile
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(30),
  avatar_url    TEXT,
  bio           TEXT,
  date_of_birth DATE,
  gender        VARCHAR(20),

  -- Location
  village_quarter VARCHAR(100),
  city          VARCHAR(100),
  country       VARCHAR(100) DEFAULT 'Cameroon',
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),

  -- Settings
  is_diaspora   BOOLEAN DEFAULT FALSE,
  newsletter    BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verify_token VARCHAR(255),
  reset_token   VARCHAR(255),
  reset_token_expiry TIMESTAMPTZ,

  -- Timestamps
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_country ON users(country);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- PROJECTS
-- =============================================================
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          VARCHAR(255) UNIQUE NOT NULL,
  title         VARCHAR(255) NOT NULL,
  summary       TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      project_category NOT NULL,
  status        project_status NOT NULL DEFAULT 'upcoming',

  -- Financials
  goal_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
  raised_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency      VARCHAR(10) DEFAULT 'XAF',

  -- Media
  cover_image   TEXT,
  gallery_urls  TEXT[],

  -- Meta
  location      VARCHAR(255),
  start_date    DATE,
  end_date      DATE,
  beneficiaries INTEGER DEFAULT 0,
  created_by    UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Stats
  view_count    INTEGER DEFAULT 0,
  donor_count   INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_urgent     BOOLEAN DEFAULT FALSE,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_featured ON projects(is_featured);

-- Project updates (timeline)
CREATE TABLE project_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- DONATIONS
-- =============================================================
CREATE TABLE donations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(100) UNIQUE NOT NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Donor info (for anonymous/guest donations)
  donor_name      VARCHAR(200),
  donor_email     VARCHAR(255),
  donor_phone     VARCHAR(30),
  is_anonymous    BOOLEAN DEFAULT FALSE,

  -- Amount
  amount          DECIMAL(15,2) NOT NULL,
  currency        VARCHAR(10) DEFAULT 'XAF',

  -- Payment
  provider        payment_provider NOT NULL,
  provider_ref    VARCHAR(255),
  status          donation_status NOT NULL DEFAULT 'pending',

  -- Meta
  message         TEXT,
  is_recurring    BOOLEAN DEFAULT FALSE,
  receipt_sent    BOOLEAN DEFAULT FALSE,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_project ON donations(project_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_reference ON donations(reference);

-- =============================================================
-- EVENTS
-- =============================================================
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          VARCHAR(255) UNIQUE NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT NOT NULL,
  category      event_category NOT NULL DEFAULT 'community',
  cover_image   TEXT,

  -- Schedule
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ,
  is_all_day    BOOLEAN DEFAULT FALSE,
  is_recurring  BOOLEAN DEFAULT FALSE,
  recurrence    VARCHAR(50),

  -- Location
  venue         VARCHAR(255),
  location_url  TEXT,
  is_online     BOOLEAN DEFAULT FALSE,
  meeting_link  TEXT,

  -- Meta
  organizer_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  max_attendees INTEGER,
  is_published  BOOLEAN DEFAULT TRUE,
  is_featured   BOOLEAN DEFAULT FALSE,
  requires_rsvp BOOLEAN DEFAULT FALSE,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_start ON events(start_date);
CREATE INDEX idx_events_category ON events(category);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status    VARCHAR(20) DEFAULT 'attending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =============================================================
-- NEWS / ARTICLES
-- =============================================================
CREATE TABLE news (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          VARCHAR(255) UNIQUE NOT NULL,
  title         VARCHAR(255) NOT NULL,
  excerpt       TEXT NOT NULL,
  content       TEXT NOT NULL,
  cover_image   TEXT,
  category      VARCHAR(100),
  tags          TEXT[],

  author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status        news_status DEFAULT 'draft',
  is_featured   BOOLEAN DEFAULT FALSE,

  view_count    INTEGER DEFAULT 0,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_published ON news(published_at);

-- =============================================================
-- TEAM MEMBERS
-- =============================================================
CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  name        VARCHAR(200) NOT NULL,
  role_title  VARCHAR(200) NOT NULL,
  team        VARCHAR(100) NOT NULL,
  bio         TEXT,
  avatar_url  TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,

  -- Social
  facebook    VARCHAR(255),
  twitter     VARCHAR(255),
  linkedin    VARCHAR(255),
  instagram   VARCHAR(255),
  email       VARCHAR(255),

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Team join applications
CREATE TABLE team_applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name     VARCHAR(200) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(30),
  location      VARCHAR(200),
  team_choice   VARCHAR(100) NOT NULL,
  skills        TEXT,
  motivation    TEXT,
  status        VARCHAR(30) DEFAULT 'pending',
  reviewed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- GALLERY
-- =============================================================
CREATE TABLE gallery (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255),
  description TEXT,
  url         TEXT NOT NULL,
  thumbnail   TEXT,
  media_type  media_type DEFAULT 'image',
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id    UUID REFERENCES events(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  tags        TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- FORUM
-- =============================================================
CREATE TABLE forum_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon        VARCHAR(50),
  color       VARCHAR(20),
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_threads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  status      forum_status DEFAULT 'open',
  is_pinned   BOOLEAN DEFAULT FALSE,
  view_count  INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_threads_category ON forum_threads(category_id);
CREATE INDEX idx_threads_author ON forum_threads(author_id);

CREATE TABLE forum_replies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id   UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  parent_id   UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  is_solution BOOLEAN DEFAULT FALSE,
  like_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_likes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id  UUID NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- =============================================================
-- VOTING / POLLS
-- =============================================================
CREATE TABLE polls (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  closes_at    TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id    UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote       vote_type NOT NULL,
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- =============================================================
-- NOTIFICATIONS
-- =============================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =============================================================
-- NEWSLETTER SUBSCRIBERS
-- =============================================================
CREATE TABLE newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(200),
  is_active   BOOLEAN DEFAULT TRUE,
  token       VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- DIASPORA MAP PINS
-- =============================================================
CREATE TABLE diaspora_pins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(200) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  country     VARCHAR(100) NOT NULL,
  latitude    DECIMAL(10,8) NOT NULL,
  longitude   DECIMAL(11,8) NOT NULL,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- AUDIT LOG
-- =============================================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100),
  resource_id UUID,
  details     JSONB,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_team_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- AUTO-UPDATE project raised_amount on donation
-- =============================================================
CREATE OR REPLACE FUNCTION update_project_raised()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.project_id IS NOT NULL THEN
    UPDATE projects
    SET raised_amount = raised_amount + NEW.amount,
        donor_count   = donor_count + 1
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_donation_project_update
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW EXECUTE FUNCTION update_project_raised();
