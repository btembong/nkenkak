const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const hash = await bcrypt.hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@nkenkak-ngiesang.cm' },
    update: {},
    create: { email:'admin@nkenkak-ngiesang.cm', passwordHash:hash, role:'admin', status:'active',
              firstName:'Admin', lastName:'Nkenkak', country:'Cameroon', isDiaspora:false, emailVerified:true },
  })
  console.log('✅ Admin user:', admin.email)

  // Forum categories
  const cats = [
    { name:'General Discussion', slug:'general',       icon:'fas fa-comments',     sortOrder:1 },
    { name:'Projects',           slug:'projects',      icon:'fas fa-seedling',      sortOrder:2 },
    { name:'Culture & Heritage', slug:'culture',       icon:'fas fa-masks-theater', sortOrder:3 },
    { name:'Youth Corner',       slug:'youth',         icon:'fas fa-rocket',        sortOrder:4 },
    { name:'Health & Wellness',  slug:'health',        icon:'fas fa-heartbeat',     sortOrder:5 },
    { name:'Diaspora Network',   slug:'diaspora',      icon:'fas fa-globe-africa',  sortOrder:6 },
    { name:'Jobs & Opportunities',slug:'jobs',         icon:'fas fa-briefcase',     sortOrder:7 },
    { name:'Announcements',      slug:'announcements', icon:'fas fa-bullhorn',      sortOrder:8 },
  ]
  for (const c of cats) {
    await prisma.forumCategory.upsert({ where:{ slug:c.slug }, update:{}, create:c })
  }
  console.log('✅ Forum categories seeded')

  // Sample projects
  const projects = [
    { slug:'primary-school-renovation', title:'Primary School Renovation', summary:'Renovate the village primary school buildings and classrooms.',
      description:'The Nkenkak-Ngiesang Primary School needs urgent renovation. Leaking roofs, broken windows and outdated furniture affect over 300 children. Your donation will provide safe, inspiring learning spaces for the next generation.',
      category:'education', status:'active', goalAmount:5000000, raisedAmount:3600000, isFeatured:true, isUrgent:true,
      beneficiaries:320, location:'Village Square, Nkenkak-Ngiesang', createdBy:admin.id },
    { slug:'clean-water-pipeline', title:'Clean Water Pipeline Project', summary:'Bring clean piped water to all village households.',
      description:'Over 400 families currently walk up to 5km daily for clean water. This pipeline project will change that permanently by connecting households directly to a clean mountain water source.',
      category:'infrastructure', status:'active', goalAmount:12000000, raisedAmount:7200000, isFeatured:true,
      beneficiaries:400, location:'Nkenkak-Ngiesang', createdBy:admin.id },
    { slug:'digital-skills-centre', title:'Digital Skills Centre', summary:'Build a computer lab and digital training centre for youth.',
      description:'A digital skills centre will equip 200+ youth per year with computer literacy, coding, and online business skills — opening doors to economic opportunity.',
      category:'education', status:'upcoming', goalAmount:8000000, raisedAmount:1200000, isFeatured:true,
      beneficiaries:200, location:'Community Hall', createdBy:admin.id },
    { slug:'village-health-clinic', title:'Village Health Clinic Upgrade', summary:'Upgrade equipment and staff the village health clinic.',
      description:'The village clinic serves 4,000+ residents but lacks basic equipment. Donations will fund medical equipment, medications, and two additional nursing staff.',
      category:'health', status:'active', goalAmount:15000000, raisedAmount:4500000,
      beneficiaries:4200, location:'Health Quarter, Nkenkak-Ngiesang', createdBy:admin.id },
  ]
  for (const p of projects) {
    await prisma.project.upsert({ where:{ slug:p.slug }, update:{}, create:p })
  }
  console.log('✅ Sample projects seeded')

  // Sample news
  const newsList = [
    { slug:'water-project-update-2024', title:'Water Pipeline Reaches 60% Funding!', status:'published',
      excerpt:'Thanks to generous donors worldwide, the clean water pipeline project has reached 60% of its goal. Construction begins next month.',
      content:'<p>We are thrilled to announce that the Nkenkak-Ngiesang Clean Water Pipeline Project has reached 60% of its fundraising goal — that is 7.2 million XAF raised out of 12 million XAF needed.</p><p>Construction is scheduled to begin next month, with an expected completion by year end. Over 400 families will benefit.</p>',
      category:'Projects', isFeatured:true, publishedAt:new Date(), authorId:admin.id },
    { slug:'school-renovation-kicks-off', title:'School Renovation Work Kicks Off', status:'published',
      excerpt:'Contractors have begun renovation work at the Primary School, starting with roof repairs and new classroom windows.',
      content:'<p>After months of planning and fundraising, renovation work has officially begun at Nkenkak-Ngiesang Primary School. The first phase focuses on roof repairs and new windows for all 8 classrooms.</p>',
      category:'Education', isFeatured:false, publishedAt:new Date(Date.now()-7*24*60*60*1000), authorId:admin.id },
    { slug:'digital-centre-announcement', title:'Digital Skills Centre Announced for 2025', status:'published',
      excerpt:'The community board has approved the Digital Skills Centre project. Donations are now open.',
      content:'<p>The Nkenkak-Ngiesang community board has unanimously approved the construction of a Digital Skills Centre. The facility will house 30 computers and a high-speed internet connection.</p>',
      category:'Community', isFeatured:false, publishedAt:new Date(Date.now()-14*24*60*60*1000), authorId:admin.id },
  ]
  for (const n of newsList) {
    await prisma.news.upsert({ where:{ slug:n.slug }, update:{}, create:n })
  }
  console.log('✅ Sample news seeded')

  // Sample team
  const team = [
    { name:'Chief Ngwa Emmanuel', roleTitle:'Village Fon (Chief)', team:'leadership', sortOrder:1,
      bio:'Traditional ruler of Nkenkak-Ngiesang, guiding the community with wisdom and vision.' },
    { name:'Dr. Carine Wabo',    roleTitle:'Health Coordinator',   team:'health',    sortOrder:2,
      bio:'Medical doctor coordinating village health initiatives and clinic upgrades.' },
    { name:'Kevin Mbakop',       roleTitle:'Youth Wing Leader',     team:'youth',     sortOrder:3,
      bio:'Dynamic youth leader driving digital skills and entrepreneurship programs.' },
    { name:'Prof. Marie Tagne',  roleTitle:'Education Director',    team:'education', sortOrder:4,
      bio:'Education specialist overseeing school renovation and literacy programs.' },
  ]
  for (const m of team) {
    const exists = await prisma.teamMember.findFirst({ where:{ name:m.name } })
    if (!exists) await prisma.teamMember.create({ data:m })
  }
  console.log('✅ Sample team seeded')

  // Sample events
  const events = [
    { slug:'harvest-festival-2025', title:'Annual Harvest Festival', category:'culture',
      description:'A three-day celebration of the village harvest with traditional music, dancing, and food.',
      startDate:new Date(Date.now()+30*24*60*60*1000), venue:'Village Square', isFeatured:true, organizerId:admin.id },
    { slug:'diaspora-forum-2025', title:'Diaspora Community Forum', category:'community',
      description:'Annual forum connecting diaspora members with village leaders to discuss development projects.',
      startDate:new Date(Date.now()+60*24*60*60*1000), isOnline:true, meetingLink:'https://meet.google.com/nkenkak-2025', isFeatured:true, organizerId:admin.id },
  ]
  for (const e of events) {
    await prisma.event.upsert({ where:{ slug:e.slug }, update:{}, create:e })
  }
  console.log('✅ Sample events seeded')

  // ── Vocabulary words ──────────────────────────────────────────
  const vocab = [
    // GREETINGS
    { word:'Mbua', category:'greetings', translation:'Good morning / Hello',
      pronunciation:'M-bwah', example:'Mbua! — said when meeting someone in the morning.' },
    { word:'Ŋ̀gwə̀', category:'greetings', translation:'Good afternoon / Welcome',
      pronunciation:'Ngweh', example:'Ŋ̀gwə̀! — greeting someone in the afternoon.' },
    { word:'Yâ', category:'greetings', translation:'Yes / Indeed',
      pronunciation:'Yah (high tone)', example:'Yâ, məŋ ŋkə́ — Yes, I am here.' },
    { word:'Àā', category:'greetings', translation:'No / Not at all',
      pronunciation:'Ah-ah (falling tone)', example:'Àā, məŋ kə́ — No, I am not.' },
    { word:'Wèp', category:'greetings', translation:'Good / Fine / Well',
      pronunciation:'Wep (low tone)', example:'Wèp pɨ̀ — Everything is good.' },
    { word:'Məŋ ŋkwɨ́', category:'greetings', translation:'Thank you',
      pronunciation:'Mung nkwee', example:'Məŋ ŋkwɨ́ wɔ — Thank you very much.' },
    { word:'Pɨ̂ ŋkwɨ̀', category:'greetings', translation:'Please / Kindly',
      pronunciation:'Pee nkwee (falling)', example:'Pɨ̂ ŋkwɨ̀, wáŋ — Please come.' },
    { word:'Wáŋ', category:'greetings', translation:'Come / Come here',
      pronunciation:'Wang (rising tone)', example:'Wáŋ lá — Come here quickly.' },
    { word:'Fɨ̀ wɔ́', category:'greetings', translation:'How are you?',
      pronunciation:'Fee woh', example:'Fɨ̀ wɔ́? Məŋ wèp — How are you? I am fine.' },

    // NUMBERS
    { word:'Fù', category:'numbers', translation:'One (1)',
      pronunciation:'Foo (low tone)', example:'Fù nà — just one person.' },
    { word:'Pè', category:'numbers', translation:'Two (2)',
      pronunciation:'Pay (low tone)', example:'Pè nə̀ — two things.' },
    { word:'Tàŋ', category:'numbers', translation:'Three (3)',
      pronunciation:'Tang (low tone)', example:'Tàŋ njwì — three days.' },
    { word:'Nì', category:'numbers', translation:'Four (4)',
      pronunciation:'Nee (mid tone)', example:'Nì mbə̀ — four people.' },
    { word:'Tǒŋ', category:'numbers', translation:'Five (5)',
      pronunciation:'Tong (rising)', example:'Tǒŋ wûm — five years.' },
    { word:'Gwùt', category:'numbers', translation:'Six (6)',
      pronunciation:'Gwoot', example:'Gwùt njwì — six days.' },
    { word:'Sàm', category:'numbers', translation:'Seven (7)',
      pronunciation:'Sahm', example:'Sàm mbə̀ — seven people.' },
    { word:'Wôŋ', category:'numbers', translation:'Eight (8)',
      pronunciation:'Wong (falling)', example:'Wôŋ lə̀ — eight things.' },
    { word:'Jùɛ̀', category:'numbers', translation:'Nine (9)',
      pronunciation:'Jweh (low)', example:'Jùɛ̀ nə̀ — nine items.' },
    { word:'Gùm', category:'numbers', translation:'Ten (10)',
      pronunciation:'Goom', example:'Gùm nà — ten people.' },

    // FAMILY
    { word:'Tâ', category:'family', translation:'Father',
      pronunciation:'Tah (falling tone)', example:'Tâ wɔ́ — your father.' },
    { word:'Nâ', category:'family', translation:'Mother',
      pronunciation:'Nah (falling tone)', example:'Nâ wɔ́ — your mother.' },
    { word:'Mbàŋ', category:'family', translation:'Brother / Sister (sibling)',
      pronunciation:'M-bang', example:'Mbàŋ wɔ́ ŋkə́ lá — your sibling is here.' },
    { word:'Nkwə̀', category:'family', translation:'Child / Son / Daughter',
      pronunciation:'Nkweh (low)', example:'Nkwə̀ wɔ́ wèp — your child is well.' },
    { word:'Tàtə̀', category:'family', translation:'Grandfather / Elder man',
      pronunciation:'Tah-teh', example:'Tàtə̀ ŋkə́ tɨ̀ — grandfather is at home.' },
    { word:'Yìŋ', category:'family', translation:'Wife / Spouse (female)',
      pronunciation:'Ying', example:'Yìŋ wɔ́ — your wife.' },
    { word:'Wɔ̀', category:'family', translation:'Husband',
      pronunciation:'Woh (low)', example:'Wɔ̀ wɔ́ — your husband.' },
    { word:'Ndâ', category:'family', translation:'House / Home / Compound',
      pronunciation:'Ndah (falling)', example:'Ndâ wɔ́ — your home.' },
    { word:'Mfɔ̀', category:'family', translation:'Chief / King / Ruler',
      pronunciation:'M-foh', example:'Mfɔ̀ ŋkə́ tɨ̀ — the chief is home.' },

    // NATURE
    { word:'Njwì', category:'nature', translation:'Day / Sun',
      pronunciation:'Njwee', example:'Njwì wèp — a good day.' },
    { word:'Wùm', category:'nature', translation:'Year / Season',
      pronunciation:'Woom', example:'Wùm gùm — ten years.' },
    { word:'Mbwɨ̀', category:'nature', translation:'Rain / Water from sky',
      pronunciation:'M-bwee (low)', example:'Mbwɨ̀ ŋkwàŋ — the rain is coming.' },
    { word:'Ntsɨ̀', category:'nature', translation:'Water / River',
      pronunciation:'Nt-see', example:'Ntsɨ̀ wèp — clean water.' },
    { word:'Ntùŋ', category:'nature', translation:'Tree / Forest',
      pronunciation:'Ntung', example:'Ntùŋ wɔ̂ — the great forest.' },
    { word:'Yùŋ', category:'nature', translation:'Mountain / Hill',
      pronunciation:'Yung', example:'Yùŋ pɨ̂ — the high mountain.' },
    { word:'Mbɔ̀ŋ', category:'nature', translation:'Farm / Field',
      pronunciation:'M-bong', example:'Mbɔ̀ŋ tâ — father\'s farm.' },
    { word:'Njì', category:'nature', translation:'Fire / Hearth',
      pronunciation:'Njee', example:'Njì ŋkwàŋ — the fire is burning.' },
    { word:'Ŋgùm', category:'nature', translation:'Earth / Soil / Land',
      pronunciation:'Ngoom', example:'Ŋgùm wɔ̂ — our land.' },

    // CUSTOMS
    { word:'Mbìə̀', category:'customs', translation:'Dance / Celebration dance',
      pronunciation:'M-bee-eh', example:'Mbìə̀ wèp — a beautiful dance.' },
    { word:'Nkàŋ', category:'customs', translation:'Funeral rites / Cry-die',
      pronunciation:'Nkang', example:'Nkàŋ tàtə̀ — the elder\'s funeral.' },
    { word:'Lùndùm', category:'customs', translation:'Dowry / Bride price',
      pronunciation:'Loon-doom', example:'Lùndùm yìŋ — the bride price.' },
    { word:'Jùɛ̀pfɔ̀', category:'customs', translation:'Traditional gathering / Assembly',
      pronunciation:'Jweh-foh', example:'Jùɛ̀pfɔ̀ mfɔ̀ — the chief\'s assembly.' },
    { word:'Ntsòŋ', category:'customs', translation:'Masquerade / Ancestral spirit',
      pronunciation:'Nt-song', example:'Ntsòŋ ŋkwàŋ — the masquerade is coming.' },
    { word:'Pɨ̀gùm', category:'customs', translation:'Sacrifice / Offering',
      pronunciation:'Pee-goom', example:'Pɨ̀gùm ndâ — offering at the home shrine.' },
    { word:'Wàŋ', category:'customs', translation:'Greeting bow / Show of respect',
      pronunciation:'Wang (low)', example:'Wàŋ mfɔ̀ — bow before the chief.' },
    { word:'Nkwâ', category:'customs', translation:'Kola nut (used in ceremonies)',
      pronunciation:'Nkwah (falling)', example:'Nkwâ ntsɨ̀ — kola and water (offering).' },

    // PROVERBS
    { word:'Nkwə̀ mfɔ̀ à lɛ̂ ndâ', category:'proverbs',
      translation:'The chief\'s child does not lack a home',
      pronunciation:'Nkweh mfoh ah leh ndah',
      example:'Said to reassure someone of their belonging and status in the community.' },
    { word:'Ntùŋ pɨ̂ à pɔ́ tɨ̀ mbɔ̀ŋ', category:'proverbs',
      translation:'The tall tree began as a seed in the farm',
      pronunciation:'Ntung pee ah poh tee m-bong',
      example:'Meaning: every great thing starts small. Encourages patience and nurturing.' },
    { word:'Nà à wèp à tùŋ nkwə̀', category:'proverbs',
      translation:'A good mother shapes the child',
      pronunciation:'Nah ah wep ah tung nkweh',
      example:'Emphasises the central role of mothers in raising virtuous children.' },
    { word:'Mbìə̀ fù à fɛ̀ɛ̀ pè', category:'proverbs',
      translation:'One dance foot needs the other',
      pronunciation:'M-bee-eh foo ah feh peh',
      example:'Unity and cooperation. One person alone cannot achieve what two can together.' },
    { word:'Ŋgùm wɔ̂ à wèp tɨ̀ mbɔ̀ŋ', category:'proverbs',
      translation:'Our soil is good — we must farm it',
      pronunciation:'Ngoom woh ah wep tee m-bong',
      example:'Encourages investment in one\'s homeland rather than seeking fortune elsewhere.' },
    { word:'Njwì gùm à fɔ̀ŋ njì', category:'proverbs',
      translation:'Ten suns cannot extinguish one fire (of truth)',
      pronunciation:'Njwee goom ah fong njee',
      example:'Truth and integrity prevail against all opposition.' },
    { word:'Mfɔ̀ à tɨ̀ nkàŋ mbə̀', category:'proverbs',
      translation:'A chief lives in the memory of his people',
      pronunciation:'Mfoh ah tee nkang mbeh',
      example:'Leadership is judged by what is left behind, not titles held.' },
  ]

  // ── Businesses (Directory) ────────────────────────────────────
  const businesses = [
    { name:'Nkenkak Agro-Supplies', category:'Agriculture', description:'Supplier of quality seeds, fertilisers and farm tools to village farmers. Serving the West Region since 2010.', ownerName:'Emmanuel Tchwenko', contact:'+237 677 112 233', location:'Nkenkak-Ngiesang Market, West Region', isDiaspora:false, isApproved:true, isFeatured:true },
    { name:'Wabo Digital Solutions', category:'Technology', description:'Web design, mobile app development and IT support services for businesses in Cameroon and the diaspora.', ownerName:'Dr. Carine Wabo', contact:'carine@wabodigital.cm', location:'Bafoussam, West Region / Remote', isDiaspora:false, isApproved:true, isFeatured:true },
    { name:'Tagne Construction & Build', category:'Construction', description:'Licensed construction company specialising in residential and community buildings across the West Region.', ownerName:'Patrick Tagne', contact:'+237 699 445 566', location:'Bafoussam, Cameroon', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Ngwa Herbal & Natural Care', category:'Health & Wellness', description:'Traditional Bamileke herbal remedies, natural skincare and wellness products. Ships to the diaspora worldwide.', ownerName:'Mama Rose Ngwa', contact:'+237 655 778 899', location:'Nkenkak-Ngiesang Village', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Paris Nkenkak Fashion', category:'Fashion & Clothing', description:'African print fashion brand inspired by Bamileke culture. Custom Ankara outfits for events, weddings and everyday wear. Ships internationally.', ownerName:'Christelle Mbakop', contact:'christelle@nkenkakfashion.fr', location:'Paris, France', isDiaspora:true, isApproved:true, isFeatured:true },
    { name:'Diaspora Money Transfer Services', category:'Financial Services', description:'Fast, affordable money transfer from Europe and North America to Cameroon. Competitive rates for the Nkenkak diaspora.', ownerName:'Jules Fomukong', contact:'+44 7700 900123', location:'London, United Kingdom', isDiaspora:true, isApproved:true, isFeatured:false },
    { name:'Kamdem Tutoring & Education', category:'Education', description:'Online tutoring for primary and secondary students in Cameroon. French, English, Mathematics and Sciences. Free first session for village children.', ownerName:'Prof. Armand Kamdem', contact:'armand.kamdem@gmail.com', location:'Douala / Online', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Bamileke Craft & Art Gallery', category:'Arts & Crafts', description:'Authentic handcrafted Bamileke masks, wood carvings, beaded jewellery and traditional art pieces. Available for export worldwide.', ownerName:'Celestine Fokou', contact:'+237 670 334 455', location:'Nkenkak-Ngiesang', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Houston Nkenkak Catering', category:'Food & Catering', description:'Cameroonian catering specialising in traditional Bamileke cuisine for events, parties and community gatherings in Houston, TX.', ownerName:'Sandra Mbianda', contact:'+1 713 555 0192', location:'Houston, Texas, USA', isDiaspora:true, isApproved:true, isFeatured:true },
    { name:'Kuete Solar Energy Solutions', category:'Energy & Environment', description:'Solar panel installation and maintenance for rural households, schools and health centres across the West Region.', ownerName:'Alain Kuete', contact:'+237 690 112 230', location:'Bafoussam, West Region', isDiaspora:false, isApproved:true, isFeatured:false },
  ]
  let bizCount = 0
  for (const b of businesses) {
    const exists = await prisma.business.findFirst({ where:{ name:b.name } })
    if (!exists) { await prisma.business.create({ data:b }); bizCount++ }
  }
  console.log(`✅ Businesses seeded (${bizCount} new)`)

  // ── Scholarships ──────────────────────────────────────────────
  const scholarships = [
    { name:'Nguimfack Lionel', level:'University', year:2024, sponsor:'Nkenkak Development Fund', amount:350000, status:'active', isPublished:true,
      bio:'Studying Computer Engineering at the University of Yaoundé I. Class valedictorian in 2023.' },
    { name:'Tchamba Ines', level:'University', year:2024, sponsor:'Diaspora Chapter – France', amount:400000, status:'active', isPublished:true,
      bio:'Bachelor\'s degree in Medicine at FMSB Yaoundé. Aspires to return and serve the village clinic.' },
    { name:'Fokou Rostand', level:'Secondary', year:2024, sponsor:'Nkenkak Development Fund', amount:120000, status:'active', isPublished:true,
      bio:'Top GCE O\'Level student at Gouvernement Bilingual High School Bafoussam. Ranked 3rd in region.' },
    { name:'Wabo Christelle', level:'Vocational', year:2024, sponsor:'Women Empowerment Fund', amount:85000, status:'active', isPublished:true,
      bio:'Completing a professional diploma in Agri-business at CETIC Bafoussam.' },
    { name:'Mbakop Steeve', level:'University', year:2023, sponsor:'Nkenkak Development Fund', amount:350000, status:'completed', isPublished:true,
      bio:'Graduated with a BSc in Civil Engineering, now contributing to the village road project.' },
    { name:'Nkengfack Aurelie', level:'Secondary', year:2023, sponsor:'Diaspora Chapter – UK', amount:120000, status:'completed', isPublished:true,
      bio:'Achieved 5 As in GCE A\'Level exams. Now enrolled at the University of Dschang.' },
    { name:'Tagne Junior', level:'University', year:2024, sponsor:'Chief\'s Council Bursary', amount:300000, status:'active', isPublished:true,
      bio:'Second year Law student at the University of Dschang. Passionate about community governance.' },
    { name:'Kamga Sylvie', level:'Vocational', year:2023, sponsor:'Women Empowerment Fund', amount:85000, status:'completed', isPublished:true,
      bio:'Completed fashion design training. Now runs a small tailoring business employing two village women.' },
  ]
  let schCount = 0
  for (const s of scholarships) {
    const exists = await prisma.scholarship.findFirst({ where:{ name:s.name, year:s.year } })
    if (!exists) { await prisma.scholarship.create({ data:s }); schCount++ }
  }
  console.log(`✅ Scholarships seeded (${schCount} new)`)

  // ── Documents ─────────────────────────────────────────────────
  const documents = [
    { title:'2024 Annual Activity Report', category:'Annual Report', fileUrl:'https://example.com/docs/annual-report-2024.pdf', fileType:'PDF', year:2024, isPublished:true,
      description:'Full summary of all community activities, projects, events and outcomes for the year 2024.' },
    { title:'2023 Annual Activity Report', category:'Annual Report', fileUrl:'https://example.com/docs/annual-report-2023.pdf', fileType:'PDF', year:2023, isPublished:true,
      description:'Complete activity report for 2023 covering project milestones and community highlights.' },
    { title:'Community Development Plan 2024–2028', category:'Strategic Plan', fileUrl:'https://example.com/docs/dev-plan-2024-2028.pdf', fileType:'PDF', year:2024, isPublished:true,
      description:'Five-year strategic development plan for Nkenkak-Ngiesang, approved by the general assembly in January 2024.' },
    { title:'Village Constitution & By-Laws', category:'Governance', fileUrl:'https://example.com/docs/constitution.pdf', fileType:'PDF', year:2022, isPublished:true,
      description:'The founding constitution and by-laws of the Nkenkak-Ngiesang Development Council, ratified 2022.' },
    { title:'Scholarship Programme Guidelines', category:'Programme Guidelines', fileUrl:'https://example.com/docs/scholarship-guidelines.pdf', fileType:'PDF', year:2024, isPublished:true,
      description:'Eligibility criteria, application process and selection criteria for the community scholarship programme.' },
    { title:'Mentorship Programme Handbook', category:'Programme Guidelines', fileUrl:'https://example.com/docs/mentorship-handbook.pdf', fileType:'PDF', year:2024, isPublished:true,
      description:'Complete guide for mentors and mentees — expectations, communication guidelines, and programme milestones.' },
    { title:'Water Pipeline Project Report — Q3 2024', category:'Project Report', fileUrl:'https://example.com/docs/water-pipeline-q3-2024.pdf', fileType:'PDF', year:2024, isPublished:true,
      description:'Progress report on the Clean Water Pipeline Project: works completed, funds disbursed, households connected.' },
    { title:'Primary School Renovation — Final Report', category:'Project Report', fileUrl:'https://example.com/docs/school-renovation-final.pdf', fileType:'PDF', year:2023, isPublished:true,
      description:'Final completion report for the Primary School Renovation Project, including photos and auditor sign-off.' },
    { title:'General Assembly Minutes — March 2024', category:'Meeting Minutes', fileUrl:'https://example.com/docs/assembly-march-2024.pdf', fileType:'PDF', year:2024, isPublished:true,
      description:'Official minutes of the March 2024 general assembly, including resolutions passed and voting outcomes.' },
    { title:'Membership Registration Form', category:'Forms', fileUrl:'https://example.com/docs/membership-form.pdf', fileType:'PDF', year:2024, isPublished:true,
      description:'Downloadable membership registration form for new members who prefer paper registration.' },
  ]
  let docCount = 0
  for (const d of documents) {
    const exists = await prisma.document.findFirst({ where:{ title:d.title } })
    if (!exists) { await prisma.document.create({ data:d }); docCount++ }
  }
  console.log(`✅ Documents seeded (${docCount} new)`)

  let vocabCount = 0
  for (const v of vocab) {
    const exists = await prisma.vocabWord.findFirst({ where:{ word:v.word, category:v.category } })
    if (!exists) { await prisma.vocabWord.create({ data:v }); vocabCount++ }
  }
  console.log(`✅ Vocab words seeded (${vocabCount} new)`)

  console.log('\n🎉 Seeding complete!')
  console.log('Login: admin@nkenkak-ngiesang.cm / Admin@1234')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
