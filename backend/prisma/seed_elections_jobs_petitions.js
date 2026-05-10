const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding elections, jobs & petitions...')

  // Get admin user
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (!admin) throw new Error('No admin user found. Run seed.js first.')

  // ── ELECTIONS ──────────────────────────────────────────────────

  const electionsData = [
    {
      title: 'Village Development Council Elections 2025',
      description: 'Annual election for the five-seat Village Development Council. All registered members are eligible to vote. The council oversees project planning, budget allocation and community welfare.',
      type: 'leadership',
      status: 'voting',
      eligibility: 'all',
      maxWinners: 5,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      isPublished: true,
      candidates: [
        { name: 'Dr. Carine Wabo', bio: 'Medical doctor with 12 years of community health service. Former Health Coordinator of the village clinic. Advocates for expanded healthcare access and maternal health programmes.', manifesto: 'My platform focuses on three pillars: a fully-staffed health clinic, clean water for every household, and a digital skills programme for our youth. Together we can build a stronger Nkenkak.' },
        { name: 'Kevin Mbakop', bio: 'Youth entrepreneur and digital skills trainer. Founder of the Nkenkak Youth Tech Hub. Passionate about economic empowerment and modern governance.', manifesto: 'Our village must embrace the digital age. I will champion a fibre optic connection for the community hall, job training for young people, and transparent online financial reporting.' },
        { name: 'Prof. Marie Tagne', bio: 'Education specialist with 20 years in public schools. Retired headmistress of GHS Bafoussam. Drove the Primary School Renovation project from start to finish.', manifesto: 'Education is the foundation of all progress. I will expand the scholarship programme, build a new library, and establish after-school tutoring for every child in the village.' },
        { name: 'Emmanuel Tchwenko', bio: 'Agronomist and owner of Nkenkak Agro-Supplies. 15 years supporting village farmers with modern techniques, improved seeds and cooperative marketing.', manifesto: 'Agriculture is our heritage and our future. I will establish a village cooperative, secure markets for our produce, and introduce modern irrigation to double farm yields.' },
        { name: 'Jeanne Fomukong', bio: 'Retired civil servant and women\'s rights advocate. Founder of the Nkenkak Women\'s Savings Circle. Has mobilised over 2 million XAF in micro-loans for village women.', manifesto: 'When women thrive, the whole village thrives. I will expand the women\'s savings circle, build a childcare centre, and ensure women hold 40% of all leadership positions.' },
        { name: 'Alain Kuete', bio: 'Civil engineer and solar energy entrepreneur. Installed solar panels for 60 village households. Advises on infrastructure planning for the West Region council.', manifesto: 'Reliable electricity and modern roads unlock all other development. I will complete the village solar microgrid, repair the access road, and build a community borehole in every quarter.' },
      ],
    },
    {
      title: 'Youth Wing Leadership Election 2025',
      description: 'Election for the Youth Wing chairperson and two deputies. Open to all verified members aged 18–35. The Youth Wing coordinates sports, culture, and entrepreneurship activities.',
      type: 'committee',
      status: 'nominations',
      eligibility: 'verified',
      maxWinners: 3,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      isPublished: true,
      candidates: [
        { name: 'Steeve Mbakop', bio: 'BSc Civil Engineering graduate and youth mentor. Coaches the village football team and runs weekend coding workshops for teenagers.', manifesto: 'I will organise quarterly youth summits, launch a village startup fund, and build a proper sports field for our young athletes.' },
        { name: 'Aurelie Nkengfack', bio: 'University of Dschang law student and debate champion. Passionate about civic education and youth rights.', manifesto: 'Youth voices matter. I will create a youth parliament that feeds ideas directly to the development council, and establish a legal aid desk for young people.' },
        { name: 'Rostand Fokou', bio: 'GCE A-Level top student now studying at ENS Yaoundé. Active in cultural preservation — has documented over 40 traditional songs and dances.', manifesto: 'We must preserve our culture while embracing the future. I will launch a digital archive of Nkenkak traditions and host an annual cultural festival for young people.' },
      ],
    },
    {
      title: 'Women\'s Empowerment Committee Election 2024',
      description: 'Election for the three-seat Women\'s Empowerment Committee. The committee manages the micro-loan fund, organises skills training, and advocates for women\'s welfare.',
      type: 'committee',
      status: 'closed',
      eligibility: 'approved',
      maxWinners: 3,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      isPublished: true,
      candidates: [
        { name: 'Mama Rose Ngwa', bio: 'Herbalist and entrepreneur. Founded Ngwa Natural Care and employs six village women. Has mentored over 30 women in small business management.', manifesto: 'Economic independence for every woman. I will expand the micro-loan fund, create a women\'s market stall, and partner with NGOs for skills training.' },
        { name: 'Sandra Mbianda', bio: 'Catering business owner based in Houston. Returns annually to the village and funds bursaries for girls. Strong diaspora network builder.', manifesto: 'Connecting diaspora women to support village sisters. I will establish a diaspora remittance pool for girls\' education and monthly virtual mentoring sessions.' },
        { name: 'Christelle Mbakop', bio: 'Fashion designer in Paris. Runs a successful Ankara brand and teaches sewing to young Cameroonian women in France.', manifesto: 'Fashion and crafts as economic tools. I will launch a village sewing cooperative, export traditional textiles internationally, and fund training in fashion design.' },
      ],
    },
    {
      title: 'Diaspora Representative Election 2025',
      description: 'Election for two diaspora representatives to the development council. Candidates and voters must be diaspora members with verified accounts.',
      type: 'general',
      status: 'draft',
      eligibility: 'verified',
      maxWinners: 2,
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
      isPublished: true,
      candidates: [
        { name: 'Jules Fomukong', bio: 'London-based financial services entrepreneur. Runs Diaspora Money Transfer Services and has channelled over 5 million XAF to village projects since 2018.', manifesto: 'I will establish a diaspora investment fund, organise annual village visits, and create a skills transfer programme bringing diaspora expertise home.' },
        { name: 'Armand Kamdem', bio: 'Professor at University of Douala, visiting scholar in Strasbourg. Specialises in development economics and has written policy papers on rural development.', manifesto: 'Evidence-based development. I will apply for EU and UN development grants, publish our village development model as a case study, and bring academic volunteers to teach.' },
      ],
    },
  ]

  let electionCount = 0
  for (const ed of electionsData) {
    const { candidates, ...electionFields } = ed
    const exists = await prisma.election.findFirst({ where: { title: electionFields.title } })
    if (!exists) {
      const election = await prisma.election.create({ data: electionFields })
      for (const c of candidates) {
        await prisma.candidate.create({ data: { ...c, electionId: election.id } })
      }
      electionCount++
    }
  }
  console.log(`✅ Elections seeded (${electionCount} new)`)

  // ── PETITIONS ──────────────────────────────────────────────────

  const petitionsData = [
    {
      title: 'Build a Public Library in Nkenkak-Ngiesang',
      description: 'We, the people of Nkenkak-Ngiesang, call on the Village Development Council to allocate land and budget for the construction of a public library. Access to books, reference materials and a quiet study environment will transform educational outcomes for our children and youth. Many students currently travel to Bafoussam just to access books. A community library would change that.',
      goal: 500,
      category: 'education',
      authorId: admin.id,
      isPublished: true,
      isClosed: false,
      signatures: [
        { name: 'Emmanuel Tchwenko', email: 'e.tchwenko@nkenkak.cm', comment: 'Our children deserve better access to knowledge. I fully support this.' },
        { name: 'Dr. Carine Wabo', email: 'c.wabo@nkenkak.cm', comment: 'A library is as essential as a clinic. Education is preventive medicine.' },
        { name: 'Kevin Mbakop', email: 'k.mbakop@nkenkak.cm', comment: 'A digital reading room would be even better — let\'s include computers and wifi!' },
        { name: 'Prof. Marie Tagne', email: 'm.tagne@nkenkak.cm', comment: 'I will personally donate 200 books if this library is built. Let\'s make it happen.' },
        { name: 'Mama Rose Ngwa', email: 'rose.ngwa@nkenkak.cm', comment: 'My grandchildren walk 8km to borrow books. A village library would be life-changing.' },
        { name: 'Jules Fomukong', email: 'jules.f@diaspora.cm', comment: 'Signing from London. Happy to contribute to the construction fund from abroad.' },
      ],
    },
    {
      title: 'Repair the Nkenkak-Ngiesang Access Road',
      description: 'The 12km access road connecting Nkenkak-Ngiesang to the Bafoussam highway is in a critical state of disrepair. Potholes, erosion and collapsed sections have made it near-impassable during the rainy season, cutting the village off from markets, hospitals and schools. We demand urgent intervention from the regional council and village development fund.',
      goal: 1000,
      category: 'infrastructure',
      authorId: admin.id,
      isPublished: true,
      isClosed: false,
      signatures: [
        { name: 'Alain Kuete', email: 'alain.kuete@nkenkak.cm', comment: 'Two of my delivery vehicles have been damaged on this road in the past year alone.' },
        { name: 'Patrick Tagne', email: 'p.tagne@nkenkak.cm', comment: 'As a contractor, I can confirm the road needs immediate attention before the next rains.' },
        { name: 'Jeanne Fomukong', email: 'jeanne.f@nkenkak.cm', comment: 'A pregnant woman in our quarter nearly lost her baby because the ambulance couldn\'t reach her. Enough is enough.' },
        { name: 'Rostand Fokou', email: 'r.fokou@nkenkak.cm', comment: 'Students miss school every rainy season because of this road. Our futures depend on it.' },
        { name: 'Sandra Mbianda', email: 's.mbianda@nkenkak.cm', comment: 'Every time I visit from Houston I have to rent a 4x4 just to reach the village. Fix the road!' },
        { name: 'Steeve Mbakop', email: 's.mbakop@nkenkak.cm', comment: 'The village cannot develop without proper road access. This is a basic right.' },
        { name: 'Aurelie Nkengfack', email: 'a.nkengfack@nkenkak.cm', comment: 'I support this petition. The legal obligation to provide passable roads lies with the regional council.' },
        { name: 'Celestine Fokou', email: 'c.fokou@nkenkak.cm', comment: 'My craft goods get damaged every time I transport them on that road. Signing with both hands.' },
      ],
    },
    {
      title: 'Install Solar Street Lights in All Village Quarters',
      description: 'Nkenkak-Ngiesang\'s village quarters lack adequate street lighting, making movement at night dangerous and discouraging economic activity after dark. We call on the Village Development Council to install solar-powered street lights on all main paths and market areas. Solar technology makes this affordable and sustainable without relying on the unreliable national grid.',
      goal: 300,
      category: 'infrastructure',
      authorId: admin.id,
      isPublished: true,
      isClosed: false,
      signatures: [
        { name: 'Alain Kuete', email: 'alain.kuete2@nkenkak.cm', comment: 'I can supply and install the solar systems at cost price if the council approves the budget.' },
        { name: 'Mama Rose Ngwa', email: 'rose.ngwa2@nkenkak.cm', comment: 'Night markets could employ dozens of women — but only if we have lights.' },
        { name: 'Kevin Mbakop', email: 'k.mbakop2@nkenkak.cm', comment: 'Solar street lights will also boost security and encourage young people to study in the evenings.' },
        { name: 'Jeanne Fomukong', email: 'jeanne.f2@nkenkak.cm', comment: 'Three women were attacked on the dark main path last year. Lighting saves lives.' },
      ],
    },
    {
      title: 'Establish a Village Health Insurance Scheme',
      description: 'Medical costs are the number one cause of poverty in our community. We petition the Village Development Council and diaspora associations to establish a community health insurance scheme where every household contributes a small monthly amount in exchange for coverage of emergency and primary healthcare at the village clinic and partner hospitals. Similar schemes have worked in other Cameroonian villages.',
      goal: 750,
      category: 'health',
      authorId: admin.id,
      isPublished: true,
      isClosed: false,
      signatures: [
        { name: 'Dr. Carine Wabo', email: 'c.wabo2@nkenkak.cm', comment: 'As a doctor, I see families choose between food and medicine daily. A community insurance scheme is the answer.' },
        { name: 'Prof. Marie Tagne', email: 'm.tagne2@nkenkak.cm', comment: 'Health security enables education. You cannot learn if you are sick and in debt.' },
        { name: 'Emmanuel Tchwenko', email: 'e.tchwenko2@nkenkak.cm', comment: 'I would contribute to such a scheme monthly and encourage all my employees to join.' },
        { name: 'Jules Fomukong', email: 'jules.f2@diaspora.cm', comment: 'The diaspora can co-fund this. We already send money home for medical bills — let\'s organise it.' },
        { name: 'Armand Kamdem', email: 'a.kamdem@nkenkak.cm', comment: 'I have studied community health financing models in West Africa. Happy to draft the scheme proposal.' },
      ],
    },
    {
      title: 'Protect the Nkenkak Sacred Forest from Logging',
      description: 'The Nkenkak Sacred Forest — a 200-hectare ancestral woodland that has stood for over 400 years — is under threat from illegal logging and encroachment. This forest is not only a cultural treasure but a critical water catchment area feeding village streams and farms. We demand immediate legal protection, regular ranger patrols, and designation as a protected heritage site.',
      goal: 400,
      category: 'environment',
      authorId: admin.id,
      isPublished: true,
      isClosed: false,
      signatures: [
        { name: 'Celestine Fokou', email: 'c.fokou2@nkenkak.cm', comment: 'My grandfather told me stories of the forest spirits. We cannot let them be silenced by chainsaws.' },
        { name: 'Rostand Fokou', email: 'r.fokou2@nkenkak.cm', comment: 'I have already documented 12 traditional songs that reference the sacred forest. We must protect it for future generations.' },
        { name: 'Prof. Marie Tagne', email: 'm.tagne3@nkenkak.cm', comment: 'This forest is a living classroom. Our school uses it for environmental education every term.' },
        { name: 'Alain Kuete', email: 'alain.kuete3@nkenkak.cm', comment: 'The streams fed by this forest provide water to 6 village quarters. Destroy the forest, lose the water.' },
        { name: 'Kevin Mbakop', email: 'k.mbakop3@nkenkak.cm', comment: 'Drone mapping of the forest boundary would help enforce protection. I can organise this.' },
        { name: 'Dr. Carine Wabo', email: 'c.wabo3@nkenkak.cm', comment: 'Several medicinal plants used in the village clinic grow only in this forest. Protecting it is protecting our health.' },
      ],
    },
    {
      title: 'Close the Illegal Quarry Near the Primary School',
      description: 'An illegal quarry has been operating 300 metres from Nkenkak-Ngiesang Primary School for over 18 months. Daily blasting shakes classroom walls, cracks have appeared in three buildings, and fine dust has caused a 40% rise in respiratory illness among children. Despite multiple complaints, the regional authorities have taken no action. We demand immediate closure and legal accountability.',
      goal: 200,
      category: 'community',
      authorId: admin.id,
      isPublished: true,
      isClosed: true,
      expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      signatures: [
        { name: 'Prof. Marie Tagne', email: 'm.tagne4@nkenkak.cm', comment: 'I submitted the complaint to the regional delegation three times. No response. Now we escalate.' },
        { name: 'Dr. Carine Wabo', email: 'c.wabo4@nkenkak.cm', comment: 'I have treated 47 children for respiratory problems linked to quarry dust in the past six months. Signed.' },
        { name: 'Mama Rose Ngwa', email: 'rose.ngwa3@nkenkak.cm', comment: 'The walls of my house near the school also have cracks. This is a safety emergency.' },
        { name: 'Aurelie Nkengfack', email: 'a.nkengfack2@nkenkak.cm', comment: 'Operating a quarry near a school without environmental clearance is illegal. We have grounds for court action.' },
        { name: 'Patrick Tagne', email: 'p.tagne2@nkenkak.cm', comment: 'I inspected the school buildings. Two classrooms need immediate structural repairs. This cannot wait.' },
      ],
    },
  ]

  let petitionCount = 0
  for (const pd of petitionsData) {
    const { signatures, ...petitionFields } = pd
    const exists = await prisma.petition.findFirst({ where: { title: petitionFields.title } })
    if (!exists) {
      const petition = await prisma.petition.create({ data: petitionFields })
      for (const sig of signatures) {
        const sigExists = await prisma.petitionSignature.findFirst({
          where: { petitionId: petition.id, email: sig.email }
        })
        if (!sigExists) {
          await prisma.petitionSignature.create({
            data: { ...sig, petitionId: petition.id }
          })
        }
      }
      petitionCount++
    }
  }
  console.log(`✅ Petitions seeded (${petitionCount} new)`)

  // ── JOBS BOARD ─────────────────────────────────────────────────

  const jobsData = [
    {
      type: 'job',
      title: 'Primary School Teacher (Mathematics & Sciences)',
      description: 'Nkenkak-Ngiesang Primary School is seeking a qualified teacher for Mathematics and Sciences for classes CM1–CM2. The successful candidate will deliver lessons in French, support the school\'s STEM initiative, and participate in after-school tutoring. Accommodation available on-site. Salary supported by the community education fund.',
      category: 'education',
      location: 'Nkenkak-Ngiesang Village',
      country: 'Cameroon',
      salary: '85,000 – 110,000 XAF/month (+ accommodation)',
      contactName: 'Prof. Marie Tagne',
      contactEmail: 'education@nkenkak-ngiesang.cm',
      contactPhone: '+237 677 001 002',
      isApproved: true,
      isFeatured: true,
      authorId: admin.id,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'job',
      title: 'Community Health Worker – Village Clinic',
      description: 'The Nkenkak-Ngiesang Health Clinic is recruiting a community health worker to support vaccination campaigns, maternal health visits, and health education sessions in village quarters. Candidates must hold at least a nursing aide certificate. Fluency in Medumba is a strong advantage.',
      category: 'health',
      location: 'Nkenkak-Ngiesang',
      country: 'Cameroon',
      salary: '75,000 XAF/month',
      contactName: 'Dr. Carine Wabo',
      contactEmail: 'clinic@nkenkak-ngiesang.cm',
      contactPhone: '+237 655 003 004',
      isApproved: true,
      isFeatured: true,
      authorId: admin.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'job',
      title: 'Construction Site Foreman – Water Pipeline Project',
      description: 'Tagne Construction & Build is hiring an experienced construction foreman to supervise the final phase of the village water pipeline installation. Responsibilities include coordinating a team of 15 labourers, daily progress reporting, and quality control. Must have 5+ years\' experience in civil works.',
      category: 'construction',
      location: 'Nkenkak-Ngiesang',
      country: 'Cameroon',
      salary: 'Negotiable (project-based)',
      contactName: 'Patrick Tagne',
      contactEmail: 'p.tagne@tagnecontruction.cm',
      contactPhone: '+237 699 445 566',
      isApproved: true,
      isFeatured: false,
      authorId: admin.id,
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'job',
      title: 'Agricultural Extension Officer',
      description: 'Nkenkak Agro-Supplies is looking for an agricultural extension officer to work with village farmers on modern cultivation techniques, soil health, and cooperative marketing. Degree in agronomy or related field required. Must own a motorbike or be willing to use a company-provided one.',
      category: 'agriculture',
      location: 'Nkenkak-Ngiesang and surrounding farms',
      country: 'Cameroon',
      salary: '95,000 XAF/month + fuel allowance',
      contactName: 'Emmanuel Tchwenko',
      contactEmail: 'agro@nkenkak-ngiesang.cm',
      contactPhone: '+237 677 112 233',
      isApproved: true,
      isFeatured: false,
      authorId: admin.id,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'job',
      title: 'IT & Digital Skills Trainer (Part-time)',
      description: 'The Nkenkak Youth Tech Hub is seeking a part-time IT trainer to deliver digital literacy classes (Microsoft Office, internet basics, coding intro) on Saturdays. Suitable for a university student or recent graduate. Equipment provided. This is a volunteer/stipend role with certificate of service issued.',
      category: 'tech',
      location: 'Community Hall, Nkenkak-Ngiesang',
      country: 'Cameroon',
      salary: '25,000 XAF/month stipend',
      contactName: 'Kevin Mbakop',
      contactEmail: 'youth@nkenkak-ngiesang.cm',
      isApproved: true,
      isFeatured: true,
      authorId: admin.id,
      expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'service',
      title: 'Solar Panel Installation & Maintenance',
      description: 'Kuete Solar Energy Solutions offers solar panel installation for households, schools and small businesses throughout the West Region. Free site assessment. Systems from 300W to 5kW. 2-year maintenance warranty included. Government subsidy paperwork assistance available.',
      category: 'services',
      location: 'West Region, Cameroon (mobile service)',
      country: 'Cameroon',
      salary: 'From 180,000 XAF (300W system, installed)',
      contactName: 'Alain Kuete',
      contactEmail: 'info@kuetesolar.cm',
      contactPhone: '+237 690 112 230',
      isApproved: true,
      isFeatured: true,
      authorId: admin.id,
    },
    {
      type: 'service',
      title: 'Traditional Bamileke Catering for Events',
      description: 'Authentic Bamileke cuisine for weddings, funerals, naming ceremonies, and community events. Specialties include ndolé, achu & yellow soup, grilled fish, kati kati, and bush plum. We serve groups of 50 to 1,000. Set-up, service staff and clean-up included. Book at least 3 weeks in advance.',
      category: 'food',
      location: 'Nkenkak-Ngiesang and surrounding areas',
      country: 'Cameroon',
      salary: 'From 2,500 XAF per person (minimum 50 guests)',
      contactName: 'Mama Rose Ngwa',
      contactEmail: 'rose.ngwa@nkenkak.cm',
      contactPhone: '+237 655 778 899',
      isApproved: true,
      isFeatured: false,
      authorId: admin.id,
    },
    {
      type: 'item_sale',
      title: 'Handcrafted Bamileke Masks & Wooden Sculptures',
      description: 'Authentic hand-carved Bamileke ceremonial masks, ancestor figures, and decorative sculptures. Made from local hardwood by master craftsmen in Nkenkak-Ngiesang. Perfect for collectors, cultural institutions, and home decor. International shipping available via DHL. Each piece signed and comes with a certificate of authenticity.',
      category: 'crafts',
      location: 'Nkenkak-Ngiesang',
      country: 'Cameroon',
      salary: 'From 15,000 XAF (small) to 200,000 XAF (large ceremonial)',
      contactName: 'Celestine Fokou',
      contactEmail: 'c.fokou@bamilekedcraft.cm',
      contactPhone: '+237 670 334 455',
      isApproved: true,
      isFeatured: true,
      authorId: admin.id,
    },
    {
      type: 'job',
      title: 'Accountant / Bookkeeper – Community Development Council',
      description: 'The Nkenkak-Ngiesang Development Council is hiring a part-time accountant to manage financial records, prepare quarterly reports, process disbursements and liaise with auditors. Must have at least HND Accounting. Proficiency in Excel required; accounting software experience a plus. 2–3 days per week.',
      category: 'services',
      location: 'Council Office, Nkenkak-Ngiesang',
      country: 'Cameroon',
      salary: '60,000 XAF/month (part-time)',
      contactName: 'Admin Nkenkak',
      contactEmail: 'admin@nkenkak-ngiesang.cm',
      isApproved: true,
      isFeatured: false,
      authorId: admin.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'item_wanted',
      title: 'Wanted: Second-hand School Desks & Chairs',
      description: 'Nkenkak-Ngiesang Primary School is looking to acquire 80 second-hand school desks and chairs in good condition for the new classrooms being built as part of the renovation project. If your school, business or institution has surplus furniture, please contact us. We can arrange collection and will provide a donation receipt.',
      category: 'education',
      location: 'Nkenkak-Ngiesang',
      country: 'Cameroon',
      salary: 'Budget: up to 5,000 XAF per desk-and-chair set',
      contactName: 'Prof. Marie Tagne',
      contactEmail: 'education@nkenkak-ngiesang.cm',
      contactPhone: '+237 677 001 002',
      isApproved: true,
      isFeatured: false,
      authorId: admin.id,
    },
    {
      type: 'job',
      title: 'Diaspora Engagement Coordinator (Remote)',
      description: 'The Nkenkak-Ngiesang Development Council seeks a diaspora engagement coordinator to manage communications with overseas members, coordinate fundraising campaigns, and organise virtual events. Must have strong English and French. Experience with social media, Mailchimp and Zoom required. Fully remote, flexible hours.',
      category: 'services',
      location: 'Remote (anywhere)',
      country: 'International',
      salary: '$300–$500 USD/month (part-time, depending on experience)',
      contactName: 'Admin Nkenkak',
      contactEmail: 'diaspora@nkenkak-ngiesang.cm',
      isApproved: true,
      isFeatured: true,
      authorId: admin.id,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'service',
      title: 'Money Transfer to Cameroon – Competitive Rates',
      description: 'Diaspora Money Transfer Services offers fast, secure transfers from the UK, France, Germany, USA and Canada directly to MTN MoMo and Orange Money in Cameroon. Typical delivery in under 2 hours. Rates reviewed weekly. No hidden fees. Serving the Nkenkak diaspora community since 2016.',
      category: 'services',
      location: 'London, United Kingdom (serves all of Cameroon)',
      country: 'United Kingdom',
      salary: 'From £5 transfer fee. Best rates on amounts over £100.',
      contactName: 'Jules Fomukong',
      contactEmail: 'transfers@nkenkakdiaspora.co.uk',
      contactPhone: '+44 7700 900123',
      isApproved: true,
      isFeatured: false,
      authorId: admin.id,
    },
  ]

  let jobCount = 0
  for (const j of jobsData) {
    const exists = await prisma.jobPost.findFirst({ where: { title: j.title } })
    if (!exists) { await prisma.jobPost.create({ data: j }); jobCount++ }
  }
  console.log(`✅ Job posts seeded (${jobCount} new)`)

  console.log('\n🎉 Elections, jobs & petitions seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
