import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'

// Returns an embeddable URL for YouTube / Vimeo, or null for direct video files
function getEmbedUrl(url) {
  if (!url) return null
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/))([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null // direct video file — use <video> element
}

function getYouTubeThumbnail(url) {
  const yt = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/))([\w-]{11})/)
  return yt ? `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` : null
}

const SECTIONS = [
  { id: 'history',    icon: 'fa-scroll',          label: 'History & Origins' },
  { id: 'language',   icon: 'fa-comments',        label: 'Language & Oral Traditions' },
  { id: 'governance', icon: 'fa-crown',           label: 'Social Structure' },
  { id: 'ceremonies', icon: 'fa-star-and-crescent', label: 'Ceremonies & Festivals' },
  { id: 'arts',       icon: 'fa-drum',            label: 'Arts, Music & Dance' },
  { id: 'cuisine',    icon: 'fa-utensils',        label: 'Traditional Cuisine' },
  { id: 'attire',     icon: 'fa-tshirt',          label: 'Traditional Attire' },
  { id: 'proverbs',   icon: 'fa-quote-left',      label: 'Proverbs & Wisdom' },
]

const PROVERBS = [
  { text: 'Umuntu ngumuntu ngabantu', meaning: 'A person is a person through other people — the spirit of community defines us.' },
  { text: 'When spider webs unite, they can tie up a lion', meaning: 'Unity and cooperation make any community unstoppable.' },
  { text: 'The forest would be silent if no bird sang except the one that sang best', meaning: 'Every voice and contribution matters in our village.' },
  { text: 'A child who is not embraced by the village will burn it down to feel its warmth', meaning: 'Every child belongs to and is nurtured by the whole community.' },
  { text: 'He who learns, teaches', meaning: 'Knowledge gained must be shared for the good of all.' },
  { text: 'Until the lion learns to write, every story will glorify the hunter', meaning: 'We must tell our own story with pride and truth.' },
]

const CEREMONIES = [
  {
    name: 'Tso\'o Festival',
    season: 'Dry Season (Dec – Feb)',
    icon: 'fa-fire',
    color: '#B8830A',
    bg: 'rgba(240,165,0,0.08)',
    desc: 'The great harvest celebration held after the dry-season crops are gathered. Families offer first-fruits at the ancestral shrine, elders bless the coming rains, and the village comes alive with masquerade dances that last three days and three nights.',
  },
  {
    name: 'Nweshi Initiation',
    season: 'Every 7 Years',
    icon: 'fa-user-graduate',
    color: '#5B2D8E',
    bg: 'rgba(91,45,142,0.08)',
    desc: 'The passage rite that marks young men and women\'s transition into adult life. Initiates spend weeks in seclusion learning the moral code, traditional crafts, and responsibilities of community membership before being welcomed back with great ceremony.',
  },
  {
    name: 'Mbu\' Nkwi Remembrance',
    season: 'Rainy Season (July)',
    icon: 'fa-candle-holder',
    color: '#0369A1',
    bg: 'rgba(3,105,161,0.08)',
    desc: 'An annual day of remembrance for ancestors and fallen community leaders. Families visit shrines, pour libations, and recount genealogies aloud so that no name is ever forgotten. It is also a time of reconciliation and forgiveness.',
  },
  {
    name: 'Nkwi Ngon Dance',
    season: 'After Every Harvest',
    icon: 'fa-drum',
    color: '#16A34A',
    bg: 'rgba(22,163,74,0.08)',
    desc: 'A vibrant communal dance performed by both men and women after a successful harvest. Drummers lead the rhythm while dancers in raffia costumes celebrate the land\'s generosity. It is also performed to welcome important dignitaries to the village.',
  },
]

const FOODS = [
  { name: 'Eru & Waterfufu',  tag: 'anthro-food-eru',      icon: 'fa-leaf',          grad: 'linear-gradient(135deg,#1A3A20,#2D6A3A)', desc: 'The signature dish — shredded eru leaves slow-cooked with palm oil, crayfish and assorted meat, served alongside pounded cassava waterfufu. A staple at every gathering.' },
  { name: 'Kwa-coco Bible',   tag: 'anthro-food-kwacoco',  icon: 'fa-mortar-pestle', grad: 'linear-gradient(135deg,#3D2010,#7A4020)', desc: 'Pounded cocoyam wrapped in banana leaves and steamed to perfection. Served with smoked fish or meat sauce, it is comfort food at its finest.' },
  { name: 'Ndolé',            tag: 'anthro-food-ndole',    icon: 'fa-seedling',      grad: 'linear-gradient(135deg,#163A1A,#2D5A20)', desc: 'Bitter-leaf stew cooked with groundnuts, prawns and beef. Though shared across Cameroon, the Nkenkak version uses locally grown bitter leaves for a distinct depth of flavour.' },
  { name: 'Corn Chaff',       tag: 'anthro-food-corn',     icon: 'fa-wheat-awn',     grad: 'linear-gradient(135deg,#3A2D10,#6A5020)', desc: 'Dry maize cooked with beans and palm oil — a hearty, wholesome dish that fuels farm work and celebration alike.' },
  { name: 'Palmnut Soup',     tag: 'anthro-food-palmnut',  icon: 'fa-sun',           grad: 'linear-gradient(135deg,#3A1A10,#6A2A10)', desc: 'Rich soup extracted from pounded palm nuts, cooked with bush meat or fish and village spices. Served over boiled plantains or yam fufu.' },
  { name: 'Fried Bush Mango', tag: 'anthro-food-bushmango',icon: 'fa-circle',        grad: 'linear-gradient(135deg,#1A2A10,#3A5010)', desc: 'Dried bush-mango seeds ground into a thick, nutty sauce. Adds a distinctive earthy aroma to soups and stews.' },
]

