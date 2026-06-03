const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding diaspora event + news story...')

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (!admin) throw new Error('No admin user found — run main seed first.')

  /* ══════════════════════════════════════════════════════════════
     EVENT — 3rd Annual Nkenkak-Ngiesang Diaspora Forum 2025
  ══════════════════════════════════════════════════════════════ */
  const event = await prisma.event.upsert({
    where: { slug: 'diaspora-forum-2025' },
    update: {},
    create: {
      slug:          'diaspora-forum-2025',
      title:         '3rd Annual Nkenkak-Ngiesang Diaspora Forum',
      category:      'diaspora',
      isPublished:   true,
      isFeatured:    true,
      requiresRsvp:  true,
      ticketPrice:   null,           // free for community members
      isOnline:      true,
      isAllDay:      false,
      maxAttendees:  300,
      organizerName: 'Nkenkak-Ngiesang Development Council',
      organizerId:   admin.id,
      meetingLink:   'https://zoom.us/j/nkenkak2025',
      venue:         'Community Hall, Nkenkak-Ngiesang + Zoom (Hybrid)',
      startDate:     new Date('2025-09-27T09:00:00Z'),
      endDate:       new Date('2025-09-27T18:00:00Z'),
      coverImage:    'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png',
      description: `The 3rd Annual Nkenkak-Ngiesang Diaspora Forum is our most important gathering of the year — bringing together community members from the village, Cameroon's major cities, and the diaspora across Europe, North America, and beyond.

This full-day hybrid event (in-person at the Community Hall + live-streamed via Zoom) covers the state of village development, project updates, financial transparency reports, elections, and cultural celebration.

Whether you are in Yaoundé, Paris, Berlin, London, or Toronto — your voice, your vote, and your presence matter. Join us for a day of connection, accountability, and community.

The forum is free for all community members. Simultaneous interpretation will be provided in French and English. Lunch is served on-site for in-person attendees.`,
    },
  })

  /* Agenda items */
  const agendaItems = [
    { time: '09:00', title: 'Registration & Welcome Coffee',         description: 'Sign in, collect your name badge, and greet fellow members.',                         sortOrder: 1 },
    { time: '09:30', title: 'Opening Ceremony',                      speaker: 'Chief Ngwa Emmanuel',   description: 'Traditional welcome address by the Village Fon followed by a prayer.',               sortOrder: 2 },
    { time: '10:00', title: 'State of the Village — Annual Report',  speaker: 'Council Secretary',     description: 'Full review of 2024–2025 activities, finances, and milestones across all departments.', sortOrder: 3 },
    { time: '11:00', title: 'Project Updates — Live from the Field', speaker: 'Project Leads',         description: 'Water Pipeline, School Renovation, and Digital Skills Centre team leads present progress, photos, and next steps.', sortOrder: 4 },
    { time: '12:00', title: 'Q&A — Open Floor',                     description: 'Community members ask questions to the project leads and council.',                      sortOrder: 5 },
    { time: '12:30', title: 'Lunch Break',                           description: 'Traditional meal served on-site. Online attendees take a break.',                       sortOrder: 6 },
    { time: '14:00', title: 'Working Groups (Parallel Sessions)',    description: 'Four breakout groups: Education & Youth · Health & Environment · Infrastructure · Culture & Heritage. Each group sets priorities for 2026.', sortOrder: 7 },
    { time: '15:30', title: 'Diaspora Contributions Review',         speaker: 'Finance Committee',     description: 'Full transparency report on funds received from diaspora members, how they were spent, and receipts shared publicly.', sortOrder: 8 },
    { time: '16:00', title: 'Community Elections',                   description: 'Election of two new council positions — Youth Representative and Diaspora Liaison. Eligible members vote via the platform.',  sortOrder: 9 },
    { time: '16:45', title: 'Cultural Showcase',                     speaker: 'Cultural Committee',    description: 'Live traditional dance, music, and a short film about village heritage produced by the youth team.', sortOrder: 10 },
    { time: '17:30', title: 'Closing Address & Group Photo',         speaker: 'Chief Ngwa Emmanuel',   description: 'Final words from the Fon, group photo, and announcement of the next forum date.',       sortOrder: 11 },
  ]

  // Clear existing agenda for this event then re-insert
  await prisma.eventAgenda.deleteMany({ where: { eventId: event.id } })
  for (const item of agendaItems) {
    await prisma.eventAgenda.create({ data: { ...item, eventId: event.id } })
  }

  console.log('Event seeded:', event.title)
  console.log('Agenda items:', agendaItems.length)

  /* ══════════════════════════════════════════════════════════════
     NEWS — Complete story: School Renovation Completed
  ══════════════════════════════════════════════════════════════ */
  const news = await prisma.news.upsert({
    where:  { slug: 'school-renovation-complete-2025' },
    update: {},
    create: {
      slug:       'school-renovation-complete-2025',
      title:      'A New Beginning: Nkenkak-Ngiesang Primary School Renovation Complete',
      excerpt:    'After 14 months of construction, fundraising, and community effort, the renovated Primary School opened its doors this week — giving 320 children new classrooms, clean toilets, a library, and a computer room for the first time in the school\'s history.',
      category:   'Education',
      tags:       ['education', 'school', 'renovation', 'success', 'community', 'children', 'diaspora'],
      status:     'published',
      isFeatured: true,
      authorId:   admin.id,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      coverImage: 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778262556/WhatsApp_Image_2026-04-30_at_20.57.13_yl6xj3.jpg',
      content: `<p>On a bright Tuesday morning in Nkenkak-Ngiesang, something happened that had not happened in over two decades: children walked into a school building that was truly ready to receive them.</p>

<p>The Nkenkak-Ngiesang Primary School — the village's oldest and largest learning institution, serving 320 pupils from nursery through Standard Six — reopened this week after a comprehensive 14-month renovation funded entirely by the community: villagers at home, diaspora members abroad, and development council partners.</p>

<h2>What Was Built</h2>

<p>The renovation transformed every corner of the school. Eight classrooms now have reinforced concrete roofs, fresh paint, new wooden furniture, and large windows that let in natural light. A dedicated library room — stocked with 400 books donated by community members in France, Germany, and the UK — sits at the heart of the building. Most significantly, a 10-computer room with a solar-powered internet connection gives children in this remote village access to digital learning for the first time.</p>

<p>Two new toilet blocks — separate for boys and girls — replace the crumbling structures that had been out of use for three years. A rainwater harvesting tank behind the main building ensures clean water for washing throughout the school year.</p>

<blockquote>"I used to sit on a broken bench and watch the rain come through the roof. Today I sat at a real desk with a real chair and opened a real book in our new library. I don't have the words." — Ngwa Blanche, Standard Five pupil</blockquote>

<h2>The Numbers Behind the Dream</h2>

<p>The project raised <strong>5,200,000 XAF</strong> — exceeding its original 5,000,000 XAF target — from 214 individual donors across 11 countries. The largest single donation came from a diaspora family in Paris who contributed 800,000 XAF in memory of a grandfather who attended the school as a child in 1962. Forty-one community members contributed labour — clearing rubble, mixing cement, painting walls — saving an estimated 600,000 XAF in contractor costs.</p>

<p>Every franc is accounted for in the Transparency Report now published on the platform. Receipts for all materials, contractor invoices, and labour payments are available for any community member to download and review.</p>

<h2>A Day the Village Will Not Forget</h2>

<p>The reopening ceremony drew over 400 people to the school grounds — parents, elders, children, teachers, and council members — as well as dozens joining via live stream from France, Germany, the United States, and the United Kingdom. The Village Fon, Chief Ngwa Emmanuel, cut a ribbon made from strips of traditional fabric and declared the building open. Teachers wept. Children ran into their new classrooms. Grandmothers ululated.</p>

<blockquote>"This school educated my father. It educated me. Today it will educate my children — and it will do so properly, for the first time in a generation. This is what it means to be Nkenkak-Ngiesang." — Marie Nkemdirim, parent and village elder</blockquote>

<h2>What Comes Next</h2>

<p>The development council has committed to three follow-up priorities for the school in 2026: a school feeding programme, a second computer room, and a teacher training fund to ensure the digital infrastructure is actually used. A monitoring committee of six parents — elected at the reopening ceremony — will meet monthly and publish public updates on the school's condition and performance.</p>

<p>Donations for the second phase are already open on the platform. The council also announced that a sister project — the Nkenkak-Ngiesang Digital Skills Centre — has entered its active fundraising phase, targeting young people aged 15–30 who will build on the foundation laid in the school's new computer room.</p>

<h2>Thank You</h2>

<p>The development council extends its deepest gratitude to every person who donated, shared, volunteered, or simply believed this was possible. You did not just renovate a building. You told 320 children that their education matters, that their village cares, and that home — wherever they may one day go — is a place that invested in them.</p>

<p>The full project report, photo gallery, and financial breakdown are available on the Projects page. A short documentary about the renovation, produced by the youth media team, will be published on the gallery within the week.</p>`,
    },
  })

  console.log('News seeded:', news.title)
  console.log('Done.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
