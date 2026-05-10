import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

function AdminAlbums() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: albums = [] } = useQuery('admin-albums', () => api.get('/gallery-albums?all=1').then(r => r.data))

  const createMut = useMutation(d => api.post('/gallery-albums', d), {
    onSuccess: () => { qc.invalidateQueries('admin-albums'); toast.success('Album created!'); setShowForm(false); reset() }
  })
  const deleteMut = useMutation(id => api.delete(`/gallery-albums/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-albums'); toast.success('Deleted') }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-lg" style={{color:'#1A0A35'}}>Albums</h3>
        <button onClick={() => setShowForm(true)} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]"/>New Album
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-14 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
          <i className="fas fa-layer-group text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.12)'}}/>
          <p className="text-sm" style={{color:'#737373'}}>No albums yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {albums.map(album => (
            <div key={album.id} className="rounded-2xl overflow-hidden" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)'}}>
              <div className="aspect-video flex items-center justify-center" style={{background:'linear-gradient(135deg,#1A0A35,#5B2D8E)'}}>
                {album.coverUrl
                  ? <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover"/>
                  : <i className="fas fa-images text-3xl" style={{color:'rgba(255,255,255,0.2)'}}/>}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm mb-0.5" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{album.title}</h4>
                <p className="text-xs mb-3" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{album._count?.items || 0} items</p>
                <button onClick={() => { if (confirm('Delete album?')) deleteMut.mutate(album.id) }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{background:'rgba(220,38,38,0.08)',color:'#dc2626'}}>
                  <i className="fas fa-trash text-[10px] mr-1"/>Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:'rgba(26,10,53,0.8)',backdropFilter:'blur(8px)'}}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md" style={{boxShadow:'0 32px 80px rgba(26,10,53,0.25)'}}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{borderColor:'rgba(91,45,142,0.08)'}}>
              <h3 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>New Album</h3>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{color:'#A3A3A3'}}><i className="fas fa-times"/></button>
            </div>
            <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="p-7 space-y-4">
              <div>
                <label className="label">Album Title *</label>
                <input {...register('title', {required:true})} className="input" placeholder="e.g. Annual Festival 2024"/>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={2} className="input resize-none"/>
              </div>
              <div>
                <label className="label">Cover Image URL</label>
                <input {...register('coverUrl')} className="input" placeholder="https://…"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{background:'rgba(91,45,142,0.05)',color:'#737373',border:'1px solid rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>Cancel</button>
                <button type="submit" disabled={createMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {createMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Creating…</> : <><i className="fas fa-plus"/>Create Album</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminGallery() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('items')
  const [showForm, setShowForm] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: items, isLoading } = useQuery('admin-gallery', () => api.get('/gallery?all=1').then(r => r.data))
  const { data: projects } = useQuery('projects-mini', () => api.get('/projects?limit=50').then(r => r.data.projects))

  const createMut = useMutation(data => api.post('/gallery', data), {
    onSuccess: () => { qc.invalidateQueries('admin-gallery'); toast.success('Item added!'); setShowForm(false); reset() }
  })
  const deleteMut = useMutation(id => api.delete(`/gallery/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-gallery'); toast.success('Deleted'); setLightbox(null) }
  })
  const featureMut = useMutation(({ id, is_featured }) => api.patch(`/gallery/${id}`, { is_featured: !is_featured }), {
    onSuccess: () => qc.invalidateQueries('admin-gallery')
  })

  const filtered = items?.filter(i => filterType === 'all' || i.media_type === filterType)

  const PLACEHOLDER_GRADS = [
    'linear-gradient(135deg,#250F47,#5B2D8E)',
    'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
    'linear-gradient(135deg,#5B2D8E,#9B6FD8)',
    'linear-gradient(135deg,#4A2478,#7B4DB8)',
    'linear-gradient(135deg,#1A0A35,#3D1A6B)',
    'linear-gradient(135deg,#2E1278,#5B2D8E)',
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-images text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Gallery Manager</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{items?.length || 0} items · {items?.filter(i => i.is_featured).length || 0} featured</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Add Item
        </button>
      </div>

      {/* Main tabs */}
      <div className="flex gap-2 mb-5">
        {[['items','fa-images','Media Items'],['albums','fa-layer-group','Albums']].map(([val,icon,label]) => (
          <button key={val} onClick={() => setTab(val)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: tab === val ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
              color: tab === val ? '#fff' : '#5B2D8E',
              boxShadow: '0 1px 6px rgba(91,45,142,0.1)',
              fontFamily: 'Sora,sans-serif',
            }}>
            <i className={`fas ${icon} text-[10px]`}/>{label}
          </button>
        ))}
      </div>

      {tab === 'albums' && <AdminAlbums/>}
      {tab === 'items' && <>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['all', 'image', 'video', 'document'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
            style={{
              background: filterType === t ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
              color: filterType === t ? '#fff' : '#5B2D8E',
              boxShadow: '0 1px 6px rgba(91,45,142,0.1)',
              fontFamily: 'Sora,sans-serif',
            }}>
            {t === 'all' ? 'All Types' : t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />)}
        </div>
      ) : filtered?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtered.map((item, i) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: '1', background: PLACEHOLDER_GRADS[i % PLACEHOLDER_GRADS.length] }}
              onClick={() => setLightbox(item)}>
              {item.url ? (
                <img src={item.url} alt={item.title || 'Gallery'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <i className={`fas ${item.media_type === 'video' ? 'fa-video' : 'fa-image'} text-3xl`} style={{ color: 'rgba(240,165,0,0.4)' }} />
                  <span className="text-[10px] px-2 text-center" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>{item.title || 'No image'}</span>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: 'rgba(26,10,53,0.7)' }}>
                <button onClick={e => { e.stopPropagation(); featureMut.mutate(item) }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: item.is_featured ? '#F0A500' : 'rgba(255,255,255,0.2)', color: '#fff' }}
                  title={item.is_featured ? 'Unfeature' : 'Feature'}>
                  <i className="fas fa-star text-xs" />
                </button>
                <button onClick={e => { e.stopPropagation(); if (confirm('Delete this item?')) deleteMut.mutate(item.id) }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(220,38,38,0.8)', color: '#fff' }}>
                  <i className="fas fa-trash text-xs" />
                </button>
              </div>
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {item.is_featured && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F0A500', color: '#fff' }}>Featured</span>
                )}
                {item.showInGallery === false && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(220,38,38,0.8)', color: '#fff' }}>Section only</span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent)' }}>
                {item.title && <p className="text-[10px] text-white truncate" style={{ fontFamily: 'Poppins,sans-serif' }}>{item.title}</p>}
                {item.tags?.length > 0 && (
                  <p className="text-[9px] truncate mt-0.5" style={{ color:'rgba(240,165,0,0.8)', fontFamily:'Poppins,sans-serif' }}>
                    {item.tags.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
          <i className="fas fa-images text-5xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No gallery items yet</h4>
          <button onClick={() => setShowForm(true)} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Add First Item</button>
        </div>
      )}

      </>}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,4,28,0.95)', backdropFilter: 'blur(12px)' }}
          onClick={e => e.target === e.currentTarget && setLightbox(null)}>
          <div className="max-w-2xl w-full rounded-3xl overflow-hidden" style={{ background: '#1A0A35', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="aspect-video flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {lightbox.url
                ? <img src={lightbox.url} alt={lightbox.title} className="max-w-full max-h-full object-contain" />
                : <i className="fas fa-image text-5xl" style={{ color: 'rgba(240,165,0,0.3)' }} />}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {lightbox.title && <h3 className="font-display font-bold text-base text-white mb-0.5">{lightbox.title}</h3>}
                  {lightbox.description && <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>{lightbox.description}</p>}
                  {lightbox.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {lightbox.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(240,165,0,0.15)', color:'#F0A500', border:'1px solid rgba(240,165,0,0.2)', fontFamily:'Poppins,sans-serif' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => featureMut.mutate(lightbox)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                    style={{ color: lightbox.is_featured ? '#C87800' : '#F0A500', background: 'rgba(240,165,0,0.1)', fontFamily: 'Sora,sans-serif' }}>
                    <i className="fas fa-star text-[10px]" />{lightbox.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(lightbox.id) }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                    style={{ color: '#dc2626', background: 'rgba(220,38,38,0.1)', fontFamily: 'Sora,sans-serif' }}>
                    <i className="fas fa-trash text-[10px]" />Delete
                  </button>
                  <button onClick={() => setLightbox(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                    style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', fontFamily: 'Sora,sans-serif' }}>
                    <i className="fas fa-times text-[10px]" />Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add item modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <div>
                <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Add Gallery Item</h3>
                <p className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Add a photo, video or document to the gallery</p>
              </div>
              <button onClick={() => { setShowForm(false); reset() }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="p-7 space-y-4">
              <div>
                <label className="label">Media URL *</label>
                <input {...register('url', { required: 'URL required' })} placeholder="https://example.com/photo.jpg" className="input" />
                {errors.url && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.url.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select {...register('media_type')} className="input">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="label">Linked Project</label>
                  <select {...register('project_id')} className="input">
                    <option value="">None</option>
                    {projects?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Title</label>
                <input {...register('title')} placeholder="e.g. School renovation progress" className="input" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={2} className="input resize-none" placeholder="Optional description…" />
              </div>
              <div>
                <label className="label">Thumbnail URL (optional)</label>
                <input {...register('thumbnail')} placeholder="https://… (for video thumbnails)" className="input" />
              </div>
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input {...register('tags')} placeholder="e.g. anthro-food-eru, cultural-arts" className="input" />
                <p className="text-[11px] mt-1" style={{ color:'#A3A3A3', fontFamily:'Poppins,sans-serif' }}>
                  Separate multiple tags with commas. Used to display images in specific page sections.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ fontFamily: 'Poppins,sans-serif' }}>
                  <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-primary-500" />
                  Mark as featured
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ fontFamily: 'Poppins,sans-serif' }}>
                  <input type="checkbox" defaultChecked {...register('show_in_gallery')} className="w-4 h-4 rounded accent-primary-500" />
                  Show in public gallery
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); reset() }}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>
                  Cancel
                </button>
                <button type="submit" disabled={createMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {createMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Adding…</> : <><i className="fas fa-plus" />Add to Gallery</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
