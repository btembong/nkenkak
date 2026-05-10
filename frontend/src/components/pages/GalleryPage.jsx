import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

const CATEGORIES = ['All', 'Projects', 'Culture', 'Events', 'Community', 'Nature']
const MEDIA_TABS  = [
  { id: 'all',   label: 'All Media',  icon: 'fa-th' },
  { id: 'image', label: 'Photos',     icon: 'fa-image' },
  { id: 'video', label: 'Videos',     icon: 'fa-play-circle' },
]

// Placeholder tiles shown when DB has no items
const PLACEHOLDERS = [
  { id:'p1', title:'Annual Harvest Festival', tags:['Culture'], bg:'linear-gradient(135deg,#1A0A35,#5B2D8E)', icon:'fa-drum', isFeatured:true },
  { id:'p2', title:'Village Youth Day', tags:['Community'], bg:'linear-gradient(135deg,#250F47,#7B4DB8)', icon:'fa-users' },
  { id:'p3', title:'Water Pipeline Works', tags:['Projects'], bg:'linear-gradient(135deg,#3D1A6B,#5B2D8E)', icon:'fa-water' },
  { id:'p4', title:'Traditional Attire', tags:['Culture'], bg:'linear-gradient(135deg,#4A2478,#9B6FD8)', icon:'fa-tshirt' },
  { id:'p5', title:'School Renovation', tags:['Projects'], bg:'linear-gradient(135deg,#1A0A35,#3D1A6B)', icon:'fa-school', isFeatured:true },
  { id:'p6', title:'Village Landscape', tags:['Nature'], bg:'linear-gradient(135deg,#2D0B55,#5B2D8E)', icon:'fa-mountain' },
  { id:'p7', title:'Diaspora Forum 2024', tags:['Events'], bg:'linear-gradient(135deg,#3D1A6B,#7B4DB8)', icon:'fa-globe-africa' },
  { id:'p8', title:'Cultural Dance', tags:['Culture'], bg:'linear-gradient(135deg,#250F47,#5B2D8E)', icon:'fa-music' },
  { id:'p9', title:'Harvest Feast', tags:['Community'], bg:'linear-gradient(135deg,#1A0A35,#4A2478)', icon:'fa-utensils' },
  { id:'p10',title:'Village Farms', tags:['Nature'], bg:'linear-gradient(135deg,#16a34a,#1A0A35)', icon:'fa-seedling' },
  { id:'p11',title:'Elders Meeting', tags:['Community'], bg:'linear-gradient(135deg,#3D1A6B,#5B2D8E)', icon:'fa-handshake' },
  { id:'p12',title:'Night Festival', tags:['Events'], bg:'linear-gradient(135deg,#1A0A35,#250F47)', icon:'fa-star' },
]

function isVideo(item) {
  return item.mediaType === 'video' || /\.(mp4|webm|ogg)$/i.test(item.url || '')
}

