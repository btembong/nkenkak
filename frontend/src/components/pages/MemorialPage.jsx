import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse" style={{ background: 'rgba(91,45,142,0.06)', height: 380 }} />
  )
}

function YearRange({ birthYear, deathYear }) {
  if (!birthYear && !deathYear) return null
  if (birthYear && !deathYear) return <span style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif', fontSize: 13 }}>Born {birthYear}</span>
  return <span style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif', fontSize: 13 }}>{birthYear} &ndash; {deathYear}</span>
}

function MemorialCard({ person }) {
  return (
    <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
      {/* Photo */}
      <div className="flex items-center justify-center pt-8 pb-4">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-24 h-24 object-cover rounded-xl"
            style={{ border: '2px solid rgba(240,165,0,0.4)' }}
          />
        ) : (
          <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: 'rgba(240,165,0,0.08)', border: '2px solid rgba(240,165,0,0.2)' }}>
            <i className="fas fa-user text-3xl" style={{ color: '#F0A500' }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-5 flex flex-col">
        <h3 className="font-display font-bold text-lg text-white mb-0.5 leading-snug">{person.name}</h3>
        {person.role && <p className="text-sm font-semibold mb-1" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>{person.role}</p>}
        <YearRange birthYear={person.birthYear} deathYear={person.deathYear} />

        {person.bio && (
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {person.bio}
          </p>
        )}

        {/* Achievement pills */}
        {person.achievements?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {person.achievements.slice(0, 3).map((a, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(240,165,0,0.12)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.2)', fontFamily: 'Poppins,sans-serif' }}>
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Gold divider strip */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,rgba(240,165,0,0.55),transparent)' }} />
    </div>
  )
}

function HeroCard({ person }) {
  return (
    <div className="card flex flex-col overflow-hidden relative" style={{ borderLeft: '4px solid #F0A500' }}>
      {/* Crown icon */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
        <i className="fas fa-crown text-white text-xs" />
      </div>

      {/* Photo */}
      <div className="flex items-center justify-center pt-8 pb-4">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-24 h-24 object-cover rounded-xl"
            style={{ border: '2px solid rgba(91,45,142,0.25)' }}
          />
        ) : (
          <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.07)', border: '2px solid rgba(91,45,142,0.15)' }}>
            <i className="fas fa-user text-3xl" style={{ color: '#5B2D8E' }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <h3 className="font-display font-bold text-lg mb-0.5 leading-snug" style={{ color: '#1A0A35' }}>{person.name}</h3>
        {person.role && <p className="text-sm font-semibold mb-1" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>{person.role}</p>}
        {(person.birthYear || person.deathYear) && (
          <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            {person.birthYear && !person.deathYear ? `Born ${person.birthYear}` : `${person.birthYear || ''} – ${person.deathYear || ''}`}
          </span>
        )}

        {person.bio && (
          <p className="text-sm mt-3 leading-relaxed" style={{ color: '#555', fontFamily: 'Poppins,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {person.bio}
          </p>
        )}

        {person.achievements?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {person.achievements.slice(0, 3).map((a, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(91,45,142,0.09)', color: '#5B2D8E', border: '1px solid rgba(91,45,142,0.14)', fontFamily: 'Poppins,sans-serif' }}>
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MemorialPage() {
  const [tab, setTab] = useState('memorial')

  const { data: memorialData, isLoading: loadingMemorial } = useQuery(
    'memorial-memorial',
    () => api.get('/memorial?type=memorial').then(r => r.data),
    { staleTime: 60000 }
  )

  const { data: heroData, isLoading: loadingHero } = useQuery(
    'memorial-hero',
    () => api.get('/memorial?type=hero').then(r => r.data),
    { staleTime: 60000 }
  )

  const memorialList = memorialData || []
  const heroList = heroData || []
  const isLoading = tab === 'memorial' ? loadingMemorial : loadingHero
  const list = tab === 'memorial' ? memorialList : heroList

  const tabs = [
    { key: 'memorial', label: 'In Memoriam', icon: 'fa-dove' },
    { key: 'hero', label: 'Village Heroes', icon: 'fa-star' },
  ]

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F0A500 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7B4DB8 0%, transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-dove text-[10px]" />In Memory &amp; In Honour
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            In Memory &amp; <span style={{ color: '#F0A500' }}>In Honour</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Remembering those who came before us and celebrating those who continue to build our community.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-[10px]" />Home</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>Memorial</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl p-1.5" style={{ background: '#fff', boxShadow: '0 4px 20px rgba(91,45,142,0.10)' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: tab === t.key ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'transparent',
                  color: tab === t.key ? '#fff' : '#5B2D8E',
                  fontFamily: 'Sora,sans-serif',
                  boxShadow: tab === t.key ? '0 4px 14px rgba(91,45,142,0.3)' : 'none',
                }}>
                <i className={`fas ${t.icon} text-xs`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intro text */}
        <p className="text-center text-sm mb-10 max-w-xl mx-auto" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          {tab === 'memorial'
            ? 'We honour those who built this village with their hands, wisdom, and sacrifice.'
            : 'Recognising the extraordinary contributions of our community members.'}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <i className="fas fa-dove text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }} />
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No entries yet</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Admin can add from the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(person =>
              tab === 'memorial'
                ? <MemorialCard key={person.id} person={person} />
                : <HeroCard key={person.id} person={person} />
            )}
          </div>
        )}

        {/* Nominate CTA */}
        <div className="mt-16 rounded-3xl py-12 px-8 text-center" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
            <i className="fas fa-hand-holding-heart text-white text-xl" />
          </div>
          <h3 className="font-display font-bold text-2xl text-white mb-2">
            {tab === 'memorial' ? 'Know someone to honour?' : 'Nominate a Village Hero'}
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
            {tab === 'memorial'
              ? 'Help us preserve the memory of our elders and contributors.'
              : 'Do you know someone whose contributions deserve recognition? Let us know.'}
          </p>
          <Link to="/contact" className="btn-gold inline-flex items-center gap-2">
            <i className="fas fa-paper-plane text-xs" />Nominate Someone
          </Link>
        </div>
      </div>
    </div>
  )
}
