import { useState } from 'react'
import { Link } from 'react-router-dom'

const LOCATIONS = [
  {
    id: 1, x: 310, y: 200,
    name: "Fon's Palace", icon: 'fa-crown', category: 'landmark',
    desc: 'The royal compound and seat of the Fon — spiritual, judicial and executive centre of the village. Constructed in traditional Grasslands architecture with carved wooden posts and thatched halls.',
    pinColor: '#F0A500', bgColor: 'rgba(240,165,0,0.15)', badge: 'Royal Landmark',
  },
  {
    id: 2, x: 170, y: 120,
    name: 'Primary School', icon: 'fa-school', category: 'service',
    desc: 'Government primary school serving over 400 pupils from surrounding quarters. Built by the community in 1965 and expanded in 2010 with diaspora support.',
    pinColor: '#5B2D8E', bgColor: 'rgba(91,45,142,0.12)', badge: 'Education',
  },
  {
    id: 3, x: 450, y: 140,
    name: 'Health Centre', icon: 'fa-clinic-medical', category: 'service',
    desc: 'The village health post providing primary care, maternal health, and immunisation services. Staffed by two nurses and a community health worker.',
    pinColor: '#dc2626', bgColor: 'rgba(220,38,38,0.1)', badge: 'Healthcare',
  },
  {
    id: 4, x: 220, y: 310,
    name: 'Catholic Church', icon: 'fa-church', category: 'landmark',
    desc: 'Sacred Heart Parish — established in 1948. The stone church with its distinctive bell tower is a beloved spiritual and social gathering place for the community.',
    pinColor: '#5B2D8E', bgColor: 'rgba(91,45,142,0.12)', badge: 'Worship',
  },
  {
    id: 5, x: 380, y: 330,
    name: 'Market Square', icon: 'fa-store', category: 'service',
    desc: 'The traditional eight-day market where villagers and traders exchange goods. Produce, crafts, livestock and cooked food are sold here every cycle.',
    pinColor: '#F0A500', bgColor: 'rgba(240,165,0,0.12)', badge: 'Commerce',
  },
  {
    id: 6, x: 290, y: 390,
    name: 'Community Hall', icon: 'fa-building', category: 'service',
    desc: 'Multi-purpose hall for village meetings, ceremonies, receptions and events. Renovated in 2019 with a capacity of 500 people.',
    pinColor: '#5B2D8E', bgColor: 'rgba(91,45,142,0.12)', badge: 'Community',
  },
  {
    id: 7, x: 140, y: 240,
    name: 'Water Borehole', icon: 'fa-tint', category: 'service',
    desc: 'Solar-powered borehole providing clean drinking water to five quarters. Funded by diaspora contributions in 2018 and managed by the village water committee.',
    pinColor: '#0284c7', bgColor: 'rgba(2,132,199,0.1)', badge: 'Infrastructure',
  },
  {
    id: 8, x: 520, y: 280,
    name: 'Farm Cooperative', icon: 'fa-seedling', category: 'nature',
    desc: 'Community farm cooperative spanning 12 hectares of fertile land. Produces maize, vegetables, coffee and cocoa. Open to all registered village households.',
    pinColor: '#16a34a', bgColor: 'rgba(22,163,74,0.1)', badge: 'Agriculture',
  },
  {
    id: 9, x: 420, y: 420,
    name: 'Youth Centre', icon: 'fa-users', category: 'service',
    desc: 'Dedicated space for youth programming including football, skills training, digital literacy and cultural activities. Managed by the Village Youth Council.',
    pinColor: '#5B2D8E', bgColor: 'rgba(91,45,142,0.12)', badge: 'Youth',
  },
  {
    id: 10, x: 230, y: 190,
    name: 'Elder Council House', icon: 'fa-scroll', category: 'landmark',
    desc: 'Meeting house of the Council of Elders. Deliberations on village law, disputes and customs take place here in closed session under oath of tradition.',
    pinColor: '#F0A500', bgColor: 'rgba(240,165,0,0.12)', badge: 'Governance',
  },
  {
    id: 11, x: 580, y: 160,
    name: 'Forest Reserve', icon: 'fa-tree', category: 'nature',
    desc: 'Protected sacred forest maintained as ancestral reserve. Certain sections are restricted for spiritual observances. Rich in medicinal plants and wildlife.',
    pinColor: '#16a34a', bgColor: 'rgba(22,163,74,0.1)', badge: 'Nature',
  },
  {
    id: 12, x: 100, y: 430,
    name: 'Village Entrance Gate', icon: 'fa-archway', category: 'landmark',
    desc: 'The ceremonial gate marking the main entrance to Nkenkak-Ngiesang. Carved wooden posts bear the village crest. All important visitors are welcomed here.',
    pinColor: '#F0A500', bgColor: 'rgba(240,165,0,0.15)', badge: 'Landmark',
  },
]

