-- =============================================================
-- SEED DATA — NKENKAK-NGIESANG
-- Run after 001_schema.sql
-- =============================================================

-- Admin user (password: Admin@1234)
INSERT INTO users (id, email, password_hash, role, status, first_name, last_name, email_verified, country)
VALUES (
  uuid_generate_v4(),
  'admin@nkenkak-ngiesang.cm',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewFHkXg0J3y9GzZy',
  'admin', 'active', 'Admin', 'Village', TRUE, 'Cameroon'
);

-- Forum categories
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order) VALUES
('General Discussion',   'general',         'Open discussions about village life',             'fas fa-comments',     '#C9A84C', 1),
('Projects & Development','projects',        'Discuss ongoing and proposed community projects',  'fas fa-hard-hat',     '#2D5016', 2),
('Culture & Heritage',   'culture',         'Share stories, traditions and cultural knowledge', 'fas fa-masks-theater','#8B1A1A', 3),
('Youth & Education',    'youth',           'Education, scholarships, youth opportunities',     'fas fa-graduation-cap','#1A3A5C', 4),
('Health & Wellness',    'health',          'Community health news and discussions',             'fas fa-heartbeat',    '#5C1A1A', 5),
('Diaspora Connect',     'diaspora',        'Connect with village members around the world',    'fas fa-globe-africa', '#3D6B20', 6),
('Jobs & Opportunities', 'jobs',            'Employment and business opportunities',             'fas fa-briefcase',    '#4A3D1A', 7),
('Announcements',        'announcements',   'Official village announcements',                   'fas fa-bullhorn',     '#1A3D3D', 8);

-- Projects
INSERT INTO projects (slug, title, summary, description, category, status, goal_amount, raised_amount, currency, beneficiaries, is_featured, is_urgent, location) VALUES
(
  'primary-school-renovation',
  'Nkenkak Primary School Renovation',
  'Rebuilding 8 classrooms with new desks, lighting and sanitation for 320 children.',
  'The primary school serving Nkenkak-Ngiesang and surrounding quarters has deteriorated significantly over the past two decades. Roofs leak, windows are broken, and children sit on the floor or improvised seats. This project will renovate all 8 classrooms, install proper desks, LED lighting, clean toilets and a handwashing station. 320 children will directly benefit.',
  'education', 'active', 5000000, 3600000, 'XAF', 320, TRUE, FALSE, 'Nkenkak-Ngiesang Village'
),
(
  'community-health-post',
  'Community Health Post Expansion',
  'Extending the village health post to include a maternity ward and pharmacy.',
  'The current health post serves over 4000 residents but lacks a maternity ward, causing expectant mothers to travel 15km to the nearest hospital. This expansion will add a 4-bed maternity ward, a consultation room, essential medicines store, and solar power for medical refrigeration.',
  'health', 'active', 10000000, 4500000, 'XAF', 4200, TRUE, TRUE, 'Nkenkak-Ngiesang Village'
),
(
  'access-road-paving',
  'Village Access Road Paving',
  'Paving the 4km road connecting Nkenkak-Ngiesang to the main regional highway.',
  'The unpaved access road becomes impassable during the rainy season, cutting the village off from markets and services for weeks at a time. This 4km paving project using interlocking concrete blocks will provide year-round access, reduce transport costs and connect families to opportunities.',
  'infrastructure', 'upcoming', 15000000, 2250000, 'XAF', 4200, FALSE, FALSE, '4km Village Road'
),
(
  'clean-water-pipeline',
  'Clean Water Pipeline Project',
  'Installing a gravity-fed pipeline to bring potable water to 600 households.',
  'Women and children currently walk up to 5km daily to fetch water from unprotected springs. This gravity-fed pipeline will tap a clean mountain spring and distribute potable water to 12 standpipes serving all village quarters. 600 households — approximately 3000 people — will have safe water within 500m of their homes.',
  'environment', 'active', 10000000, 8800000, 'XAF', 3000, TRUE, TRUE, 'Village Quarters'
),
(
  'digital-skills-centre',
  'Digital Skills Centre',
  'A computer lab and training centre for youth to gain digital skills.',
  'The digital divide is one of the greatest barriers facing village youth. This centre will house 20 computers with internet access, provide coding, graphic design and digital marketing training, and serve as a remote work hub. It will target youth aged 16-35 and create pathways to online employment.',
  'education', 'upcoming', 6000000, 1200000, 'XAF', 200, FALSE, FALSE, 'Village Youth Centre'
),
(
  'solar-street-lighting',
  'Solar Street Lighting',
  '20 solar-powered street lights installed across the main village paths.',
  'Completed project. 20 solar LED street lights now illuminate the main paths and market area of Nkenkak-Ngiesang. This has improved safety, extended market hours and enabled children to study after dark.',
  'infrastructure', 'completed', 3000000, 3000000, 'XAF', 4200, FALSE, FALSE, 'Village Main Road'
),
(
  'community-farm',
  'Communal Organic Farm',
  'Establishing a 5-hectare communal farm to improve food security.',
  'This project will establish a 5-hectare organic demonstration farm using traditional and modern techniques. It will train 50 smallholder farmers in sustainable agriculture, provide seedlings and tools, and create a cooperative marketing structure to sell surplus produce at regional markets.',
  'agriculture', 'upcoming', 4000000, 800000, 'XAF', 250, FALSE, FALSE, 'Village Farmland'
);

