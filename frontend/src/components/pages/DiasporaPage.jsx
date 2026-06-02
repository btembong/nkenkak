import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Home, ChevronRight, Users, Globe, Map, MapPin, UserPlus, X, Loader2 } from 'lucide-react'

export default function DiasporaPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [addPin, setAddPin] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: pins, isLoading } = useQuery('diaspora-pins', () => api.get('/diaspora').then(r => r.data))
  const addMut = useMutation(data => api.post('/diaspora', data), {
    onSuccess: () => { toast.success('Pin added! 🌍'); qc.invalidateQueries('diaspora-pins'); setAddPin(false); reset() },
    onError: () => toast.error('Failed to add pin'),
  })

  const byCountry = pins?.reduce((acc, p) => { acc[p.country]=(acc[p.country]||0)+1; return acc }, {}) || {}
  const countries = Object.entries(byCountry).sort((a,b)=>b[1]-a[1])

  const STATS = [
    { label:'Community Members', value:`${pins?.length || 0}+`, Icon:Users },
    { label:'Countries', value:`${countries.length}+`, Icon:Globe },
    { label:'Continents', value:'5', Icon:Map },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <h1 className="font-display font-bold text-4xl text-white mb-3">Diaspora Map</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><Home className="w-3 h-3"/>Home</Link>
          <ChevronRight className="w-3 h-3 text-gold"/>
          <span className="text-gold">Diaspora Map</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="py-8 bg-white" style={{borderBottom:'1px solid rgba(91,45,142,0.06)'}}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2"
                style={{background:'rgba(91,45,142,0.08)'}}>
                <s.Icon className="w-5 h-5 text-primary-500"/>
              </div>
              <div className="font-display font-bold text-2xl text-dark">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Map placeholder */}
          <div className="rounded-3xl overflow-hidden mb-10 relative flex items-center justify-center"
            style={{height:'400px', background:'linear-gradient(135deg,#1A0A35,#3D1A6B)'}}>
            <div className="wave-pattern absolute inset-0"/>
            {/* Animated dots for pins */}
            {pins?.slice(0,8).map((p,i) => (
              <div key={p.id} className="absolute w-3 h-3 rounded-full border-2 border-white animate-ping"
                style={{
                  background:'#F0A500',
                  top:`${20+i*8}%`, left:`${10+i*11}%`,
                  animationDelay:`${i*0.4}s`, animationDuration:'2.5s',
                }}/>
            ))}
            <div className="relative text-center">
              <Globe className="w-16 h-16 mx-auto mb-4" style={{color:'rgba(240,165,0,0.25)'}}/>
              <p className="text-sm mb-4" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
                Interactive map — integrate <strong>Leaflet.js</strong> with <code className="px-1.5 py-0.5 rounded text-xs" style={{background:'rgba(255,255,255,0.1)'}}>GET /api/diaspora</code>
              </p>
              {user ? (
                <button onClick={()=>setAddPin(true)} className="btn-gold !text-sm">
                  <MapPin className="w-3.5 h-3.5"/>Add My Location
                </button>
              ) : (
                <Link to="/register" className="btn-gold !text-sm">
                  <UserPlus className="w-3.5 h-3.5"/>Join to Add Your Pin
                </Link>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Members list */}
            <div>
              <h3 className="font-display font-bold text-xl mb-6 text-dark">
                Community Members <span className="text-gold">({pins?.length || 0})</span>
              </h3>
              {isLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i=>(
                  <div key={i} className="h-16 rounded-2xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>
                ))}</div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {pins?.map(p => (
                    <div key={p.id} className="card flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                        {p.display_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-sm truncate text-dark">{p.display_name}</div>
                        <div className="text-xs text-muted-foreground">{p.city}, {p.country}</div>
                      </div>
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gold"/>
                    </div>
                  ))}
                  {!pins?.length && (
                    <div className="text-center py-8 rounded-3xl" style={{background:'rgba(91,45,142,0.03)',border:'1px dashed rgba(91,45,142,0.15)'}}>
                      <MapPin className="w-8 h-8 mx-auto mb-2" style={{color:'rgba(91,45,142,0.2)'}}/>
                      <p className="text-sm text-muted-foreground">Be the first to add your location!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Countries breakdown */}
            <div>
              <h3 className="font-display font-bold text-xl mb-6 text-dark">
                Top <span className="text-gold">Countries</span>
              </h3>
              <div className="space-y-4">
                {countries.slice(0,8).map(([country, count]) => (
                  <div key={country}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-muted-foreground">{country}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-primary-500" style={{background:'rgba(91,45,142,0.08)'}}>{count}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill transition-all duration-700" style={{width:`${(count/pins.length)*100}%`}}/>
                    </div>
                  </div>
                ))}
                {countries.length===0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No data yet.</p>
                  </div>
                )}
              </div>

              {/* CTA card */}
              <div className="mt-6 rounded-3xl p-6 text-center relative" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
                <div className="wave-pattern absolute inset-0 rounded-3xl pointer-events-none"/>
                <Globe className="w-8 h-8 mx-auto mb-3 relative" style={{color:'rgba(240,165,0,0.6)'}}/>
                <h4 className="font-display font-bold text-white text-base mb-2 relative">Are You in the Diaspora?</h4>
                <p className="text-xs mb-4 relative" style={{color:'rgba(255,255,255,0.7)',fontFamily:'Poppins,sans-serif'}}>Add your location and connect with fellow Nkenkak-Ngiesang members worldwide.</p>
                {user ? (
                  <button onClick={()=>setAddPin(true)} className="btn-gold relative !text-xs !py-2.5 !px-5">
                    <MapPin className="w-3.5 h-3.5"/>Add My Pin
                  </button>
                ) : (
                  <Link to="/register" className="btn-gold relative !text-xs !py-2.5 !px-5">
                    <UserPlus className="w-3.5 h-3.5"/>Join Community
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Pin Modal */}
      {addPin && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setAddPin(false)}>
          <div className="modal-box max-w-md animate-slide-up">
            <div className="p-6 border-b flex items-center justify-between" style={{borderColor:'rgba(91,45,142,0.08)'}}>
              <h2 className="font-display font-bold text-xl text-dark">Add Your Location</h2>
              <button onClick={()=>setAddPin(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors text-muted-foreground">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <form onSubmit={handleSubmit(d=>addMut.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="label">Display Name</label>
                <input {...register('display_name',{required:true})} placeholder="e.g. Jean Kenfack" className="input"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">City</label><input {...register('city',{required:true})} placeholder="Paris" className="input"/></div>
                <div><label className="label">Country</label><input {...register('country',{required:true})} placeholder="France" className="input"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Latitude</label><input type="number" step="any" {...register('latitude',{required:true})} placeholder="48.8566" className="input"/></div>
                <div><label className="label">Longitude</label><input type="number" step="any" {...register('longitude',{required:true})} placeholder="2.3522" className="input"/></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Find coordinates at <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="hover:underline text-primary-500">maps.google.com</a>
              </p>
              <button type="submit" disabled={addMut.isLoading} className="btn-secondary w-full justify-center">
                {addMut.isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin"/>Adding…</>
                  : <><MapPin className="w-4 h-4"/>Add My Pin</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
