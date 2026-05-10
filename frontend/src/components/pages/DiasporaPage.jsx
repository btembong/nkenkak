import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

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

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <h1 className="font-display font-bold text-4xl text-white mb-3">Diaspora Map</h1>
        <div className="flex items-center justify-center gap-2 text-sm" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs"/>Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{color:'#F0A500'}}/>
          <span style={{color:'#F0A500'}}>Diaspora Map</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="py-8 bg-white" style={{borderBottom:'1px solid rgba(91,45,142,0.06)'}}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { label:'Community Members', value:`${pins?.length || 0}+`, icon:'fa-users' },
            { label:'Countries', value:`${countries.length}+`, icon:'fa-globe-africa' },
            { label:'Continents', value:'5', icon:'fa-map' },
          ].map(s => (
            <div key={s.label}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2"
                style={{background:'rgba(91,45,142,0.08)'}}>
                <i className={`fas ${s.icon} text-lg`} style={{color:'#5B2D8E'}}/>
              </div>
              <div className="font-display font-bold text-2xl" style={{color:'#1A0A35'}}>{s.value}</div>
              <div className="text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{s.label}</div>
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
              <i className="fas fa-globe-africa text-7xl mb-4 block" style={{color:'rgba(240,165,0,0.25)'}}/>
              <p className="text-sm mb-4" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
                Interactive map — integrate <strong>Leaflet.js</strong> with <code className="px-1.5 py-0.5 rounded text-xs" style={{background:'rgba(255,255,255,0.1)'}}>GET /api/diaspora</code>
              </p>
              {user ? (
                <button onClick={()=>setAddPin(true)} className="btn-gold !text-sm">
                  <i className="fas fa-map-pin"/>Add My Location
                </button>
              ) : (
                <Link to="/register" className="btn-gold !text-sm">
                  <i className="fas fa-user-plus"/>Join to Add Your Pin
                </Link>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Members list */}
            <div>
              <h3 className="font-display font-bold text-xl mb-6" style={{color:'#1A0A35'}}>
                Community Members <span style={{color:'#F0A500'}}>({pins?.length || 0})</span>
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
                        <div className="font-display font-semibold text-sm truncate" style={{color:'#1A0A35'}}>{p.display_name}</div>
                        <div className="text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{p.city}, {p.country}</div>
                      </div>
                      <i className="fas fa-map-pin text-xs flex-shrink-0" style={{color:'#F0A500'}}/>
                    </div>
                  ))}
                  {!pins?.length && (
                    <div className="text-center py-8 rounded-3xl" style={{background:'rgba(91,45,142,0.03)',border:'1px dashed rgba(91,45,142,0.15)'}}>
                      <i className="fas fa-map-marker-alt text-3xl mb-2 block" style={{color:'rgba(91,45,142,0.2)'}}/>
                      <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Be the first to add your location!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Countries breakdown */}
            <div>
              <h3 className="font-display font-bold text-xl mb-6" style={{color:'#1A0A35'}}>
                Top <span style={{color:'#F0A500'}}>Countries</span>
              </h3>
              <div className="space-y-4">
                {countries.slice(0,8).map(([country, count]) => (
                  <div key={country}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium" style={{color:'#404040',fontFamily:'Poppins,sans-serif'}}>{country}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>{count}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill transition-all duration-700" style={{width:`${(count/pins.length)*100}%`}}/>
                    </div>
                  </div>
                ))}
                {countries.length===0 && (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>No data yet.</p>
                  </div>
                )}
              </div>

              {/* CTA card */}
              <div className="mt-6 rounded-3xl p-6 text-center" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
                <div className="wave-pattern absolute inset-0 rounded-3xl pointer-events-none"/>
                <i className="fas fa-globe text-3xl mb-3 block relative" style={{color:'rgba(240,165,0,0.6)'}}/>
                <h4 className="font-display font-bold text-white text-base mb-2 relative">Are You in the Diaspora?</h4>
                <p className="text-xs mb-4 relative" style={{color:'rgba(255,255,255,0.7)',fontFamily:'Poppins,sans-serif'}}>Add your location and connect with fellow Nkenkak-Ngiesang members worldwide.</p>
                {user ? (
                  <button onClick={()=>setAddPin(true)} className="btn-gold relative !text-xs !py-2.5 !px-5">
                    <i className="fas fa-map-pin"/>Add My Pin
                  </button>
                ) : (
                  <Link to="/register" className="btn-gold relative !text-xs !py-2.5 !px-5">
                    <i className="fas fa-user-plus"/>Join Community
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
              <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Add Your Location</h2>
              <button onClick={()=>setAddPin(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors" style={{color:'#737373'}}>
                <i className="fas fa-times"/>
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
              <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                Find coordinates at <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="hover:underline" style={{color:'#5B2D8E'}}>maps.google.com</a>
              </p>
              <button type="submit" disabled={addMut.isLoading} className="btn-secondary w-full justify-center">
                {addMut.isLoading?<><i className="fas fa-spinner animate-spin"/>Adding…</>:<><i className="fas fa-map-pin"/>Add My Pin</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
