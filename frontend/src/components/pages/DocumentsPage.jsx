import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

const CATEGORIES = [
  { key: 'all',          label: 'All',          icon: 'fa-layer-group', color: '#4b0082' },
  { key: 'constitution', label: 'Constitution',  icon: 'fa-scroll',      color: '#2d004e' },
  { key: 'minutes',      label: 'Minutes',       icon: 'fa-file-alt',    color: '#430075' },
  { key: 'report',       label: 'Reports',       icon: 'fa-chart-bar',   color: '#4b0082' },
  { key: 'proposal',     label: 'Proposals',     icon: 'fa-lightbulb',   color: '#4b0082' },
  { key: 'policy',       label: 'Policy',        icon: 'fa-gavel',       color: '#430075' },
  { key: 'general',      label: 'General',       icon: 'fa-folder',      color: '#eeb549' },
]

const getCatMeta = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1]

function formatFileSize(bytes) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function FileTypeIcon({ fileType, color }) {
  let icon = 'fa-file'
  const ft = (fileType || '').toLowerCase()
  if (ft.includes('pdf')) icon = 'fa-file-pdf'
  else if (ft.includes('doc') || ft.includes('word')) icon = 'fa-file-word'
  else if (ft.includes('xls') || ft.includes('sheet')) icon = 'fa-file-excel'
  else if (ft.includes('ppt') || ft.includes('presentation')) icon = 'fa-file-powerpoint'
  else if (ft.includes('zip') || ft.includes('archive')) icon = 'fa-file-archive'
  else if (ft.includes('img') || ft.includes('png') || ft.includes('jpg') || ft.includes('jpeg')) icon = 'fa-file-image'
  return <i className={`fas ${icon} text-xl`} style={{ color }} />
}

function SkeletonRow() {
  return (
    <div className="rounded-2xl p-5 mb-3 animate-pulse flex items-center gap-4" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(75,0,130,0.04)' }}>
      <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: 'rgba(75,0,130,0.06)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded-full w-2/3" style={{ background: 'rgba(75,0,130,0.06)' }} />
        <div className="h-3 rounded-full w-1/3" style={{ background: 'rgba(75,0,130,0.04)' }} />
      </div>
      <div className="w-20 h-9 rounded-xl" style={{ background: 'rgba(75,0,130,0.06)' }} />
    </div>
  )
}

