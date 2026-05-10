const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding wiki pages...')

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (!admin) throw new Error('No admin user found. Run seed.js first.')

  const pages = [
    {
      title: 'The Origin of Nkenkak-Ngiesang',
      slug: 'origin-of-nkenkak-ngiesang',
      category: 'history',
      isPublished: true,
      content: `<h2>Origins and Founding</h2>
<p>Nkenkak-Ngiesang is a Bamileke village located in the West Region of Cameroon, in the Menoua Division. Like many Bamileke chiefdoms, the village traces its origins to a founding ancestor who led a group of settlers from a larger chiefdom and established a new, independent community.</p>
<p>According to oral tradition preserved by the royal household, the founding chief — known by the honorific <em>Mfɔ̀ Nkenkak</em> — was a warrior and administrator of exceptional ability who received land from the paramount ruler and established the village's first sacred compound in the valley below the sacred forest.</p>
<h2>The Name</h2>
<p>The name <strong>Nkenkak-Ngiesang</strong> derives from two words in the Medumba language. <em>Nkenkak</em> refers to a type of fast-flowing stream that runs through the village, while <em>Ngiesang</em> is the name of the ridge on which the original compound was built. Together, the name evokes the landscape itself — water and high ground — the two things every Bamileke settlement needs to thrive.</p>
<h2>Early History</h2>
<p>The village developed rapidly through the 18th and 19th centuries, with successive chiefs expanding the farmland, establishing trade routes to Bafoussam and the coast, and negotiating alliances with neighbouring chiefdoms. The village became known for its skilled weavers, blacksmiths, and kola nut traders.</p>
<p>During the German colonial period (1884–1916), Nkenkak-Ngiesang maintained a degree of autonomy by engaging diplomatically with German administrators while preserving internal governance structures. The French colonial period brought new administrative boundaries, but the chieftaincy institution survived and remains central to village life today.</p>`,
    },
    {
      title: 'The Chieftaincy and Traditional Governance',
      slug: 'chieftaincy-and-governance',
      category: 'governance',
      isPublished: true,
      content: `<h2>The Role of the Fon</h2>
<p>The <em>Mfɔ̀</em> (Fon or Chief) is the supreme traditional authority of Nkenkak-Ngiesang. The office is hereditary and sacred — the Fon is considered both a political leader and a spiritual intermediary between the living community and the ancestors. Decisions of major importance are only taken after the Fon has consulted the ancestral spirits through established rituals.</p>
<p>The current Fon, <strong>Chief Ngwa Emmanuel</strong>, has held office since 2008 and has been a driving force behind the village's development programmes, combining respect for tradition with an openness to modern governance and diaspora engagement.</p>
<h2>The Council of Notables</h2>
<p>Beneath the Fon is a council of notables — senior men and women appointed by the Fon for their wisdom, service, and lineage. The council advises on land disputes, family matters, and community projects. Council meetings are held in the <em>Ndâ Mfɔ̀</em> (Chief's compound) and are governed by strict protocols of seating, speech, and ceremony.</p>
<h2>The Village Development Council</h2>
<p>In addition to the traditional council, the village operates a modern <strong>Village Development Council (VDC)</strong>, elected by all registered members. The VDC handles project planning, budget management, diaspora relations, and partnerships with NGOs and government agencies. The VDC operates transparently and publishes annual financial reports accessible to all members.</p>
<h2>Quarter Heads</h2>
<p>Nkenkak-Ngiesang is divided into several residential quarters, each led by a <em>Quarter Head</em> appointed by the Fon. Quarter Heads serve as the first point of contact for community disputes, infrastructure needs, and welfare concerns within their area.</p>`,
    },
    {
      title: 'Bamileke Funerary Traditions — The Cry-Die',
      slug: 'cry-die-funerary-traditions',
      category: 'customs',
      isPublished: true,
      content: `<h2>What is the Cry-Die?</h2>
<p>The <em>Nkàŋ</em> — known in Cameroonian English as the <strong>Cry-Die</strong> — is the most important ceremony in Bamileke culture. It is not a funeral in the Western sense; it is a celebration of the life of the deceased, a reaffirmation of community bonds, and a formal farewell that releases the spirit of the departed to join the ancestors.</p>
<p>A Cry-Die can last anywhere from one to several days, depending on the status of the deceased and the resources of the family. For the death of a chief, ceremonies may extend over multiple weekends across several months.</p>
<h2>Structure of the Ceremony</h2>
<p>The ceremony is organised into distinct phases:</p>
<ul>
  <li><strong>The Announcement:</strong> News of the death is communicated through the village drum network. Each lineage has a specific drum rhythm that signals a death, allowing even distant villagers to know who has passed.</li>
  <li><strong>The Gathering:</strong> Family members, friends, and community members arrive bearing gifts of food, drink, firewood, and money. The extended family prepares large quantities of traditional food — ndolé, achu and yellow soup, grilled meat, and corn beer (pito).</li>
  <li><strong>The Dances:</strong> Traditional dance groups — separated by age, gender, and association membership — perform in the compound of the deceased. The <em>Mbìə̀</em> dance groups wear elaborate costumes and perform complex choreography that has been passed down through generations.</li>
  <li><strong>The Masquerade:</strong> If the deceased was a member of a traditional society, the <em>Ntsòŋ</em> (masquerade spirit) may appear. The masquerade represents ancestral spirits and its appearance is considered a blessing on the family.</li>
  <li><strong>The Farewell:</strong> The final day includes speeches by elders, the recounting of the deceased's life achievements, and prayers — increasingly incorporating both traditional and Christian elements.</li>
</ul>
<h2>The Role of the Diaspora</h2>
<p>For diaspora members, the Cry-Die presents both a deep pull and a practical challenge. Many Nkenkak community members in Europe, North America, and other African cities make great financial and logistical sacrifices to return for the Cry-Die of a parent or elder relative. Community associations often maintain solidarity funds specifically to help members travel home for funerals.</p>`,
    },
    {
      title: 'Traditional Cuisine of Nkenkak-Ngiesang',
      slug: 'traditional-cuisine',
      category: 'customs',
      isPublished: true,
      content: `<h2>Food as Culture</h2>
<p>Food in Nkenkak-Ngiesang is deeply cultural. Meals are not merely sustenance — they are acts of community, hospitality, and identity. The sharing of food seals agreements, welcomes guests, and marks every ceremony from birth to death.</p>
<h2>Staple Dishes</h2>
<h3>Achu and Yellow Soup</h3>
<p><strong>Achu</strong> is considered the most prestigious dish in Bamileke cuisine and is essential at all major ceremonies. It is made from cocoyam (taro), pounded to a smooth, elastic consistency and shaped into mounds. It is served with <em>yellow soup</em> — a rich, spiced broth made with limestone water (<em>kanwa</em>), palm oil, crayfish, smoked fish, and various forest spices. The yellow colour comes from the limestone, which also gives the soup its distinctive silky texture.</p>
<h3>Kati Kati</h3>
<p><strong>Kati Kati</strong> is a chicken dish that is a cornerstone of celebration cooking. The chicken is first roasted over an open wood fire until the skin is slightly charred and smoky, then simmered in a sauce of ginger, garlic, and local spices. The smoky flavour from the fire is irreplaceable and is considered the hallmark of authentic kati kati.</p>
<h3>Corn Fufu and Njama Njama</h3>
<p>Everyday cooking centres on <strong>corn fufu</strong> — white corn flour cooked into a firm, starchy paste — served with <em>njama njama</em>, a sautéed dish of huckleberry leaves with onion, crayfish, and palm oil. This combination is filling, nutritious, and deeply comforting.</p>
<h3>Bush Plum Sauce (Safou)</h3>
<p>The <em>safou</em> (African plum) season is eagerly awaited each year. The dark purple fruit is boiled in salted water and eaten with corn fufu, or cooked into a rich sauce. Its buttery, slightly bitter flesh is unlike any other fruit.</p>
<h2>Drinks</h2>
<p><strong>Pito</strong> (corn beer) is the traditional celebratory drink, fermented from corn and served in calabash gourds at ceremonies. <strong>Raffia wine</strong>, tapped from the raffia palm tree, is another traditional drink — sweeter when freshly tapped, more potent as it ferments through the day.</p>`,
    },
    {
      title: 'The Medumba Language — A Guide for Beginners',
      slug: 'medumba-language-guide',
      category: 'language',
      isPublished: true,
      content: `<h2>About Medumba</h2>
<p><strong>Medumba</strong> is a Bantu language spoken by the Bamileke people of the West Region of Cameroon, particularly in the Ndé Division. It is the native language of Nkenkak-Ngiesang and an essential part of our cultural identity. While French is used for education and administration, Medumba is the language of home, ceremony, and the heart.</p>
<p>Medumba is a tonal language — the same syllable spoken with a different tone carries a completely different meaning. This makes it challenging for outsiders but deeply musical and expressive for native speakers.</p>
<h2>Tones in Medumba</h2>
<p>Medumba has three main tones:</p>
<ul>
  <li><strong>High tone (á):</strong> Spoken at a higher pitch. Example: <em>Yâ</em> (Yes)</li>
  <li><strong>Low tone (à):</strong> Spoken at a lower pitch. Example: <em>Àā</em> (No)</li>
  <li><strong>Mid/falling tone:</strong> Starts high and falls. Example: <em>Wèp</em> (Good/Fine)</li>
</ul>
<h2>Essential Phrases</h2>
<table style="width:100%;border-collapse:collapse;margin:1em 0">
  <thead><tr style="background:#f3eef9"><th style="padding:8px;text-align:left;border:1px solid #e5d9f7">Medumba</th><th style="padding:8px;text-align:left;border:1px solid #e5d9f7">English</th><th style="padding:8px;text-align:left;border:1px solid #e5d9f7">Pronunciation</th></tr></thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #e5d9f7">Mbua</td><td style="padding:8px;border:1px solid #e5d9f7">Good morning / Hello</td><td style="padding:8px;border:1px solid #e5d9f7">M-bwah</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d9f7">Fɨ̀ wɔ́?</td><td style="padding:8px;border:1px solid #e5d9f7">How are you?</td><td style="padding:8px;border:1px solid #e5d9f7">Fee woh?</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d9f7">Məŋ wèp</td><td style="padding:8px;border:1px solid #e5d9f7">I am fine</td><td style="padding:8px;border:1px solid #e5d9f7">Mung wep</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d9f7">Məŋ ŋkwɨ́</td><td style="padding:8px;border:1px solid #e5d9f7">Thank you</td><td style="padding:8px;border:1px solid #e5d9f7">Mung nkwee</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d9f7">Wáŋ</td><td style="padding:8px;border:1px solid #e5d9f7">Come / Come here</td><td style="padding:8px;border:1px solid #e5d9f7">Wang</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d9f7">Ndâ wɔ́</td><td style="padding:8px;border:1px solid #e5d9f7">Your home</td><td style="padding:8px;border:1px solid #e5d9f7">Ndah woh</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d9f7">Mfɔ̀</td><td style="padding:8px;border:1px solid #e5d9f7">Chief / Ruler</td><td style="padding:8px;border:1px solid #e5d9f7">M-foh</td></tr>
  </tbody>
</table>
<h2>Why Learn Medumba?</h2>
<p>For diaspora members born or raised abroad, learning even basic Medumba is a profound act of cultural connection. Being greeted in Medumba by an elder in the village, or being able to sing a traditional song in the original language, creates bonds that no translation can replicate. We encourage all community members to explore the Language section of this platform, which contains vocabulary, pronunciation guides, and proverbs.</p>`,
    },
    {
      title: 'The Sacred Forest — Ecology and Spiritual Significance',
      slug: 'sacred-forest',
      category: 'nature',
      isPublished: true,
      content: `<h2>Overview</h2>
<p>The <strong>Nkenkak Sacred Forest</strong> (<em>Ntùŋ Nkenkak</em>) is a 200-hectare ancestral woodland located on the northern ridge above the village. It has been protected by customary law for over 400 years and is considered one of the oldest continuously preserved forests in the West Region of Cameroon.</p>
<h2>Ecological Importance</h2>
<p>The forest is the primary water catchment area for the village. Six seasonal streams originate within its boundaries, feeding the irrigation channels that water farms in all quarters of Nkenkak-Ngiesang. Without the forest, these streams would dry up within a generation, threatening the agricultural base of the entire community.</p>
<p>The forest contains:</p>
<ul>
  <li>Over 120 identified tree species, including several found nowhere else in the region</li>
  <li>Medicinal plants used by the village healer and the health clinic</li>
  <li>Habitat for rare birds, including the <em>Bannerman's Turaco</em>, an endangered species endemic to Cameroon's highlands</li>
  <li>A colony of African giant forest squirrels, considered sacred and never hunted</li>
</ul>
<h2>Spiritual Significance</h2>
<p>The forest is believed to be inhabited by the spirits of the founding ancestors. Entry by non-initiated persons is forbidden, and certain areas within the forest may only be entered by the Fon and senior members of the <em>Kuosi</em> society during specific ritual periods. The forest is where libations are poured, where oaths are sworn, and where the most sensitive community decisions are communicated to the ancestors.</p>
<h2>Current Threats and Protection</h2>
<p>In recent years, illegal logging and agricultural encroachment have threatened the forest's boundaries. The Village Development Council has submitted petitions to the regional government for formal legal protection as a heritage forest. A community ranger programme, funded partly by the diaspora, patrols the forest boundaries monthly and reports violations to the traditional council.</p>`,
    },
    {
      title: 'Traditional Crafts — Weaving, Beadwork and Woodcarving',
      slug: 'traditional-crafts',
      category: 'customs',
      isPublished: true,
      content: `<h2>Craft as Heritage</h2>
<p>Bamileke craft traditions are among the most sophisticated in sub-Saharan Africa. In Nkenkak-Ngiesang, three crafts hold special cultural status: <strong>kente-style weaving</strong>, <strong>royal beadwork</strong>, and <strong>woodcarving</strong>. Each is a specialised skill, passed from master to apprentice within specific family lineages.</p>
<h2>Weaving</h2>
<p>The men's weaving tradition produces narrow-strip cloth on horizontal looms, similar in technique to the Kente of Ghana though distinct in pattern and colour. Specific patterns are reserved for royalty and chiefs; others indicate the wearer's age group, society membership, or family origin. A full ceremonial wrapper can take a master weaver two to three weeks to complete.</p>
<p>Women produce a different woven textile using raffia fibre, creating mats, baskets, and decorative panels that are used in the home and as ceremonial gifts. The intricacy of the geometric patterns is a mark of the weaver's skill and patience.</p>
<h2>Royal Beadwork</h2>
<p>Beadwork is the most prestigious craft in Bamileke culture. The royal thrones, calabashes, and ceremonial stools of the Fon are covered in hand-sewn beadwork using glass beads — originally imported from Europe via trans-Saharan trade routes, now sourced globally. The dominant colours are blue (royalty), red (life force), white (purity), and yellow (wealth).</p>
<p>Specific bead patterns are the intellectual property of the royal house and may only be used with the Fon's permission. Artisans who produce beadwork for the palace are considered to hold a privileged position in the community.</p>
<h2>Woodcarving</h2>
<p>Woodcarvers produce ceremonial masks, ancestor figures (<em>nkembo</em>), drums, and architectural elements. The most important carved objects are the <strong>royal ancestor masks</strong> — large helmet masks worn by masquerade performers during funerals and festivals. These masks represent the spirits of deceased chiefs and are treated with the same respect as sacred objects.</p>
<p>Carving is traditionally a male profession, and carvers undergo a period of spiritual preparation before beginning work on sacred objects. The wood used — typically African iroko or wild olive — is selected according to specific criteria and the cutting of the tree is accompanied by ritual libations.</p>`,
    },
    {
      title: 'Agriculture in Nkenkak-Ngiesang',
      slug: 'agriculture',
      category: 'history',
      isPublished: true,
      content: `<h2>The Agricultural Foundation</h2>
<p>Nkenkak-Ngiesang sits at an altitude of approximately 1,400 metres above sea level in the Bamileke highlands — an environment of fertile volcanic soils, reliable rainfall, and cool temperatures that has supported intensive agriculture for centuries. Farming is not merely an economic activity here; it is a cultural practice woven into the rhythms of community life.</p>
<h2>Traditional Crops</h2>
<p>The core food crops are:</p>
<ul>
  <li><strong>Cocoyam (Taro):</strong> The prestige crop, used for achu — the ceremonial dish. Different varieties are grown for different purposes.</li>
  <li><strong>Corn (Maize):</strong> The staple food, ground into fufu or fermented into pito beer.</li>
  <li><strong>Plantain and Banana:</strong> Grown in the lower, moister areas. Plantain is a daily food; certain banana varieties are used in traditional medicine.</li>
  <li><strong>Beans and Groundnuts:</strong> Important protein sources, grown alongside corn in intercropped fields.</li>
  <li><strong>Huckleberry (<em>Njama njama</em>):</strong> A leafy green vegetable essential to the daily diet.</li>
</ul>
<h2>Cash Crops</h2>
<p>Coffee — particularly Arabica — was introduced during the colonial period and became the primary cash crop of the highlands. Many village families still maintain coffee farms, though prices have fluctuated significantly. Tomatoes, onions, and cabbages are grown for sale in Bafoussam markets.</p>
<h2>The Cooperative Movement</h2>
<p>The Village Development Council is working to establish a <strong>village agricultural cooperative</strong> that would allow farmers to pool resources for seeds, equipment, and collective marketing — achieving better prices than individual smallholders can negotiate. A pilot scheme involving 40 households is currently being designed with support from the diaspora and a Bafoussam-based agricultural NGO.</p>`,
    },
  ]

  let count = 0
  for (const page of pages) {
    const exists = await prisma.wikiPage.findFirst({ where: { slug: page.slug } })
    if (!exists) {
      await prisma.wikiPage.create({ data: { ...page, authorId: admin.id } })
      count++
    }
  }
  console.log(`✅ Wiki pages seeded (${count} new)`)
  console.log('\n🎉 Wiki seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