const LEGEND = [
  { color: '#F0A500', label: 'Royal / Heritage Landmarks' },
  { color: '#5B2D8E', label: 'Community Services' },
  { color: '#16a34a', label: 'Nature & Agriculture' },
  { color: '#dc2626', label: 'Health' },
  { color: '#0284c7', label: 'Infrastructure' },
]

export default function VillageMapPage() {
  const [selectedPin, setSelectedPin] = useState(null)

  const selected = LOCATIONS.find(l => l.id === selectedPin)

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
          Heritage Map
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">
          Village <span style={{ color: '#F0A500' }}>Illustrated Map</span>
        </h1>
        <p className="text-sm max-w-xl mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
          Explore the landmarks, services, and sacred spaces of Nkenkak-Ngiesang. Click any pin to learn more.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <i className="fas fa-home text-xs" />Home
          </Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>Village Map</span>
        </div>
      </div>

      {/* Map Section */}
      <section className="py-14" style={{ background: '#FAF6EE' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* SVG Map */}
            <div className="flex-1 relative rounded-3xl overflow-hidden"
              style={{
                boxShadow: '0 8px 48px rgba(91,45,142,0.14)',
                border: '3px solid rgba(240,165,0,0.25)',
                minHeight: 500,
              }}>
              <svg
                viewBox="0 0 680 520"
                className="w-full h-auto block"
                style={{ background: '#F5F0E8', display: 'block' }}
                onClick={() => setSelectedPin(null)}
              >
                {/* Decorative border / frame */}
                <rect x="4" y="4" width="672" height="512" rx="16" fill="none"
                  stroke="rgba(240,165,0,0.35)" strokeWidth="2" strokeDasharray="8 6" />

                {/* Sky / background wash */}
                <rect x="0" y="0" width="680" height="180" fill="rgba(200,230,255,0.18)" />

                {/* Hills — far background */}
                <ellipse cx="80" cy="155" rx="120" ry="55" fill="rgba(160,185,120,0.28)" />
                <ellipse cx="300" cy="140" rx="180" ry="65" fill="rgba(150,175,110,0.22)" />
                <ellipse cx="560" cy="150" rx="140" ry="60" fill="rgba(160,185,120,0.25)" />

                {/* Forest area — top right */}
                <ellipse cx="570" cy="185" rx="90" ry="60" fill="rgba(34,120,60,0.12)" />
                <ellipse cx="600" cy="170" rx="60" ry="45" fill="rgba(34,120,60,0.10)" />

                {/* Fields / farmland */}
                <path d="M460 240 Q540 220 600 265 Q620 300 570 320 Q500 340 460 300 Z"
                  fill="rgba(160,200,100,0.18)" stroke="rgba(100,140,60,0.2)" strokeWidth="1" />
                <path d="M475 250 L555 235 M490 265 L560 250 M480 280 L550 268"
                  stroke="rgba(100,140,60,0.25)" strokeWidth="1" fill="none" />

                {/* River — wavy blue line */}
                <path d="M0 370 Q60 355 120 375 Q180 395 240 370 Q300 345 360 365 Q420 385 480 360 Q540 335 600 355 Q640 365 680 352"
                  fill="none" stroke="rgba(30,130,200,0.45)" strokeWidth="5" strokeLinecap="round" />
                <path d="M0 378 Q60 363 120 383 Q180 403 240 378 Q300 353 360 373 Q420 393 480 368 Q540 343 600 363 Q640 373 680 360"
                  fill="none" stroke="rgba(30,130,200,0.2)" strokeWidth="3" strokeLinecap="round" />

                {/* Small stream */}
                <path d="M580 160 Q570 220 555 280 Q545 325 530 370"
                  fill="none" stroke="rgba(30,130,200,0.3)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Roads — brown/tan paths */}
                {/* Main road horizontal */}
                <path d="M0 290 Q120 280 200 285 Q280 290 360 285 Q440 280 520 290 Q600 300 680 288"
                  fill="none" stroke="rgba(160,120,70,0.5)" strokeWidth="8" strokeLinecap="round" />
                {/* Road markings */}
                <path d="M0 290 Q120 280 200 285 Q280 290 360 285 Q440 280 520 290 Q600 300 680 288"
                  fill="none" stroke="rgba(240,210,160,0.4)" strokeWidth="2" strokeDasharray="20 14" strokeLinecap="round" />

                {/* North-South road */}
                <path d="M310 0 Q305 80 308 160 Q311 230 310 285 Q309 360 312 440 Q313 480 315 520"
                  fill="none" stroke="rgba(160,120,70,0.45)" strokeWidth="7" strokeLinecap="round" />

                {/* Secondary road SW */}
                <path d="M0 430 Q60 420 110 410 Q160 398 200 380 Q240 360 280 345 Q300 335 310 285"
                  fill="none" stroke="rgba(160,120,70,0.3)" strokeWidth="5" strokeLinecap="round" />

                {/* Secondary road NE */}
                <path d="M310 200 Q360 200 410 195 Q460 188 510 180 Q550 174 590 165"
                  fill="none" stroke="rgba(160,120,70,0.3)" strokeWidth="4" strokeLinecap="round" />

                {/* Green field patches */}
                <rect x="30" y="400" width="80" height="55" rx="8" fill="rgba(120,180,80,0.15)" />
                <rect x="45" y="412" width="12" height="12" rx="3" fill="rgba(80,140,50,0.2)" />
                <rect x="65" y="415" width="10" height="10" rx="2" fill="rgba(80,140,50,0.2)" />
                <rect x="80" y="408" width="14" height="14" rx="3" fill="rgba(80,140,50,0.2)" />

                {/* Compass rose */}
                <g transform="translate(628,450)">
                  <circle cx="0" cy="0" r="22" fill="rgba(255,255,255,0.7)" stroke="rgba(240,165,0,0.4)" strokeWidth="1.5" />
                  <text x="0" y="-10" textAnchor="middle" fontSize="9" fill="#5B2D8E" fontFamily="Sora,sans-serif" fontWeight="700">N</text>
                  <text x="0" y="16" textAnchor="middle" fontSize="7" fill="#A3A3A3" fontFamily="Poppins,sans-serif">S</text>
                  <text x="-12" y="4" textAnchor="middle" fontSize="7" fill="#A3A3A3" fontFamily="Poppins,sans-serif">W</text>
                  <text x="12" y="4" textAnchor="middle" fontSize="7" fill="#A3A3A3" fontFamily="Poppins,sans-serif">E</text>
                  <polygon points="0,-8 2,0 0,3 -2,0" fill="#5B2D8E" />
                  <polygon points="0,8 2,0 0,-3 -2,0" fill="#D4D4D4" />
                </g>

                {/* Map title cartouche */}
                <rect x="14" y="14" width="200" height="44" rx="10"
                  fill="rgba(255,255,255,0.82)" stroke="rgba(240,165,0,0.4)" strokeWidth="1.5" />
                <text x="24" y="31" fontSize="9" fill="#F0A500" fontFamily="Sora,sans-serif" fontWeight="700" letterSpacing="1.5">NKENKAK-NGIESANG</text>
                <text x="24" y="47" fontSize="8" fill="#737373" fontFamily="Poppins,sans-serif">Illustrated Village Map</text>

                {/* Location pins */}
                {LOCATIONS.map(loc => (
                  <g key={loc.id}
                    onClick={e => { e.stopPropagation(); setSelectedPin(selectedPin === loc.id ? null : loc.id) }}
                    style={{ cursor: 'pointer' }}>
                    {/* Glow on selected */}
                    {selectedPin === loc.id && (
                      <circle cx={loc.x} cy={loc.y} r="24" fill={loc.pinColor} opacity="0.2" />
                    )}
                    {/* Shadow */}
                    <ellipse cx={loc.x} cy={loc.y + 18} rx="10" ry="4" fill="rgba(0,0,0,0.15)" />
                    {/* Pin body */}
                    <path
                      d={`M${loc.x} ${loc.y - 22} A14 14 0 1 1 ${loc.x} ${loc.y - 22.001} Z`}
                      fill={selectedPin === loc.id ? loc.pinColor : '#fff'}
                      stroke={loc.pinColor}
                      strokeWidth="2.5"
                    />
                    {/* Actual circle */}
                    <circle cx={loc.x} cy={loc.y - 8} r="14"
                      fill={selectedPin === loc.id ? loc.pinColor : '#fff'}
                      stroke={loc.pinColor}
                      strokeWidth="2.5" />
                    {/* Pin tail */}
                    <polygon
                      points={`${loc.x - 5},${loc.y - 4} ${loc.x + 5},${loc.y - 4} ${loc.x},${loc.y + 8}`}
                      fill={selectedPin === loc.id ? loc.pinColor : '#fff'}
                      stroke={loc.pinColor}
                      strokeWidth="1.5"
                    />
                    {/* Star for Fon's Palace */}
                    {loc.id === 1 ? (
                      <text x={loc.x} y={loc.y - 4} textAnchor="middle" fontSize="12"
                        fill={selectedPin === loc.id ? '#fff' : '#F0A500'} fontFamily="FontAwesome">
                        ★
                      </text>
                    ) : (
                      <text x={loc.x} y={loc.y - 3} textAnchor="middle" fontSize="9"
                        fill={selectedPin === loc.id ? '#fff' : loc.pinColor}
                        fontFamily="'Font Awesome 5 Free'" fontWeight="900">
                      </text>
                    )}
                    {/* Label */}
                    <text x={loc.x} y={loc.y + 20} textAnchor="middle"
                      fontSize="7.5" fill="#1A0A35" fontFamily="Sora,sans-serif" fontWeight="600"
                      style={{ pointerEvents: 'none' }}>
                      {loc.name.length > 16 ? loc.name.slice(0, 15) + '…' : loc.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Floating info card */}
              {selected && (
                <div className="absolute bottom-4 left-4 right-4 lg:bottom-auto lg:top-4 lg:right-4 lg:left-auto lg:w-72 rounded-3xl p-5 z-10 animate-fade-in"
                  style={{
                    background: '#fff',
                    boxShadow: '0 12px 48px rgba(91,45,142,0.18)',
                    border: `2px solid ${selected.pinColor}30`,
                  }}>
                  <button onClick={() => setSelectedPin(null)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E' }}>
                    <i className="fas fa-times text-xs" />
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: selected.bgColor, border: `1.5px solid ${selected.pinColor}30` }}>
                      <i className={`fas ${selected.icon} text-lg`} style={{ color: selected.pinColor }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                        style={{ background: selected.bgColor, color: selected.pinColor }}>
                        {selected.badge}
                      </span>
                      <h3 className="font-display font-bold text-sm mt-0.5" style={{ color: '#1A0A35' }}>
                        {selected.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                    {selected.desc}
                  </p>
                </div>
              )}
            </div>

            {/* Legend sidebar */}
            <div className="lg:w-56 flex-shrink-0 space-y-4">
              <div className="card p-5">
                <h3 className="font-display font-bold text-sm mb-4" style={{ color: '#1A0A35' }}>
                  <i className="fas fa-map-legend mr-2" style={{ color: '#F0A500' }} />Map Legend
                </h3>
                <div className="space-y-2.5">
                  {LEGEND.map(l => (
                    <div key={l.label} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: l.color }} />
                      <span className="text-xs" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-display font-bold text-sm mb-2" style={{ color: '#1A0A35' }}>
                  <i className="fas fa-info-circle mr-2" style={{ color: '#5B2D8E' }} />How to Use
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                  Click any pin on the map to see details about that location. Click the map background to deselect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* List view of all locations */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3">All Locations</div>
            <h2 className="section-title">
              Places of <span>Nkenkak-Ngiesang</span>
            </h2>
            <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Twelve key locations that define the life, history, and spirit of our village.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOCATIONS.map(loc => (
              <div key={loc.id}
                className="card p-5 cursor-pointer group"
                onClick={() => {
                  setSelectedPin(loc.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: loc.bgColor, border: `1.5px solid ${loc.pinColor}25` }}>
                    <i className={`fas ${loc.icon} text-lg`} style={{ color: loc.pinColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1"
                      style={{ background: loc.bgColor, color: loc.pinColor }}>
                      {loc.badge}
                    </span>
                    <h3 className="font-display font-semibold text-sm leading-snug" style={{ color: '#1A0A35' }}>
                      {loc.name}
                    </h3>
                    <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      {loc.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage CTA */}
      <section className="py-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>Explore More</div>
          <h2 className="section-title-white mb-4">
            Discover Our <span style={{ color: '#F0A500' }}>Village History</span>
          </h2>
          <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            The map is just the beginning. Dive into our full cultural heritage, governance structure, and community calendar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/governance" className="btn-gold">
              <i className="fas fa-landmark" />Governance
            </Link>
            <Link to="/cultural-calendar" className="btn-outline-white">
              <i className="fas fa-calendar-alt" />Cultural Calendar
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