function GalleryTile({ item, index, onClick }) {
  const video = isVideo(item)
  const hasImg = !!item.url
  const ph = PLACEHOLDERS[index % PLACEHOLDERS.length]

  return (
    <div
      onClick={() => onClick(item, index)}
      className="group relative overflow-hidden cursor-pointer rounded-2xl"
      style={{ breakInside: 'avoid', marginBottom: '12px' }}
    >
      {hasImg ? (
        <img
          src={item.url}
          alt={item.title || ''}
          loading="lazy"
          className="w-full object-cover block group-hover:scale-105 transition-transform duration-500"
          style={{ minHeight: 140 }}
        />
      ) : (
        <div className="w-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: item.bg || ph.bg, minHeight: 180, aspectRatio: index % 5 === 0 ? '4/5' : index % 3 === 0 ? '16/9' : '1/1' }}>
          <div className="wave-pattern absolute inset-0" />
          <i className={`fas ${item.icon || ph.icon} text-5xl relative z-10 mb-2`}
            style={{ color: 'rgba(240,165,0,0.25)' }} />
          <span className="text-xs relative z-10 px-3 text-center tracking-wide"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Poppins,sans-serif' }}>
            {item.title || ph.title}
          </span>
        </div>
      )}

      {/* Video badge */}
      {video && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(26,10,53,0.85)', color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
          <i className="fas fa-play text-[8px]" /> VIDEO
        </div>
      )}

      {/* Featured badge */}
      {item.isFeatured && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
          <i className="fas fa-star text-[10px] text-white" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: 'linear-gradient(to top, rgba(26,10,53,0.9) 0%, rgba(91,45,142,0.6) 100%)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(240,165,0,0.2)', border: '1.5px solid rgba(240,165,0,0.4)' }}>
          <i className={`fas ${video ? 'fa-play' : 'fa-expand'} text-sm`} style={{ color: '#F0A500' }} />
        </div>
        {item.title && (
          <p className="text-xs font-semibold text-center px-3 line-clamp-2"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Poppins,sans-serif' }}>
            {item.title}
          </p>
        )}
        {item.tags?.length > 0 && (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(240,165,0,0.2)', color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
            {item.tags[0]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const [mainTab,    setMainTab]    = useState('photos') // photos | albums
  const [mediaTab,   setMediaTab]   = useState('all')
  const [activeCat,  setActiveCat]  = useState('All')
  const [search,     setSearch]     = useState('')
  const [lightbox,   setLightbox]   = useState(null)
  const [lbIdx,      setLbIdx]      = useState(0)
  const [openAlbum,  setOpenAlbum]  = useState(null)

  const { data: raw = [], isLoading } = useQuery('gallery', () => api.get('/gallery').then(r => r.data))
  const { data: albums = [] } = useQuery('gallery-albums', () => api.get('/gallery-albums').then(r => r.data))
  const { data: albumItems } = useQuery(
    ['album-items', openAlbum?.id],
    () => api.get(`/gallery-albums/${openAlbum.id}/items`).then(r => r.data),
    { enabled: !!openAlbum }
  )

  const source = raw.length ? raw : PLACEHOLDERS

  // Filter chain
  const filtered = source.filter(item => {
    const matchMedia = mediaTab === 'all' || (mediaTab === 'video' ? isVideo(item) : !isVideo(item))
    const matchCat   = activeCat === 'All' || item.tags?.some(t => t.toLowerCase() === activeCat.toLowerCase())
    const matchSearch = !search || (item.title || '').toLowerCase().includes(search.toLowerCase())
    return matchMedia && matchCat && matchSearch
  })

  // Split into 3 columns for masonry
  const cols = [[], [], []]
  filtered.forEach((item, i) => cols[i % 3].push({ item, origIdx: i }))

  // Lightbox nav
  const openLightbox = (item, idx) => { setLightbox(item); setLbIdx(idx) }
  const prev = useCallback(() => {
    const ni = (lbIdx - 1 + filtered.length) % filtered.length
    setLightbox(filtered[ni]); setLbIdx(ni)
  }, [lbIdx, filtered])
  const next = useCallback(() => {
    const ni = (lbIdx + 1) % filtered.length
    setLightbox(filtered[ni]); setLbIdx(ni)
  }, [lbIdx, filtered])

  // Keyboard nav
  useEffect(() => {
    if (!lightbox) return
    const handler = e => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightbox(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  const photoCount = source.filter(i => !isVideo(i)).length
  const videoCount = source.filter(i => isVideo(i)).length

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
          Visual Stories
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">
          Village <span style={{ color: '#F0A500' }}>Gallery</span>
        </h1>
        <p className="text-sm max-w-lg mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          Photos, videos and memories from Nkenkak-Ngiesang — our celebrations, projects, and everyday life.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs" />Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>Gallery</span>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-image text-sm" style={{ color: '#F0A500' }} />
              <span className="font-display font-bold text-white">{photoCount}</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>Photos</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-video text-sm" style={{ color: '#F0A500' }} />
              <span className="font-display font-bold text-white">{videoCount}</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>Videos</span>
            </div>
          </div>
          {/* Main tabs */}
          <div className="flex gap-2">
            {[['photos','fa-images','Photos & Videos'],['albums','fa-layer-group','Albums']].map(([val,icon,label]) => (
              <button key={val} onClick={() => setMainTab(val)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: mainTab === val ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.05)',
                  color: mainTab === val ? '#F0A500' : 'rgba(255,255,255,0.5)',
                  border: `1px solid ${mainTab === val ? 'rgba(240,165,0,0.4)' : 'transparent'}`,
                  fontFamily: 'Sora,sans-serif',
                }}>
                <i className={`fas ${icon} text-[10px]`}/>{label}
              </button>
            ))}
            {mainTab === 'photos' && MEDIA_TABS.map(t => (
              <button key={t.id} onClick={() => setMediaTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: mediaTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: mediaTab === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Sora,sans-serif',
                }}>
                <i className={`fas ${t.icon} text-[10px]`}/>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Albums view */}
      {mainTab === 'albums' && (
        <section className="py-12" style={{background:'#F8F5FC'}}>
          <div className="max-w-6xl mx-auto px-6">
            {openAlbum ? (
              <div>
                <button onClick={() => setOpenAlbum(null)} className="flex items-center gap-2 text-sm font-semibold mb-6" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                  <i className="fas fa-arrow-left text-xs"/>All Albums
                </button>
                <h2 className="font-display font-bold text-2xl mb-1" style={{color:'#1A0A35'}}>{openAlbum.title}</h2>
                {openAlbum.description && <p className="text-sm mb-6" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{openAlbum.description}</p>}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(albumItems?.items || []).map((item, i) => (
                    <GalleryTile key={item.id} item={item} index={i} onClick={(it, idx) => { setLightbox(albumItems.items); setLbIdx(idx) }}/>
                  ))}
                </div>
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-24 rounded-3xl" style={{background:'rgba(91,45,142,0.03)',border:'1px dashed rgba(91,45,142,0.1)'}}>
                <i className="fas fa-layer-group text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.12)'}}/>
                <h3 className="font-display font-bold text-xl mb-2" style={{color:'#1A0A35'}}>No albums yet</h3>
                <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Albums are created by admins to group related photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {albums.map(album => (
                  <button key={album.id} onClick={() => setOpenAlbum(album)}
                    className="group rounded-3xl overflow-hidden text-left transition-all hover:-translate-y-1"
                    style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)',boxShadow:'0 4px 20px rgba(91,45,142,0.06)'}}>
                    <div className="aspect-video overflow-hidden" style={{background:'linear-gradient(135deg,#1A0A35,#5B2D8E)'}}>
                      {album.items?.[0]?.url
                        ? <img src={album.items[0].thumbnail || album.items[0].url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-images text-4xl" style={{color:'rgba(255,255,255,0.2)'}}/></div>
                      }
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-base" style={{color:'#1A0A35'}}>{album.title}</h3>
                      {album.description && <p className="text-xs mt-0.5 line-clamp-1" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{album.description}</p>}
                      <p className="text-xs mt-2 font-semibold" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                        {album._count?.items || 0} items <i className="fas fa-arrow-right ml-1 text-[10px]"/>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {mainTab === 'photos' && <section className="py-12" style={{ background: '#F8F5FC' }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* Category + search row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-8">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setActiveCat(c)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: activeCat === c ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                    color: activeCat === c ? '#fff' : '#5B2D8E',
                    fontFamily: 'Sora,sans-serif',
                    border: `1.5px solid ${activeCat === c ? 'transparent' : 'rgba(91,45,142,0.12)'}`,
                    boxShadow: activeCat === c ? '0 4px 12px rgba(91,45,142,0.25)' : 'none',
                  }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#A3A3A3' }} />
              <input
                type="text"
                placeholder="Search gallery…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input !pl-10 !w-52"
              />
            </div>
          </div>

          {/* Results count */}
          {!isLoading && (
            <p className="text-xs mb-6" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
              {search && <> matching "<span style={{ color: '#5B2D8E' }}>{search}</span>"</>}
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.06)', height: i % 3 === 0 ? 280 : 200 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.1)' }}>
              <i className="fas fa-images text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No items found</h3>
              <p className="text-sm mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Try adjusting your filters or search term.</p>
              <button onClick={() => { setActiveCat('All'); setSearch(''); setMediaTab('all') }} className="btn-secondary !text-xs !py-2 !px-5">
                <i className="fas fa-undo text-[10px]" />Reset Filters
              </button>
            </div>
          ) : (
            /* 3-column masonry */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" style={{ alignItems: 'start' }}>
              {cols.map((col, ci) => (
                <div key={ci}>
                  {col.map(({ item, origIdx }) => (
                    <GalleryTile key={item.id || origIdx} item={item} index={origIdx} onClick={openLightbox} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Upload CTA */}
          <div className="mt-12 rounded-3xl p-8 text-center" style={{ background: 'linear-gradient(135deg,#250F47,#3D1A6B)', border: '1px solid rgba(240,165,0,0.1)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
              <i className="fas fa-camera text-2xl" style={{ color: '#F0A500' }} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Share Your Memories</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
              Community member with photos or videos? Upload them to the gallery and preserve our shared history.
            </p>
            <Link to="/portal" className="btn-gold">
              <i className="fas fa-upload" />Upload to Gallery
            </Link>
          </div>
        </div>
      </section>}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10,4,26,0.97)', backdropFilter: 'blur(16px)' }}
          onClick={() => setLightbox(null)}>

          {/* Close */}
          <button onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="fas fa-times" />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
            {lbIdx + 1} / {filtered.length}
          </div>

          {/* Prev */}
          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 md:left-6 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="fas fa-chevron-left" />
          </button>

          {/* Main content */}
          <div className="max-w-4xl w-full mx-20 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            {lightbox.url ? (
              isVideo(lightbox) ? (
                <video src={lightbox.url} controls autoPlay className="w-full rounded-2xl max-h-[70vh]" style={{ boxShadow: '0 0 80px rgba(91,45,142,0.4)' }} />
              ) : (
                <img src={lightbox.url} alt={lightbox.title || ''} className="w-full rounded-2xl max-h-[75vh] object-contain"
                  style={{ boxShadow: '0 0 80px rgba(91,45,142,0.4)' }} />
              )
            ) : (
              <div className="w-full aspect-video rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
                style={{ background: lightbox.bg || 'linear-gradient(135deg,#250F47,#5B2D8E)', boxShadow: '0 0 80px rgba(91,45,142,0.4)' }}>
                <div className="wave-pattern absolute inset-0" />
                <i className={`fas ${lightbox.icon || 'fa-image'} text-8xl relative z-10 mb-4`} style={{ color: 'rgba(240,165,0,0.3)' }} />
                <span className="text-sm relative z-10" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
                  {lightbox.title || lightbox.label}
                </span>
              </div>
            )}

            {/* Caption row */}
            <div className="mt-4 flex items-center justify-between w-full px-1">
              <div>
                {lightbox.title && (
                  <p className="font-display font-semibold text-white">{lightbox.title}</p>
                )}
                {lightbox.tags?.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {lightbox.tags.map(t => (
                      <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins,sans-serif' }}>
                ← → keys to navigate
              </p>
            </div>
          </div>

          {/* Next */}
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 md:right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      )}
    </div>
  )
}