function DocumentRow({ doc, onDownload, isDownloading }) {
  const cat = getCatMeta(doc.category)
  const fileSize = formatFileSize(doc.fileSize)

  return (
    <div className="rounded-2xl px-5 py-4 mb-3 flex items-center gap-4 transition-all hover:shadow-md group"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.04)' }}>
      {/* File icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
        style={{ background: `${cat.color}12`, border: `1.5px solid ${cat.color}22` }}>
        <FileTypeIcon fileType={doc.fileType} color={cat.color} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-sm leading-snug mb-0.5 truncate" style={{ color: '#2d004e' }}>{doc.title}</h4>
        {doc.description && (
          <p className="text-xs truncate mb-1.5" style={{ color: '#737373', fontFamily: '"Exo 2",sans-serif' }}>{doc.description}</p>
        )}
        <div className="flex items-center flex-wrap gap-2">
          {doc.year && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082', fontFamily: '"Exo 2",sans-serif' }}>
              {doc.year}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${cat.color}10`, color: cat.color, fontFamily: '"Exo 2",sans-serif' }}>
            <i className={`fas ${cat.icon} text-[9px] mr-1`} />{cat.label}
          </span>
          {fileSize && (
            <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>{fileSize}</span>
          )}
          {doc.downloads > 0 && (
            <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
              <i className="fas fa-download text-[9px] mr-1" />{doc.downloads.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={() => onDownload(doc)}
        disabled={isDownloading}
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-60"
        style={{
          background: isDownloading ? 'rgba(75,0,130,0.06)' : 'linear-gradient(135deg,#4b0082,#a57fc0)',
          color: isDownloading ? '#A3A3A3' : '#fff',
          fontFamily: '"Exo 2",sans-serif',
          boxShadow: isDownloading ? 'none' : '0 4px 14px rgba(75,0,130,0.28)',
          cursor: isDownloading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}>
        {isDownloading
          ? <><i className="fas fa-spinner fa-spin text-[10px]" /> Opening…</>
          : <><i className="fas fa-download text-[10px]" /> Download</>}
      </button>
    </div>
  )
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [downloading, setDownloading] = useState(new Set())

  const { data, isLoading } = useQuery(
    'documents',
    () => api.get('/documents').then(r => r.data),
    { staleTime: 60000 }
  )

  const docs = data || []

  const filtered = docs.filter(d => {
    const matchesCat = activeCategory === 'all' || d.category === activeCategory
    const matchesSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || (d.description || '').toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const totalDownloads = docs.reduce((sum, d) => sum + (d.downloads || 0), 0)
  const uniqueCategories = [...new Set(docs.map(d => d.category).filter(Boolean))].length

  const handleDownload = async (doc) => {
    if (downloading.has(doc.id)) return
    setDownloading(prev => new Set([...prev, doc.id]))
    try {
      await api.post(`/documents/${doc.id}/download`)
    } catch (_) {
      // silently ignore counter errors
    }
    if (doc.fileUrl) window.open(doc.fileUrl, '_blank', 'noopener,noreferrer')
    setDownloading(prev => { const n = new Set(prev); n.delete(doc.id); return n })
  }

  return (
    <div style={{ background: '#F3EDF8', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a57fc0 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4b0082 0%, transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(75,0,130,0.15)', color: '#eeb549', border: '1px solid rgba(75,0,130,0.25)' }}>
            <i className="fas fa-archive text-[10px]" />Document Archive
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Village <span style={{ color: '#eeb549' }}>Document Archive</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: '"Exo 2",sans-serif' }}>
            Official records, meeting minutes, constitutions, and reports for Nkenkak-Ngiesang.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: '"Exo 2",sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-[10px]" />Home</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{ color: '#eeb549' }} />
            <span style={{ color: '#eeb549' }}>Documents</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && docs.length > 0 && (
        <div className="bg-white border-b" style={{ borderColor: 'rgba(75,0,130,0.06)' }}>
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Total Documents', value: docs.length, icon: 'fa-file-alt' },
              { label: 'Total Downloads', value: totalDownloads.toLocaleString(), icon: 'fa-download' },
              { label: 'Categories', value: uniqueCategories, icon: 'fa-layer-group' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ background: 'rgba(75,0,130,0.07)' }}>
                  <i className={`fas ${s.icon} text-xs`} style={{ color: '#4b0082' }} />
                </div>
                <div className="font-display font-bold text-xl" style={{ color: '#2d004e' }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#737373', fontFamily: '"Exo 2",sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Filter card */}
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ boxShadow: '0 1px 10px rgba(75,0,130,0.08)', border: '1px solid rgba(75,0,130,0.08)' }}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
            <div>
              <h2 className="font-display font-bold text-sm text-dark">Document Archive</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(75,0,130,0.45)' }}>Filter by category or search</p>
            </div>
            {!isLoading && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082' }}>
                {filtered.length} document{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Segmented control */}
          <div className="overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
            <div className="flex items-center p-1 rounded-2xl w-max"
              style={{ background: 'rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.09)' }}>
              {CATEGORIES.flatMap((c, i) => {
                const active = activeCategory === c.key
                const prevActive = i > 0 && activeCategory === CATEGORIES[i - 1].key
                const sep = i > 0 && !active && !prevActive
                  ? [<div key={`sep-${c.key}`} className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(75,0,130,0.13)' }} />]
                  : []
                return [...sep, (
                  <button key={c.key} onClick={() => setActiveCategory(c.key)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap"
                    style={{
                      background: active ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : 'transparent',
                      color:      active ? '#fff' : '#A3A3A3',
                      boxShadow:  active ? '0 2px 10px rgba(75,0,130,0.28)' : 'none',
                      fontFamily: '"Exo 2",sans-serif',
                    }}>
                    <i className={`fas ${c.icon} text-[9px]`} />{c.label}
                  </button>
                )]
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A3A3A3' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents by title or description…"
              className="w-full pl-11 pr-10 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#F6F2FA', color: '#2d004e', fontFamily: '"Exo 2",sans-serif', border: '1px solid rgba(75,0,130,0.07)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Document list */}
        {isLoading ? (
          <div>{[1, 2, 3, 4, 5, 6].map(i => <SkeletonRow key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(75,0,130,0.02)', border: '1px dashed rgba(75,0,130,0.12)' }}>
            <i className="fas fa-folder-open text-5xl mb-4 block" style={{ color: 'rgba(75,0,130,0.18)' }} />
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#2d004e' }}>No documents found</h3>
            <p className="text-sm mb-4" style={{ color: '#737373', fontFamily: '"Exo 2",sans-serif' }}>
              {search ? `Nothing matched "${search}".` : 'No documents in this category yet.'}
            </p>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
              <i className="fas fa-info-circle mr-1" />Documents can be uploaded from the Admin Panel.
            </p>
          </div>
        ) : (
          <div>
            {filtered.map(doc => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onDownload={handleDownload}
                isDownloading={downloading.has(doc.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
