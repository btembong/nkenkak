import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

const CATEGORIES = [
  { key: 'agriculture', label: 'Agriculture', icon: 'fa-tractor' },
  { key: 'crafts',      label: 'Crafts',      icon: 'fa-paint-brush' },
  { key: 'retail',      label: 'Retail',      icon: 'fa-store' },
  { key: 'services',    label: 'Services',    icon: 'fa-concierge-bell' },
  { key: 'tech',        label: 'Tech',        icon: 'fa-laptop-code' },
  { key: 'health',      label: 'Health',      icon: 'fa-heartbeat' },
  { key: 'education',   label: 'Education',   icon: 'fa-graduation-cap' },
  { key: 'construction',label: 'Construction',icon: 'fa-hard-hat' },
  { key: 'food',        label: 'Food',        icon: 'fa-utensils' },
  { key: 'other',       label: 'Other',       icon: 'fa-briefcase' },
]

function catIcon(key) {
  return CATEGORIES.find(c => c.key === key)?.icon || 'fa-briefcase'
}
function catLabel(key) {
  return CATEGORIES.find(c => c.key === key)?.label || key
}

export default function BusinessDirectoryPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [diasporaOnly, setDiasporaOnly] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: businesses = [], isLoading } = useQuery(
    'businesses',
    () => api.get('/businesses').then(r => r.data)
  )

  const submitMut = useMutation(data => api.post('/businesses/submit', data), {
    onSuccess: () => {
      toast.success('Business submitted for review!')
      qc.invalidateQueries('businesses')
      setShowSubmitModal(false)
      reset()
    },
    onError: () => toast.error('Submission failed. Please try again.'),
  })

  const filtered = businesses.filter(b => {
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || b.category === activeCategory
    const matchDiaspora = !diasporaOnly || b.isDiaspora
    return matchSearch && matchCat && matchDiaspora
  })

  const featured = filtered.filter(b => b.isFeatured)
  const regular  = filtered.filter(b => !b.isFeatured)
  const diasporaCount = businesses.filter(b => b.isDiaspora).length
  const categoryCount = new Set(businesses.map(b => b.category)).size

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <span className="eyebrow">Nkenkak-Ngiesang</span>
        <h1 className="font-display font-bold text-4xl text-white mb-3 mt-2">Village Business Directory</h1>
        <p className="text-base mb-4" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif', maxWidth: '520px', margin: '0 auto 16px' }}>
          Discover and support local and diaspora-run businesses from our community.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs" />Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>Business Directory</span>
        </div>
      </div>

      {/* Stats */}
      <div className="py-8 bg-white" style={{ borderBottom: '1px solid rgba(91,45,142,0.06)' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Total Listings',      value: businesses.length, icon: 'fa-store' },
            { label: 'Diaspora Businesses', value: diasporaCount,     icon: 'fa-globe-africa' },
            { label: 'Categories',          value: categoryCount,     icon: 'fa-th-large' },
          ].map(s => (
            <div key={s.label}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(91,45,142,0.08)' }}>
                <i className={`fas ${s.icon} text-lg`} style={{ color: '#5B2D8E' }} />
              </div>
              <div className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Filters */}
          <div className="mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A3A3A3' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search businesses, owners, descriptions…"
                  className="input pl-10"
                />
              </div>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer select-none"
                style={{ background: diasporaOnly ? 'rgba(91,45,142,0.1)' : 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.15)', fontFamily: 'Poppins,sans-serif', fontSize: '0.875rem', color: diasporaOnly ? '#5B2D8E' : '#737373', fontWeight: diasporaOnly ? 600 : 400 }}>
                <div className={`w-9 h-5 rounded-full relative transition-all ${diasporaOnly ? 'bg-purple-700' : 'bg-gray-300'}`}
                  onClick={() => setDiasporaOnly(p => !p)}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${diasporaOnly ? 'left-4' : 'left-0.5'}`} />
                </div>
                Diaspora Only
              </label>
              <button onClick={() => setShowSubmitModal(true)} className="btn-gold whitespace-nowrap">
                <i className="fas fa-plus-circle" />List Your Business
              </button>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{ background: activeCategory === 'all' ? '#5B2D8E' : 'rgba(91,45,142,0.06)', color: activeCategory === 'all' ? '#fff' : '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-th-large text-[10px]" />All
              </button>
              {CATEGORIES.map(c => (
                <button key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{ background: activeCategory === c.key ? '#5B2D8E' : 'rgba(91,45,142,0.06)', color: activeCategory === c.key ? '#fff' : '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                  <i className={`fas ${c.icon} text-[10px]`} />{c.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-48 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />
              ))}
            </div>
          ) : (
            <>
              {/* Featured section */}
              {featured.length > 0 && (
                <div className="mb-12">
                  <h2 className="section-title mb-6">Featured <span style={{ color: '#F0A500' }}>Businesses</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featured.map(b => (
                      <div key={b.id} className="card p-6 flex gap-5" style={{ border: '1.5px solid rgba(240,165,0,0.25)' }}>
                        <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                          {b.logoUrl
                            ? <img src={b.logoUrl} alt={b.name} className="w-full h-full object-cover rounded-2xl" />
                            : <i className={`fas ${catIcon(b.category)} text-2xl text-white`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>{b.name}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(240,165,0,0.12)', color: '#B07A00', fontFamily: 'Sora,sans-serif' }}>
                              <i className={`fas ${catIcon(b.category)} mr-1`} />{catLabel(b.category)}
                            </span>
                            {b.isDiaspora && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(91,45,142,0.1)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                                <i className="fas fa-globe-africa mr-1" />Diaspora
                              </span>
                            )}
                          </div>
                          {b.ownerName && <p className="text-xs mb-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Owner: {b.ownerName}</p>}
                          {b.description && <p className="text-sm mb-3" style={{ color: '#555', fontFamily: 'Poppins,sans-serif', lineHeight: 1.6 }}>{b.description}</p>}
                          <div className="flex flex-wrap gap-3">
                            {b.city && <span className="text-xs flex items-center gap-1" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-map-marker-alt text-[10px]" style={{ color: '#5B2D8E' }} />{b.city}{b.country ? `, ${b.country}` : ''}</span>}
                            {b.phone && <a href={`tel:${b.phone}`} className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-phone text-[10px]" />{b.phone}</a>}
                            {b.email && <a href={`mailto:${b.email}`} className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-envelope text-[10px]" />{b.email}</a>}
                            {b.website && <a href={b.website} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-globe text-[10px]" />Website</a>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All businesses grid */}
              {regular.length > 0 ? (
                <>
                  <h2 className="section-title mb-6">All <span style={{ color: '#F0A500' }}>Listings</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {regular.map(b => (
                      <div key={b.id} className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                            style={{ background: 'linear-gradient(135deg,rgba(91,45,142,0.15),rgba(91,45,142,0.05))' }}>
                            {b.logoUrl
                              ? <img src={b.logoUrl} alt={b.name} className="w-full h-full object-cover rounded-xl" />
                              : <i className={`fas ${catIcon(b.category)} text-lg`} style={{ color: '#5B2D8E' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-sm truncate" style={{ color: '#1A0A35' }}>{b.name}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                              {catLabel(b.category)}
                            </span>
                          </div>
                          {b.isDiaspora && <i className="fas fa-globe-africa flex-shrink-0 text-xs" style={{ color: '#F0A500' }} title="Diaspora business" />}
                        </div>
                        {b.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', lineHeight: 1.6 }}>{b.description}</p>}
                        <div className="space-y-1">
                          {b.city && <p className="text-xs flex items-center gap-1.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-map-marker-alt text-[10px]" style={{ color: '#5B2D8E' }} />{b.city}{b.country ? `, ${b.country}` : ''}</p>}
                          {b.phone && <a href={`tel:${b.phone}`} className="text-xs flex items-center gap-1.5 hover:underline" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-phone text-[10px]" />{b.phone}</a>}
                          {b.email && <a href={`mailto:${b.email}`} className="text-xs flex items-center gap-1.5 hover:underline" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-envelope text-[10px]" />{b.email}</a>}
                          {b.website && <a href={b.website} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1.5 hover:underline" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}><i className="fas fa-external-link-alt text-[10px]" />Visit Website</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
                  <i className="fas fa-store text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
                  <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No businesses found</h4>
                  <p className="text-sm mb-4" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Try adjusting your filters or be the first to list your business.</p>
                  <button onClick={() => setShowSubmitModal(true)} className="btn-secondary !text-sm !py-2 !px-5">List Your Business</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setShowSubmitModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <div>
                <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>List Your Business</h3>
                <p className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Your listing will be reviewed before publishing</p>
              </div>
              <button onClick={() => { setShowSubmitModal(false); reset() }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => submitMut.mutate({ ...d, is_diaspora: d.is_diaspora === true || d.is_diaspora === 'true' }))} className="p-7 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Business Name *</label>
                  <input {...register('name', { required: 'Business name is required' })} placeholder="e.g. Ngiesang Farms" className="input" />
                  {errors.name && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select {...register('category', { required: 'Category is required' })} className="input">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  {errors.category && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.category.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Briefly describe what your business does…" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Owner Name *</label>
                  <input {...register('ownerName', { required: 'Owner name is required' })} placeholder="Full name" className="input" />
                  {errors.ownerName && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.ownerName.message}</p>}
                </div>
                <div>
                  <label className="label">Location / Address</label>
                  <input {...register('location')} placeholder="Street or area" className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Country</label>
                  <input {...register('country')} placeholder="e.g. Cameroon" className="input" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input {...register('city')} placeholder="e.g. Bafoussam" className="input" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input {...register('phone')} placeholder="+237 6XX XXX XXX" className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" {...register('email')} placeholder="contact@yourbusiness.com" className="input" />
                </div>
              </div>
              <div>
                <label className="label">Website</label>
                <input {...register('website')} placeholder="https://yourbusiness.com" className="input" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('is_diaspora')} className="w-4 h-4 rounded" style={{ accentColor: '#5B2D8E' }} />
                <span className="text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>This is a Diaspora-run business (owner is based outside Cameroon)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowSubmitModal(false); reset() }}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={submitMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {submitMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Submitting…</> : <><i className="fas fa-paper-plane" />Submit Listing</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
