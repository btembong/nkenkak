process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_J4qEjRgsbKd3@ep-nameless-math-amgt5fyg.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  for (let i = 1; i <= 10; i++) {
    try { await prisma.$queryRaw`SELECT 1`; console.log('DB ready'); break }
    catch { console.log('Waiting for DB...', i); await new Promise(r => setTimeout(r, 5000)); if (i === 10) throw new Error('DB unreachable') }
  }

  // ── Businesses ────────────────────────────────────────────────
  const businesses = [
    { name:'Nkenkak Agro-Supplies', category:'agriculture', description:'Supplier of quality seeds, fertilisers and farm tools to village farmers. Serving the West Region since 2010.', ownerName:'Emmanuel Tchwenko', phone:'+237 677 112 233', location:'Nkenkak-Ngiesang Market, West Region', country:'Cameroon', isDiaspora:false, isApproved:true, isFeatured:true },
    { name:'Wabo Digital Solutions', category:'tech', description:'Web design, mobile app development and IT support services for businesses in Cameroon and the diaspora.', ownerName:'Dr. Carine Wabo', email:'carine@wabodigital.cm', location:'Bafoussam, West Region / Remote', country:'Cameroon', isDiaspora:false, isApproved:true, isFeatured:true },
    { name:'Tagne Construction & Build', category:'construction', description:'Licensed construction company specialising in residential and community buildings across the West Region.', ownerName:'Patrick Tagne', phone:'+237 699 445 566', location:'Bafoussam, Cameroon', country:'Cameroon', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Ngwa Herbal & Natural Care', category:'health', description:'Traditional Bamileke herbal remedies, natural skincare and wellness products. Ships to the diaspora worldwide.', ownerName:'Mama Rose Ngwa', phone:'+237 655 778 899', location:'Nkenkak-Ngiesang Village', country:'Cameroon', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Paris Nkenkak Fashion', category:'retail', description:'African print fashion brand inspired by Bamileke culture. Custom Ankara outfits for events, weddings and everyday wear.', ownerName:'Christelle Mbakop', email:'christelle@nkenkakfashion.fr', city:'Paris', country:'France', isDiaspora:true, isApproved:true, isFeatured:true },
    { name:'Diaspora Money Transfer Services', category:'services', description:'Fast, affordable money transfer from Europe and North America to Cameroon. Competitive rates for the Nkenkak diaspora.', ownerName:'Jules Fomukong', phone:'+44 7700 900123', city:'London', country:'United Kingdom', isDiaspora:true, isApproved:true, isFeatured:false },
    { name:'Kamdem Tutoring & Education', category:'education', description:'Online tutoring for primary and secondary students in Cameroon. French, English, Mathematics and Sciences.', ownerName:'Prof. Armand Kamdem', email:'armand.kamdem@gmail.com', location:'Douala / Online', country:'Cameroon', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Bamileke Craft & Art Gallery', category:'crafts', description:'Authentic handcrafted Bamileke masks, wood carvings, beaded jewellery and traditional art pieces. Available for export worldwide.', ownerName:'Celestine Fokou', phone:'+237 670 334 455', location:'Nkenkak-Ngiesang', country:'Cameroon', isDiaspora:false, isApproved:true, isFeatured:false },
    { name:'Houston Nkenkak Catering', category:'food', description:'Cameroonian catering specialising in traditional Bamileke cuisine for events and community gatherings in Houston, TX.', ownerName:'Sandra Mbianda', phone:'+1 713 555 0192', city:'Houston', country:'USA', isDiaspora:true, isApproved:true, isFeatured:true },
    { name:'Kuete Solar Energy Solutions', category:'services', description:'Solar panel installation and maintenance for rural households, schools and health centres across the West Region.', ownerName:'Alain Kuete', phone:'+237 690 112 230', location:'Bafoussam, West Region', country:'Cameroon', isDiaspora:false, isApproved:true, isFeatured:false },
  ]
  let b = 0
  for (const x of businesses) {
    const e = await prisma.business.findFirst({ where: { name: x.name } })
    if (!e) { await prisma.business.create({ data: x }); b++ }
  }
  console.log(`✅ Businesses: ${b} new`)

  // ── Scholarships ──────────────────────────────────────────────
  const scholarships = [
    { name:'Nguimfack Lionel', school:'University of Yaoundé I', level:'university', year:2024, sponsorName:'Nkenkak Development Fund', amount:350000, status:'active', bio:'Studying Computer Engineering. Class valedictorian in 2023.' },
    { name:'Tchamba Ines', school:'FMSB Yaoundé', level:'university', year:2024, sponsorName:'Diaspora Chapter France', amount:400000, status:'active', bio:'Bachelor Medicine. Aspires to return and serve the village clinic.' },
    { name:'Fokou Rostand', school:'Bilingual High School Bafoussam', level:'secondary', year:2024, sponsorName:'Nkenkak Development Fund', amount:120000, status:'active', bio:'Top GCE O-Level student. Ranked 3rd in region.' },
    { name:'Wabo Christelle', school:'CETIC Bafoussam', level:'vocational', year:2024, sponsorName:'Women Empowerment Fund', amount:85000, status:'active', bio:'Professional diploma in Agri-business.' },
    { name:'Mbakop Steeve', school:'University of Bafoussam', level:'university', year:2023, sponsorName:'Nkenkak Development Fund', amount:350000, status:'completed', bio:'Graduated BSc Civil Engineering, now contributing to the village road project.' },
    { name:'Nkengfack Aurelie', school:'Government Bilingual High School Bafoussam', level:'secondary', year:2023, sponsorName:'Diaspora Chapter UK', amount:120000, status:'completed', bio:'Achieved 5 As in GCE A-Level. Now enrolled at the University of Dschang.' },
    { name:'Tagne Junior', school:'University of Dschang', level:'university', year:2024, sponsorName:'Chiefs Council Bursary', amount:300000, status:'active', bio:'Second year Law student. Passionate about community governance.' },
    { name:'Kamga Sylvie', school:'Centre Artisanal Bafoussam', level:'vocational', year:2023, sponsorName:'Women Empowerment Fund', amount:85000, status:'completed', bio:'Completed fashion design training. Now runs a tailoring business employing two village women.' },
  ]
  let s = 0
  for (const x of scholarships) {
    const e = await prisma.scholarship.findFirst({ where: { name: x.name, year: x.year } })
    if (!e) { await prisma.scholarship.create({ data: x }); s++ }
  }
  console.log(`✅ Scholarships: ${s} new`)

  // ── Documents ─────────────────────────────────────────────────
  const documents = [
    { title:'2024 Annual Activity Report', category:'report', fileUrl:'https://example.com/docs/annual-report-2024.pdf', fileType:'pdf', year:2024, isPublic:true },
    { title:'2023 Annual Activity Report', category:'report', fileUrl:'https://example.com/docs/annual-report-2023.pdf', fileType:'pdf', year:2023, isPublic:true },
    { title:'Community Development Plan 2024-2028', category:'policy', fileUrl:'https://example.com/docs/dev-plan.pdf', fileType:'pdf', year:2024, isPublic:true },
    { title:'Village Constitution and By-Laws', category:'constitution', fileUrl:'https://example.com/docs/constitution.pdf', fileType:'pdf', year:2022, isPublic:true },
    { title:'Scholarship Programme Guidelines', category:'policy', fileUrl:'https://example.com/docs/scholarship-guidelines.pdf', fileType:'pdf', year:2024, isPublic:true },
    { title:'Mentorship Programme Handbook', category:'policy', fileUrl:'https://example.com/docs/mentorship-handbook.pdf', fileType:'pdf', year:2024, isPublic:true },
    { title:'Water Pipeline Project Report Q3 2024', category:'report', fileUrl:'https://example.com/docs/water-pipeline-q3.pdf', fileType:'pdf', year:2024, isPublic:true },
    { title:'Primary School Renovation Final Report', category:'report', fileUrl:'https://example.com/docs/school-renovation.pdf', fileType:'pdf', year:2023, isPublic:true },
    { title:'General Assembly Minutes March 2024', category:'minutes', fileUrl:'https://example.com/docs/assembly-march-2024.pdf', fileType:'pdf', year:2024, isPublic:true },
    { title:'Membership Registration Form', category:'general', fileUrl:'https://example.com/docs/membership-form.pdf', fileType:'pdf', year:2024, isPublic:true },
  ]
  let d = 0
  for (const x of documents) {
    const e = await prisma.document.findFirst({ where: { title: x.title } })
    if (!e) { await prisma.document.create({ data: x }); d++ }
  }
  console.log(`✅ Documents: ${d} new`)

  console.log('\n🎉 Extra seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
