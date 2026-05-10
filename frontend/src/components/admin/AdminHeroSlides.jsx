import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ImageUploader from '../common/ImageUploader'

export default function AdminHeroSlides() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [imgUrl,   setImgUrl]   = useState('')
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { overlay_opacity: 0.45, sort_order: 1, is_active: true }
  })

  const { data: slides, isLoading } = useQuery('hero-slides-admin',
    () => api.get('/hero/all').then(r => r.data))

  const saveMut = useMutation(
    data => editing
      ? api.patch(`/hero/${editing.id}`, data)
      : api.post('/hero', data),
    {
      onSuccess: () => {
        qc.invalidateQueries('hero-slides-admin')
        qc.invalidateQueries('hero-slides')
        toast.success(editing ? 'Slide updated!' : 'Slide added!')
        setShowForm(false); setEditing(null); setImgUrl(''); reset()
      }
    }
  )

  const deleteMut = useMutation(id => api.delete(`/hero/${id}`), {
    onSuccess: () => { qc.invalidateQueries('hero-slides-admin'); qc.invalidateQueries('hero-slides'); toast.success('Slide deleted') }
  })

  const toggleMut = useMutation(({ id, isActive }) => api.patch(`/hero/${id}`, { is_active: !isActive }), {
    onSuccess: () => qc.invalidateQueries('hero-slides-admin')
  })

  const openNew = () => {
    setEditing(null); setImgUrl(''); reset({ overlay_opacity: 0.45, sort_order: (slides?.length||0)+1, is_active: true })
    setShowForm(true)
  }
  const openEdit = (s) => {
    setEditing(s); setImgUrl(s.imageUrl)
    Object.entries(s).forEach(([k,v]) => setValue(k, v))
    setValue('overlay_opacity', s.overlayOpacity)
    setValue('sort_order', s.sortOrder)
    setValue('is_active', s.isActive)
    setValue('cta_text', s.ctaText)
    setValue('cta_link', s.ctaLink)
    setValue('image_url', s.imageUrl)
    setShowForm(true)
  }

  const onSubmit = (data) => {
    if (!imgUrl) { toast.error('Please add a hero image'); return }
    saveMut.mutate({ ...data, image_url: imgUrl })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
            <i className="fas fa-images text-sm text-white"/>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Hero Slides</h2>
            <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
              {slides?.length || 0} slides · {slides?.filter(s=>s.isActive).length || 0} active
            </p>
          </div>
        </div>
        <button onClick={openNew} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]"/>Add Slide
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
        style={{background:'rgba(91,45,142,0.05)', border:'1px solid rgba(91,45,142,0.1)'}}>
        <i className="fas fa-info-circle mt-0.5" style={{color:'#5B2D8E'}}/>
        <div className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>
          <strong>Tips:</strong> Use landscape photos (1920×1080 or wider) for best results.
          Recommended: add 2-5 slides. Slides rotate automatically every 6 seconds.
          {!import.meta.env.VITE_CLOUDINARY ? ' Configure Cloudinary in backend .env to enable direct uploads. You can also paste image URLs.' : ''}
        </div>
      </div>

      {/* Slides list */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i=>(
          <div key={i} className="h-36 rounded-2xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>
        ))}</div>
      ) : slides?.length ? (
        <div className="space-y-3">
          {[...slides].sort((a,b)=>a.sortOrder-b.sortOrder).map((slide, idx) => (
            <div key={slide.id} className="card overflow-hidden flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="w-full sm:w-48 h-32 flex-shrink-0 relative overflow-hidden bg-gray-100 flex items-center justify-center"
                style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.title||'Slide'} className="w-full h-full object-cover"/>
                ) : (
                  <i className="fas fa-image text-2xl" style={{color:'rgba(255,255,255,0.3)'}}/>
                )}
                {/* Order badge */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{background:'rgba(0,0,0,0.5)'}}>
                  {idx+1}
                </div>
                {/* Active indicator */}
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${slide.isActive?'bg-green-400':'bg-gray-400'}`}/>
              </div>

              {/* Details */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="font-display font-semibold text-sm" style={{color:'#1A0A35'}}>{slide.title || '(no title)'}</h4>
                      {slide.subtitle && <p className="text-xs mt-0.5 line-clamp-1" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{slide.subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{background:slide.isActive?'rgba(22,163,74,0.1)':'rgba(115,115,115,0.1)', color:slide.isActive?'#16a34a':'#737373'}}>
                        {slide.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                    {slide.ctaText && <span><i className="fas fa-link mr-1"/>CTA: {slide.ctaText}</span>}
                    <span><i className="fas fa-layer-group mr-1"/>Order: {slide.sortOrder}</span>
                    <span><i className="fas fa-adjust mr-1"/>Overlay: {Math.round((+slide.overlayOpacity)*100)}%</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(slide)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                    style={{color:'#5B2D8E',background:'rgba(91,45,142,0.08)',fontFamily:'Sora,sans-serif'}}>
                    <i className="fas fa-pen text-[10px]"/>Edit
                  </button>
                  <button onClick={() => toggleMut.mutate({ id:slide.id, isActive:slide.isActive })}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                    style={{color:slide.isActive?'#C87800':'#16a34a', background:slide.isActive?'rgba(240,165,0,0.08)':'rgba(22,163,74,0.08)', fontFamily:'Sora,sans-serif'}}>
                    <i className={`fas fa-${slide.isActive?'eye-slash':'eye'} text-[10px]`}/>
                    {slide.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => { if(confirm('Delete this slide?')) deleteMut.mutate(slide.id) }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                    style={{color:'#dc2626',background:'rgba(220,38,38,0.08)',fontFamily:'Sora,sans-serif'}}>
                    <i className="fas fa-trash text-[10px]"/>Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
          <i className="fas fa-images text-5xl mb-3 block" style={{color:'rgba(91,45,142,0.15)'}}/>
          <h4 className="font-display font-semibold mb-2" style={{color:'#737373'}}>No hero slides yet</h4>
          <p className="text-sm mb-4" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Add your first slide to bring the homepage hero to life</p>
          <button onClick={openNew} className="btn-secondary !text-sm !py-2 !px-5">Add First Slide</button>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
          style={{background:'rgba(26,10,53,0.8)',backdropFilter:'blur(8px)'}}
          onClick={e=>e.target===e.currentTarget&&(setShowForm(false),setEditing(null),setImgUrl(''))}>
          <div className="bg-white rounded-3xl w-full max-w-2xl my-auto"
            style={{boxShadow:'0 32px 80px rgba(26,10,53,0.25)'}}>
            {/* Modal header */}
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between"
              style={{borderColor:'rgba(91,45,142,0.08)'}}>
              <div>
                <h3 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>
                  {editing ? 'Edit Slide' : 'Add Hero Slide'}
                </h3>
                <p className="text-xs mt-0.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                  {editing ? 'Update the slide image and text' : 'Upload a photo and add overlay text'}
                </p>
              </div>
              <button onClick={()=>{setShowForm(false);setEditing(null);setImgUrl('')}}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
                style={{color:'#A3A3A3'}}>
                <i className="fas fa-times"/>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-7 space-y-5">
              {/* Image uploader — hero aspect */}
              <ImageUploader
                value={imgUrl}
                onChange={url => { setImgUrl(url); setValue('image_url', url) }}
                folder="nkenkak/hero"
                aspect="hero"
                label="Hero Background Image *"
                hint="Recommended: 1920×1080px or wider landscape photo. The image will be full-width."/>

              {/* Text overlay */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Slide Title</label>
                  <input {...register('title')} placeholder="e.g. Lend a Helping Hand" className="input"/>
                </div>
                <div>
                  <label className="label">Subtitle / Description</label>
                  <textarea {...register('subtitle')} rows={2} className="input resize-none"
                    placeholder="e.g. Together we build a stronger Nkenkak-Ngiesang..."/>
                </div>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Button Text</label>
                  <input {...register('cta_text')} placeholder="e.g. Donate Now" className="input"/>
                </div>
                <div>
                  <label className="label">Button Link</label>
                  <input {...register('cta_link')} placeholder="e.g. /projects" className="input"/>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sort Order</label>
                  <input type="number" min={1} {...register('sort_order', {valueAsNumber:true})} className="input"/>
                  <p className="text-[10px] mt-1" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Lower number = shown first</p>
                </div>
                <div>
                  <label className="label">Overlay Darkness</label>
                  <input type="range" min={0} max={0.85} step={0.05}
                    {...register('overlay_opacity', {valueAsNumber:true})}
                    className="w-full mt-2 accent-purple-600"/>
                  <p className="text-[10px] mt-1" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                    Controls how dark the image overlay is (affects text readability)
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                <input type="checkbox" {...register('is_active')} defaultChecked className="w-4 h-4 rounded accent-purple-600"/>
                Show this slide on the homepage
              </label>

              {/* Preview strip */}
              {imgUrl && (
                <div className="rounded-2xl overflow-hidden relative" style={{height:160}}>
                  <img src={imgUrl} alt="Preview" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-5"
                    style={{background:`rgba(14,5,48,0.55)`}}>
                    <div className="font-display font-bold text-white text-lg leading-tight">Preview</div>
                    <div className="text-xs text-white/70 mt-0.5" style={{fontFamily:'Poppins,sans-serif'}}>This is how your slide will look</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>{setShowForm(false);setEditing(null);setImgUrl('')}}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{background:'rgba(91,45,142,0.05)',color:'#737373',border:'1px solid rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>
                  Cancel
                </button>
                <button type="submit" disabled={saveMut.isLoading || !imgUrl}
                  className="btn-secondary flex-1 justify-center disabled:opacity-50">
                  {saveMut.isLoading
                    ? <><i className="fas fa-spinner animate-spin"/>Saving…</>
                    : <><i className="fas fa-save"/>{editing ? 'Save Changes' : 'Add Slide'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