-- Events
INSERT INTO events (slug, title, description, category, start_date, end_date, venue, is_published, is_featured) VALUES
(
  'harvest-festival-2026',
  'Annual Harvest Festival — Nkwo Market Day',
  'Three days of cultural performances, traditional food, wrestling competitions and the blessing of the new harvest season. All villagers and diaspora members are welcome.',
  'culture',
  '2026-04-28 08:00:00+01', '2026-04-30 22:00:00+01',
  'Village Square, Nkenkak-Ngiesang', TRUE, TRUE
),
(
  'community-forum-may-2026',
  'Community Development Forum — Q2 2026',
  'Quarterly town hall meeting to discuss ongoing projects, budgets and new initiatives. Diaspora can join via video link.',
  'governance',
  '2026-05-10 10:00:00+01', '2026-05-10 16:00:00+01',
  'Community Hall', TRUE, FALSE
),
(
  'youth-summit-may-2026',
  'Youth Entrepreneurship Summit',
  'A full-day summit for village youth to present business ideas and access mentorship from diaspora entrepreneurs.',
  'education',
  '2026-05-24 09:00:00+01', '2026-05-24 18:00:00+01',
  'Youth Centre', TRUE, FALSE
),
(
  'school-gala-june-2026',
  'School Fundraising Gala',
  'An evening gala dinner to raise funds for the primary school renovation. Formal dress. Hosted by the Cultural Committee.',
  'fundraiser',
  '2026-06-15 18:00:00+01', '2026-06-15 23:00:00+01',
  'Village Palace Grounds', TRUE, TRUE
);

-- News
INSERT INTO news (slug, title, excerpt, content, category, status, is_featured, published_at) VALUES
(
  'water-pipeline-88-percent',
  'Water Pipeline Reaches 88% Funding — Launch Date Set for July',
  'After three years of planning and fundraising, the gravity-fed clean water pipeline project has reached 88% of its funding target.',
  '<p>After three years of careful planning, community consultations, and an intensive fundraising campaign that reached donors in 14 countries, the Nkenkak-Ngiesang Clean Water Pipeline Project has reached 88% of its 10,000,000 FCFA funding target.</p><p>The project committee has confirmed that construction will begin in July 2026, with completion expected before the end of the rainy season. The pipeline will serve 600 households across all village quarters.</p>',
  'Projects', 'published', TRUE, NOW() - INTERVAL '4 days'
),
(
  'school-renovation-phase-1',
  'School Renovation Phase 1 Completed',
  'The first four classrooms of the primary school have been fully renovated and reopened to 160 students.',
  '<p>Phase 1 of the primary school renovation is complete. Four classrooms have been repainted, reroofed, fitted with new furniture and LED lighting. 160 students returned to renewed classrooms last Monday.</p>',
  'Education', 'published', FALSE, NOW() - INTERVAL '12 days'
),
(
  'diaspora-forum-record',
  'Diaspora Forum Draws Record 120 Participants',
  'The quarterly online town hall saw the highest participation yet, with members joining from 14 countries.',
  '<p>The Q1 2026 diaspora forum held via video conference attracted 120 participants — the highest turnout in the event''s history. Members joined from France, Germany, USA, Canada, UK, Nigeria, Gabon, South Africa and more.</p>',
  'Community', 'published', FALSE, NOW() - INTERVAL '25 days'
),
(
  'solar-lighting-commissioned',
  'Solar Street Lighting Project Fully Commissioned',
  '20 solar lights now illuminate Nkenkak-Ngiesang''s main paths, improving safety and economic activity after dark.',
  '<p>The 20 solar LED street lights funded by the community have been installed and commissioned. The village square, main market road and health post access path are now illuminated every night.</p>',
  'Success', 'published', FALSE, NOW() - INTERVAL '48 days'
);

-- Team members
INSERT INTO team_members (name, role_title, team, bio, sort_order) VALUES
('HRH Fon Ngiesang III',     'Traditional Ruler & Patron',         'leadership',   'Custodian of the village traditions and supreme authority in cultural matters.', 1),
('Mr. Alain Kenfack',        'Development Committee President',    'leadership',   'Leads village development strategy, diaspora relations, and oversees all projects.', 2),
('Engr. Brice Fotso',        'Infrastructure Lead',                'development',  'Civil engineer overseeing road, water and construction projects.', 3),
('Mme. Grace Nkengasong',    'Cultural Affairs Director',          'culture',      'Preserves oral traditions, organises festivals, and manages the village heritage archive.', 4),
('Dr. Carine Wabo',          'Community Health Coordinator',       'development',  'Physician coordinating the health post expansion and annual medical missions.', 5),
('Josh Ngafeu',              'Youth President',                    'youth',        'Entrepreneur and community mobiliser leading the Digital Skills Centre project.', 6),
('Mrs. Pauline Tagne',       'Education Committee Chair',          'development',  'Retired school principal championing access to quality education.', 7),
('Mr. Dieudonne Kamga',      'Treasurer & Finance Officer',        'leadership',   'CPA managing all village funds, donor transparency reports and financial governance.', 8);