// Tags reference for admin:
// Founders photo  → tag: anthro-founders
// Food images     → tags: anthro-food-eru, anthro-food-kwacoco, anthro-food-ndole,
//                         anthro-food-corn, anthro-food-palmnut, anthro-food-bushmango
// Men's attire    → tag: anthro-attire-men
// Women's attire  → tag: anthro-attire-women

function SectionAnchor({ id }) {
  return <span id={id} className="block" style={{ scrollMarginTop: '100px' }} />
}

export default function AnthropologyPage() {
  const [activeProverb, setActiveProverb] = useState(null)
  const [artsTab,       setArtsTab]       = useState('overview')
  const [lightboxImg,   setLightboxImg]   = useState(null)
  const [playingVideo,  setPlayingVideo]  = useState(null)

  const { data: artsMedia = [], isLoading: artsLoading } = useQuery(
    'cultural-arts-media',
    () => api.get('/gallery?tag=cultural-arts').then(r => r.data).catch(() => []),
    { enabled: artsTab !== 'overview' }
  )

  // Fetch all admin-managed section images by gallery tag
  const ANTHRO_TAGS = [
    'anthro-founders',
    'anthro-attire-men',
    'anthro-attire-women',
    ...FOODS.map(f => f.tag),
  ]
  const { data: anthroImages = {} } = useQuery(
    'anthro-section-images',
    async () => {
      const results = await Promise.allSettled(
        ANTHRO_TAGS.map(tag =>
          api.get(`/gallery?tag=${tag}&limit=1`)
            .then(r => { const items = r.data?.items || r.data || []; return { tag, img: items[0] || null } })
        )
      )
      return Object.fromEntries(
        results
          .filter(r => r.status === 'fulfilled')
          .map(r => [r.value.tag, r.value.img])
      )
    },
    { staleTime: 5 * 60 * 1000 }
  )

  return (
    <div>
      {/* Hero */}
      <div className="page-hero relative overflow-hidden py-24 px-6 text-center">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 wave-pattern opacity-20" />
        <div className="relative max-w-3xl mx-auto">
          <div className="eyebrow justify-center mb-4" style={{ color: 'rgba(240,165,0,0.9)' }}>
            <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
            Culture & Heritage
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Anthropology of<br />
            <span style={{ color: '#F0A500' }}>Nkenkak-Ngiesang</span>
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto mb-8"
            style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>
            A living record of our people — their history, language, customs, celebrations, and wisdom passed from generation to generation in the highlands of the West Region.
          </p>
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <i className="fas fa-home text-xs" />Home
            </Link>
            <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
            <Link to="/culture" className="hover:text-white transition-colors">About Us</Link>
            <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>Anthropology</span>
          </div>
        </div>
      </div>

      {/* Quick-nav tabs */}
      <div className="sticky top-24 z-30 border-b overflow-x-auto"
        style={{ background: '#fff', borderColor: 'rgba(91,45,142,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 flex gap-1 py-2 min-w-max">
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:bg-primary-50"
              style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
              <i className={`fas ${s.icon} text-[10px]`} style={{ color: '#F0A500' }} />{s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="py-16 px-6" style={{ background: '#FAFAFA' }}>
        <div className="max-w-5xl mx-auto space-y-20">

          {/* ── History & Origins ─────────────────── */}
          <div>
            <SectionAnchor id="history" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                <i className="fas fa-scroll text-sm" style={{ color: '#F0A500' }} />
              </div>
              <div>
                <div className="eyebrow mb-0.5">Our Roots</div>
                <h2 className="section-title !text-2xl !mb-0">History <span>&amp; Origins</span></h2>
              </div>
            </div>
            {/* Founder / Clan image banner */}
            <div className="card overflow-hidden mb-6">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative md:w-72 h-64 md:h-auto flex-shrink-0 overflow-hidden"
                  style={{ minHeight: '260px', background: 'linear-gradient(160deg,#1A0A35 0%,#3D1A6B 50%,#250F47 100%)' }}>
                  {anthroImages['anthro-founders']
                    ? <img src={anthroImages['anthro-founders'].url} alt="Founding clans of Nkenkak-Ngiesang"
                        className="absolute inset-0 w-full h-full object-cover"/>
                    : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background:'rgba(240,165,0,0.15)', border:'2px solid rgba(240,165,0,0.3)' }}>
                          <i className="fas fa-landmark text-3xl" style={{ color:'rgba(240,165,0,0.7)' }}/>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(240,165,0,0.6)', fontFamily:'Sora,sans-serif' }}>Founders &amp; Clans</div>
                        <div className="text-[10px] px-3 py-1 rounded-full" style={{ background:'rgba(240,165,0,0.1)', color:'rgba(240,165,0,0.5)', fontFamily:'Poppins,sans-serif', border:'1px solid rgba(240,165,0,0.2)' }}>
                          Gallery tag: <strong>anthro-founders</strong>
                        </div>
                      </div>
                  }
                  <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                    style={{ background: 'linear-gradient(to top,rgba(26,10,53,0.7),transparent)' }} />
                </div>
                {/* Text */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="eyebrow mb-2">The Founding Clans</div>
                  <h3 className="font-display font-bold text-xl mb-3" style={{ color: '#1A0A35' }}>
                    Origins of Nkenkak-Ngiesang
                  </h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                    Oral history records that Nkenkak-Ngiesang was founded by a confederation of related clans who migrated southward from the Bamenda Grasslands. Each founding clan brought its own shrine, craft specialisation and totemic identity — woven together into the village's composite culture over many generations.
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                    The village occupies a strategic position in the highlands of the West Region, with rich volcanic soils and cool highland air that have sustained the community across centuries of settlement and change.
                  </p>
                  <div className="flex gap-3 mt-4">
                    {[['fa-shield-alt','Clan Identity'],['fa-map-marker-alt','West Highlands'],['fa-users','Confederation']].map(([ic,lbl]) => (
                      <div key={lbl} className="flex items-center gap-1.5 text-[11px] font-semibold"
                        style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                        <i className={`fas ${ic} text-[9px]`} style={{ color: '#F0A500' }} />{lbl}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display font-bold text-base mb-3" style={{ color: '#1A0A35' }}>
                  <i className="fas fa-map-marker-alt mr-2" style={{ color: '#F0A500' }} />Settlement & Geography
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                  Nkenkak-Ngiesang is nestled in the highlands of the West Region of Cameroon, at an elevation that blesses it with rich volcanic soils and cool highland air. The village occupies a strategic position along ancient inter-village trade routes, which gave early settlers access to both lowland markets and highland pastures.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="font-display font-bold text-base mb-3" style={{ color: '#1A0A35' }}>
                  <i className="fas fa-users mr-2" style={{ color: '#F0A500' }} />The Founding Clans
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                  Oral history records that Nkenkak-Ngiesang was founded by a confederation of related clans who migrated southward from the Bamenda Grasslands. Each founding clan brought its own shrine, craft specialisation and totemic identity, which were woven together into the village's composite culture over many generations.
                </p>
              </div>
              <div className="card p-6 md:col-span-2">
                <h3 className="font-display font-bold text-base mb-3" style={{ color: '#1A0A35' }}>
                  <i className="fas fa-landmark mr-2" style={{ color: '#F0A500' }} />Pre-colonial & Colonial Period
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                  Before European contact, Nkenkak-Ngiesang operated as an autonomous chieftaincy with a sophisticated system of governance, inter-village diplomacy, and seasonal trade in palm oil, kola nuts, raffia goods, and iron tools. The arrival of German colonisers in the late 19th century and later the French and British brought disruptions to traditional land tenure and governance, but the community's core identity endured through its councils of elders and the authority of the Fon (traditional ruler).
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                  Post-independence Cameroon brought new administrative structures, yet Nkenkak-Ngiesang has maintained a parallel system of customary law and the Fon's court that governs matters of tradition, land, marriage, and dispute resolution alongside the formal state.
                </p>
              </div>
            </div>
          </div>

          {/* ── Language ─────────────────────────── */}
          <div>
            <SectionAnchor id="language" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3D1A6B,#7B4DB8)' }}>
                <i className="fas fa-comments text-sm" style={{ color: '#F0A500' }} />
              </div>
              <div>
                <div className="eyebrow mb-0.5">Voice of the Village</div>
                <h2 className="section-title !text-2xl !mb-0">Language <span>&amp; Oral Traditions</span></h2>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              {[
                { title: 'Mother Tongue', icon: 'fa-language', text: 'The community speaks a Bantu-family language of the Grasslands sub-group, characterised by tonal distinctions and rich noun-class prefixes. While French is used in formal education and administration, the mother tongue remains the language of the home, the farm, and ceremony.' },
                { title: 'Oral Literature', icon: 'fa-book-open', text: 'A vast body of oral literature — including myths of origin, heroic epics, riddles, praise-poetry (ngambo) and trickster tales — is carefully guarded by designated storytellers (kwifon keepers). These narratives are the community\'s living library.' },
                { title: 'Praise Names', icon: 'fa-certificate', text: 'Every person of distinction receives a praise name (dzeng) earned through acts of bravery, generosity or wisdom. Praise singers perform these names at ceremonies, keeping memory of great deeds alive across generations.' },
              ].map(c => (
                <div key={c.title} className="card p-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(91,45,142,0.08)' }}>
                    <i className={`fas ${c.icon} text-sm`} style={{ color: '#5B2D8E' }} />
                  </div>
                  <h3 className="font-display font-bold text-sm mb-2" style={{ color: '#1A0A35' }}>{c.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{c.text}</p>
                </div>
              ))}
            </div>
            {/* Sample words */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-base mb-4" style={{ color: '#1A0A35' }}>
                <i className="fas fa-spell-check mr-2" style={{ color: '#F0A500' }} />A Few Words from Our Language
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { word: 'Mbuh', meaning: 'Welcome' },
                  { word: 'Fon', meaning: 'Traditional Ruler' },
                  { word: 'Nkap', meaning: 'Wealth / Prosperity' },
                  { word: 'Fo\'ong', meaning: 'Community gathering' },
                  { word: 'Nchinda', meaning: 'Palace messenger' },
                  { word: 'Kwifon', meaning: 'Secret regulatory society' },
                  { word: 'Nguri', meaning: 'Elder / Respected one' },
                  { word: 'Mbu\'', meaning: 'Ancestral shrine' },
                ].map(w => (
                  <div key={w.word} className="text-center p-3 rounded-2xl"
                    style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.07)' }}>
                    <div className="font-display font-bold text-base" style={{ color: '#5B2D8E' }}>{w.word}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{w.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Social Structure ──────────────────── */}
          <div>
            <SectionAnchor id="governance" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#B8830A,#F0A500)' }}>
                <i className="fas fa-crown text-sm text-white" />
              </div>
              <div>
                <div className="eyebrow mb-0.5">How We Are Organised</div>
                <h2 className="section-title !text-2xl !mb-0">Social Structure <span>&amp; Governance</span></h2>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { rank: '01', title: 'The Fon', icon: 'fa-crown', color: '#B8830A', bg: 'rgba(240,165,0,0.08)',
                  desc: 'The Fon is the sacred custodian of the land, the ultimate authority in customary matters, and the spiritual intermediary between the living and the ancestors. His court (palace) is the village\'s ceremonial and political centre. The Fon inherits his position by patrilineal descent and is installed through elaborate sacred rites.' },
                { rank: '02', title: 'Kwifon Society', icon: 'fa-mask', color: '#5B2D8E', bg: 'rgba(91,45,142,0.08)',
                  desc: 'The Kwifon is the most powerful regulatory body, acting as a check on even the Fon\'s authority. Its masked members enforce community laws, settle land disputes, protect community assets, and perform sacred rites at key points in the agricultural and ceremonial calendar. Membership is earned by seniority and trustworthiness.' },
                { rank: '03', title: 'Council of Elders (Ngoumba)', icon: 'fa-users', color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
                  desc: 'Senior men and women of proven wisdom who advise the Fon and adjudicate disputes. They are the custodians of customary law, genealogical knowledge, and village history. Decisions affecting land, marriage and inheritance are made only with their consent.' },
                { rank: '04', title: 'Age-Grade Associations', icon: 'fa-sitemap', color: '#0369A1', bg: 'rgba(3,105,161,0.08)',
                  desc: 'Men and women born within the same cycle of years form a lifelong age-grade with shared responsibilities. Younger grades do communal labour, elder grades advise. This system ensures every generation has a defined role in sustaining village life.' },
              ].map(t => (
                <div key={t.rank} className="card p-5 flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: t.bg }}>
                    <i className={`fas ${t.icon} text-base`} style={{ color: t.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.color }}>{t.rank}</span>
                      <h3 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>{t.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Ceremonies ────────────────────────── */}
          <div>
            <SectionAnchor id="ceremonies" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#B91C1C,#EF4444)' }}>
                <i className="fas fa-star-and-crescent text-sm text-white" />
              </div>
              <div>
                <div className="eyebrow mb-0.5">Celebrations</div>
                <h2 className="section-title !text-2xl !mb-0">Ceremonies <span>&amp; Festivals</span></h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {CEREMONIES.map(c => (
                <div key={c.name} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: c.bg }}>
                      <i className={`fas ${c.icon} text-lg`} style={{ color: c.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base leading-snug" style={{ color: '#1A0A35' }}>{c.name}</h3>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 mb-2"
                        style={{ background: c.bg, color: c.color }}>{c.season}</span>
                      <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{c.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Arts, Music & Dance ───────────────── */}
          <div>
            <SectionAnchor id="arts" />

            {/* Heading row + subnav */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#2E1578,#5B2D8E)' }}>
                  <i className="fas fa-drum text-sm" style={{ color: '#F0A500' }} />
                </div>
                <div>
                  <div className="eyebrow mb-0.5">Creative Heritage</div>
                  <h2 className="section-title !text-2xl !mb-0">Arts, Music <span>&amp; Dance</span></h2>
                </div>
              </div>

              {/* Subnav tabs */}
              <div className="flex gap-1 p-1 rounded-2xl self-start sm:self-auto"
                style={{ background: 'rgba(91,45,142,0.07)', border: '1px solid rgba(91,45,142,0.1)' }}>
                {[
                  { k: 'overview', l: 'Overview',    ic: 'fa-th-large' },
                  { k: 'photos',   l: 'Photos',      ic: 'fa-images' },
                  { k: 'videos',   l: 'Dance Videos', ic: 'fa-play-circle' },
                ].map(({ k, l, ic }) => (
                  <button key={k} onClick={() => setArtsTab(k)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                    style={{
                      background:  artsTab === k ? '#fff' : 'transparent',
                      color:       artsTab === k ? '#5B2D8E' : '#A3A3A3',
                      boxShadow:   artsTab === k ? '0 1px 6px rgba(91,45,142,0.12)' : 'none',
                      fontFamily:  'Sora,sans-serif',
                    }}>
                    <i className={`fas ${ic} text-[10px]`} style={{ color: artsTab === k ? '#F0A500' : '#C4C4C4' }} />
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TAB: Overview ── */}
            {artsTab === 'overview' && (
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { icon: 'fa-drum',          title: 'Drumming',          color: '#B8830A', bg: 'rgba(240,165,0,0.08)',
                    desc: 'The drum (nkoung) is the village\'s voice. Master drummers trained from childhood can encode full messages — announcements, warnings, celebrations — in complex rhythmic sequences understood across the valley.' },
                  { icon: 'fa-theater-masks', title: 'Masquerade (Juju)', color: '#5B2D8E', bg: 'rgba(91,45,142,0.08)',
                    desc: 'Elaborately carved and costumed masquerades embody ancestral spirits. They appear at funerals, festivals and regulatory ceremonies, with each masquerade type carrying specific spiritual significance and performance rules.' },
                  { icon: 'fa-hand-holding',  title: 'Raffia Craft',      color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
                    desc: 'Nkenkak weavers produce intricate raffia bags, baskets, mats and royal regalia. These items are both functional and symbolic — specific patterns signal social rank, clan identity, or ceremonial purpose.' },
                  { icon: 'fa-palette',       title: 'Wood Carving',      color: '#B91C1C', bg: 'rgba(220,38,38,0.08)',
                    desc: 'Master carvers shape stools, doors, posts and figurines that serve as both art and sacred object. The distinctive Grasslands style — bold geometric forms and expressive human figures — is immediately recognisable across the region.' },
                  { icon: 'fa-music',         title: 'Flute & Xylophone', color: '#0369A1', bg: 'rgba(3,105,161,0.08)',
                    desc: 'The ngoni flute and wooden xylophone (balafon) accompany healing ceremonies and evening storytelling. Their music is said to open channels to the ancestor world, inviting wisdom into the present.' },
                  { icon: 'fa-running',       title: 'Circle Dance',      color: '#7C3AED', bg: 'rgba(168,85,247,0.08)',
                    desc: 'Men and women perform alternating circle dances at communal celebrations, each gender\'s movement vocabulary distinct but complementary. Dance is not entertainment alone — it is prayer, history, and community bond.' },
                ].map(a => (
                  <div key={a.title} className="card p-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: a.bg }}>
                      <i className={`fas ${a.icon} text-sm`} style={{ color: a.color }} />
                    </div>
                    <h3 className="font-display font-bold text-sm mb-2" style={{ color: '#1A0A35' }}>{a.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{a.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── TAB: Photos ── */}
            {artsTab === 'photos' && (() => {
              const photos = artsMedia.filter(m => m.mediaType === 'image')
              return (
                <div>
                  {artsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl animate-pulse"
                          style={{ background: 'rgba(91,45,142,0.06)' }} />
                      ))}
                    </div>
                  ) : photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {photos.map(p => (
                        <button key={p.id} onClick={() => setLightboxImg(p)}
                          className="group relative aspect-square rounded-2xl overflow-hidden focus:outline-none transition-all hover:-translate-y-1 hover:shadow-xl">
                          <img src={p.thumbnail || p.url} alt={p.title || ''}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                            style={{ background: 'rgba(26,10,53,0.6)' }}>
                            <i className="fas fa-expand text-white text-lg" />
                            {p.title && <span className="text-white text-xs font-semibold px-2 text-center" style={{ fontFamily: 'Sora,sans-serif' }}>{p.title}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 card">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(91,45,142,0.06)' }}>
                        <i className="fas fa-images text-2xl" style={{ color: 'rgba(91,45,142,0.25)' }} />
                      </div>
                      <p className="font-display font-bold text-base mb-1" style={{ color: '#1A0A35' }}>No photos yet</p>
                      <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                        Upload images in Admin → Gallery and tag them <strong>cultural-arts</strong>
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── TAB: Videos ── */}
            {artsTab === 'videos' && (() => {
              const videos = artsMedia.filter(m => m.mediaType === 'video')
              return (
                <div>
                  {artsLoading ? (
                    <div className="grid md:grid-cols-2 gap-5">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card overflow-hidden animate-pulse">
                          <div className="h-52" style={{ background: 'rgba(91,45,142,0.06)' }} />
                          <div className="p-4 space-y-2">
                            <div className="h-3 rounded-full w-3/4" style={{ background: 'rgba(91,45,142,0.06)' }} />
                            <div className="h-2.5 rounded-full w-1/2" style={{ background: 'rgba(91,45,142,0.04)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : videos.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-5">
                      {videos.map(v => {
                        const embedUrl = getEmbedUrl(v.url)
                        const ytThumb  = getYouTubeThumbnail(v.url)
                        const isPlaying = playingVideo === v.id
                        return (
                          <div key={v.id} className="card overflow-hidden">
                            {/* Video area */}
                            <div className="relative bg-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
                              {isPlaying && embedUrl ? (
                                <iframe src={`${embedUrl}&autoplay=1`} title={v.title || 'Dance video'}
                                  className="absolute inset-0 w-full h-full" frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                  allowFullScreen />
                              ) : isPlaying && !embedUrl ? (
                                <video src={v.url} controls autoPlay className="absolute inset-0 w-full h-full object-contain" />
                              ) : (
                                <>
                                  {/* Thumbnail */}
                                  <div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(135deg,#1A0A35,#3D1A6B)' }}>
                                    {(v.thumbnail || ytThumb) && (
                                      <img src={v.thumbnail || ytThumb} alt={v.title || ''}
                                        className="w-full h-full object-cover opacity-70" />
                                    )}
                                  </div>
                                  {/* Play button overlay */}
                                  <button onClick={() => setPlayingVideo(v.id)}
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 group focus:outline-none">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-2xl"
                                      style={{ background: 'rgba(240,165,0,0.9)', boxShadow: '0 4px 24px rgba(240,165,0,0.4)' }}>
                                      <i className="fas fa-play text-xl ml-1" style={{ color: '#1A0A35' }} />
                                    </div>
                                    {v.title && (
                                      <span className="text-white text-xs font-semibold px-4 text-center"
                                        style={{ fontFamily: 'Sora,sans-serif', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
                                        {v.title}
                                      </span>
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                            {/* Caption */}
                            <div className="px-4 py-3 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>
                                  {v.title || 'Dance Video'}
                                </h3>
                                {v.description && (
                                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                                    {v.description}
                                  </p>
                                )}
                              </div>
                              {isPlaying && (
                                <button onClick={() => setPlayingVideo(null)}
                                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-red-50"
                                  style={{ color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)' }}>
                                  <i className="fas fa-times" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 card">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(91,45,142,0.06)' }}>
                        <i className="fas fa-play-circle text-2xl" style={{ color: 'rgba(91,45,142,0.25)' }} />
                      </div>
                      <p className="font-display font-bold text-base mb-1" style={{ color: '#1A0A35' }}>No dance videos yet</p>
                      <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                        Upload videos in Admin → Gallery, set type to <strong>video</strong> and tag <strong>cultural-arts</strong>
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* ── Traditional Cuisine ───────────────── */}
          <div>
            <SectionAnchor id="cuisine" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                <i className="fas fa-utensils text-sm text-white" />
              </div>
              <div>
                <div className="eyebrow mb-0.5">Table of the Land</div>
                <h2 className="section-title !text-2xl !mb-0">Traditional <span>Cuisine</span></h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {FOODS.map((f, i) => (
                <div key={f.name} className="card overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image / placeholder */}
                    <div className="relative sm:w-40 h-40 sm:h-auto flex-shrink-0 overflow-hidden"
                      style={{ minHeight: '160px', background: f.grad }}>
                      {anthroImages[f.tag]
                        ? <img src={anthroImages[f.tag].url} alt={f.name} className="absolute inset-0 w-full h-full object-cover"/>
                        : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                              style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(4px)' }}>
                              <i className={`fas ${f.icon} text-xl`} style={{ color:'rgba(240,165,0,0.85)' }}/>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background:'rgba(0,0,0,0.3)', color:'rgba(240,165,0,0.7)', fontFamily:'Poppins,sans-serif' }}>
                              tag: {f.tag}
                            </span>
                          </div>
                      }
                      {/* Number badge */}
                      <div className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                        style={{ background: 'rgba(240,165,0,0.9)', color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    </div>
                    {/* Text */}
                    <div className="p-5 flex flex-col justify-center">
                      <h3 className="font-display font-bold text-base mb-1.5" style={{ color: '#1A0A35' }}>{f.name}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Traditional Attire ───────────────── */}
          <div>
            <SectionAnchor id="attire" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#0369A1,#0EA5E9)' }}>
                <i className="fas fa-tshirt text-sm text-white" />
              </div>
              <div>
                <div className="eyebrow mb-0.5">Dress & Identity</div>
                <h2 className="section-title !text-2xl !mb-0">Traditional <span>Attire</span></h2>
              </div>
            </div>
            <div className="space-y-5 mb-6">
              {/* Men's Dress */}
              <div className="card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative md:w-96 h-72 md:h-auto flex-shrink-0 overflow-hidden"
                    style={{ minHeight: '320px', background: 'linear-gradient(160deg,#1A0A35 0%,#250F47 40%,#3D1A6B 100%)' }}>
                    {anthroImages['anthro-attire-men']
                    ? <img src={anthroImages['anthro-attire-men'].url} alt="Men's traditional attire"
                        className="absolute inset-0 w-full h-full object-cover"/>
                    : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background:'rgba(240,165,0,0.15)', border:'2px solid rgba(240,165,0,0.3)' }}>
                          <i className="fas fa-male text-3xl" style={{ color:'rgba(240,165,0,0.75)' }}/>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest" style={{ color:'rgba(240,165,0,0.8)', fontFamily:'Sora,sans-serif' }}>Men's Attire</div>
                        <div className="text-[10px] px-3 py-1 rounded-full" style={{ background:'rgba(240,165,0,0.1)', color:'rgba(240,165,0,0.6)', fontFamily:'Poppins,sans-serif', border:'1px solid rgba(240,165,0,0.2)' }}>
                          tag: <strong>anthro-attire-men</strong>
                        </div>
                      </div>
                  }
                  <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                    style={{ background: 'linear-gradient(to top,rgba(26,10,53,0.6),transparent)' }} />
                  </div>
                  {/* Text */}
                  <div className="p-7 flex flex-col justify-center">
                    <h3 className="font-display font-bold text-lg mb-1" style={{ color: '#1A0A35' }}>
                      Men's Dress
                    </h3>
                    <div className="h-0.5 w-8 rounded-full mb-4" style={{ background: 'linear-gradient(90deg,#F0A500,transparent)' }} />
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      Distinguished men wear the <em>toghu</em> — a heavy embroidered cloth of deep blue or black adorned with colourful geometric motifs. For everyday wear, a loose boubou or wrapper tied at the waist is common. Elders and titleholders add raffia caps and carved animal-tooth necklaces to signal their status.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      Warriors and masquerade performers wear elaborate costumes incorporating animal skins, feathers, and carved wooden elements, assembled according to ancient specifications that have not changed in centuries.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {['Toghu cloth','Raffia cap','Boubou','Animal-tooth necklace'].map(tag => (
                        <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Women's Dress */}
              <div className="card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative md:w-96 h-72 md:h-auto flex-shrink-0 overflow-hidden"
                    style={{ minHeight: '320px', background: 'linear-gradient(160deg,#3D1A2A 0%,#6B2D4A 50%,#4A1A35 100%)' }}>
                    {anthroImages['anthro-attire-women']
                    ? <img src={anthroImages['anthro-attire-women'].url} alt="Women's traditional attire"
                        className="absolute inset-0 w-full h-full object-cover"/>
                    : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background:'rgba(240,165,0,0.15)', border:'2px solid rgba(240,165,0,0.3)' }}>
                          <i className="fas fa-female text-3xl" style={{ color:'rgba(240,165,0,0.75)' }}/>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest" style={{ color:'rgba(240,165,0,0.8)', fontFamily:'Sora,sans-serif' }}>Women's Attire</div>
                        <div className="text-[10px] px-3 py-1 rounded-full" style={{ background:'rgba(240,165,0,0.1)', color:'rgba(240,165,0,0.6)', fontFamily:'Poppins,sans-serif', border:'1px solid rgba(240,165,0,0.2)' }}>
                          tag: <strong>anthro-attire-women</strong>
                        </div>
                      </div>
                  }
                  <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                    style={{ background: 'linear-gradient(to top,rgba(61,26,42,0.6),transparent)' }} />
                  </div>
                  {/* Text */}
                  <div className="p-7 flex flex-col justify-center">
                    <h3 className="font-display font-bold text-lg mb-1" style={{ color: '#1A0A35' }}>
                      Women's Dress
                    </h3>
                    <div className="h-0.5 w-8 rounded-full mb-4" style={{ background: 'linear-gradient(90deg,#F0A500,transparent)' }} />
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      Women wrap brightly coloured kaba wrappers around their waists and pair them with matching blouses (kabba) for everyday occasions. For ceremony, they don toghu wrappers and elaborate headdresses. Older women of distinction may wear the prized <em>mbu'</em> beaded necklace, a mark of lineage and earned respect.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      Indigo-dyed cloth produced by village artisans is prized above imported fabric. The dyeing process using locally grown indigo is itself a closely guarded women's craft tradition.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {['Kaba wrapper','Headdress','Mbu\' necklace','Indigo cloth'].map(tag => (
                        <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(185,28,86,0.07)', color: '#9D174D', fontFamily: 'Sora,sans-serif' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Colour/symbol key */}
              <div className="card p-5">
                <h3 className="font-display font-bold text-sm mb-3" style={{ color: '#1A0A35' }}>
                  <i className="fas fa-palette mr-2" style={{ color: '#F0A500' }} />Colour Symbolism
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { color: '#1A0A35', label: 'Deep Purple/Indigo', meaning: 'Royalty & authority' },
                    { color: '#F0A500', label: 'Gold', meaning: 'Wealth & achievement' },
                    { color: '#FFFFFF', border: true, label: 'White', meaning: 'Purity & ancestral contact' },
                    { color: '#B91C1C', label: 'Red', meaning: 'Strength & sacrifice' },
                    { color: '#16A34A', label: 'Green', meaning: 'Land, growth & fertility' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex-shrink-0"
                        style={{ background: s.color, border: s.border ? '1.5px solid #E5E7EB' : 'none' }} />
                      <div>
                        <span className="text-xs font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{s.label}</span>
                        <span className="text-[11px] ml-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>— {s.meaning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Proverbs ─────────────────────────── */}
          <div>
            <SectionAnchor id="proverbs" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#4A2478,#7B4DB8)' }}>
                <i className="fas fa-quote-left text-sm" style={{ color: '#F0A500' }} />
              </div>
              <div>
                <div className="eyebrow mb-0.5">Words of the Elders</div>
                <h2 className="section-title !text-2xl !mb-0">Proverbs <span>&amp; Wisdom</span></h2>
              </div>
            </div>
            <p className="text-sm mb-6" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Click any proverb to reveal its meaning — wisdom passed from generation to generation.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {PROVERBS.map((p, i) => (
                <button key={i} onClick={() => setActiveProverb(activeProverb === i ? null : i)}
                  className="text-left card p-5 transition-all hover:-translate-y-0.5 focus:outline-none"
                  style={{ borderLeft: '3px solid', borderColor: activeProverb === i ? '#5B2D8E' : 'rgba(91,45,142,0.15)' }}>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-quote-left text-xl flex-shrink-0 mt-0.5" style={{ color: 'rgba(240,165,0,0.3)' }} />
                    <div>
                      <p className="font-display font-bold text-sm italic leading-snug mb-2" style={{ color: '#1A0A35' }}>
                        "{p.text}"
                      </p>
                      {activeProverb === i && (
                        <p className="text-xs leading-relaxed animate-fade-in"
                          style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>
                          <i className="fas fa-lightbulb mr-1.5" style={{ color: '#F0A500' }} />
                          {p.meaning}
                        </p>
                      )}
                      {activeProverb !== i && (
                        <span className="text-[11px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                          Tap to reveal meaning
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTA banner */}
          <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
            <div className="wave-pattern absolute inset-0 opacity-20" />
            <div className="relative grid md:grid-cols-2 gap-0">
              {/* Left */}
              <div className="p-10">
                <div className="eyebrow mb-4" style={{ color: 'rgba(240,165,0,0.85)' }}>
                  <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />Keep the Culture Alive
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-3">
                  Preserve &amp; Share Our Heritage
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
                  Our culture is not a museum piece — it is a living, breathing inheritance. Help us document, teach, and celebrate it for generations to come.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/projects?cat=culture" className="btn-gold">
                    <i className="fas fa-hand-holding-heart" />Support Culture Projects
                  </Link>
                  <Link to="/contact"
                    className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'Sora,sans-serif' }}>
                    <i className="fas fa-envelope" />Contribute Knowledge
                  </Link>
                </div>
              </div>
              {/* Right — decorative stat pills */}
              <div className="hidden md:flex flex-col items-end justify-center gap-3 p-10">
                {[
                  { n: '200+', l: 'Years of oral tradition documented' },
                  { n: '12',   l: 'Distinct masquerade types' },
                  { n: '6',    l: 'Major annual ceremonies' },
                  { n: '50+',  l: 'Proverbs in active use' },
                ].map(s => (
                  <div key={s.n} className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span className="font-display font-bold text-2xl" style={{ color: '#F0A500' }}>{s.n}</span>
                    <span className="text-xs max-w-[140px] leading-snug" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Photo Lightbox ── */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightboxImg.url} alt={lightboxImg.title || ''}
              className="w-full max-h-[80vh] object-contain rounded-2xl" />
            {(lightboxImg.title || lightboxImg.description) && (
              <div className="mt-3 text-center">
                {lightboxImg.title && (
                  <p className="font-display font-bold text-white text-base">{lightboxImg.title}</p>
                )}
                {lightboxImg.description && (
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
                    {lightboxImg.description}
                  </p>
                )}
              </div>
            )}
            <button onClick={() => setLightboxImg(null)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
