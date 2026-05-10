import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

const AMOUNTS = [5000, 10000, 25000, 50000, 100000, 250000]

const CAT_META = {
  education:      { icon: 'fa-graduation-cap', bg: 'linear-gradient(135deg,#250F47,#5B2D8E)' },
  health:         { icon: 'fa-heartbeat',       bg: 'linear-gradient(135deg,#4A0E0E,#991B1B)' },
  infrastructure: { icon: 'fa-road',            bg: 'linear-gradient(135deg,#3D2200,#C87800)' },
  environment:    { icon: 'fa-leaf',            bg: 'linear-gradient(135deg,#052e16,#16a34a)' },
  culture:        { icon: 'fa-music',           bg: 'linear-gradient(135deg,#2e1065,#7c3aed)' },
  agriculture:    { icon: 'fa-seedling',        bg: 'linear-gradient(135deg,#422006,#ca8a04)' },
}

const fmt = (n) => Number(n || 0).toLocaleString()

export default function DonationModal({ onClose, defaultProject = '' }) {
  const qc = useQueryClient()
  const [step,            setStep]            = useState(1)
  const [selectedProject, setSelectedProject] = useState(null)
  const [amount,          setAmount]          = useState(25000)
  const [custom,          setCustom]          = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [donationRef,     setDonationRef]     = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const customAmt   = watch('custom_amount')
  const finalAmount = custom ? (+customAmt || 0) : amount

  /* Load Flutterwave */
  useEffect(() => {
    if (document.querySelector('script[src*="flutterwave"]')) return
    const s = document.createElement('script')
    s.src   = 'https://checkout.flutterwave.com/v3.js'
    s.async = true
    document.body.appendChild(s)
  }, [])

  const { data: projects, isLoading: projectsLoading } = useQuery(
    'projects-donate',
    () => api.get('/projects?status=active&limit=20').then(r => r.data.projects),
    { staleTime: 60000 }
  )

  /* Pre-select default project */
  useEffect(() => {
    if (defaultProject && projects) {
      const p = projects.find(p => p.id === defaultProject)
      if (p) { setSelectedProject(p); setStep(2) }
    }
  }, [defaultProject, projects])

  const refreshProjects = () => {
    qc.invalidateQueries('featured-projects')
    qc.invalidateQueries('projects-donate')
    qc.invalidateQueries('project-stats')
    qc.invalidateQueries(['projects'])
    qc.invalidateQueries(['project'])
  }

  const onSubmit = async (data) => {
    if (finalAmount < 100) return toast.error('Minimum donation is 100 XAF')
    setLoading(true)
    try {
      const res = await api.post('/donations/initiate', {
        project_id:   selectedProject?.id || null,
        amount:       finalAmount,
        provider:     'flutterwave',
        donor_name:   data.donor_name,
        donor_email:  data.donor_email,
        donor_phone:  data.donor_phone,
        message:      data.message,
        is_anonymous: data.is_anonymous,
      })

      const { tx_ref, flw_public_key } = res.data
      setDonationRef(tx_ref)

      if (!flw_public_key || !window.FlutterwaveCheckout) {
        toast.success('Donation recorded! We will contact you for payment confirmation.')
        refreshProjects()
        setStep(3)
        return
      }

      window.FlutterwaveCheckout({
        public_key:      flw_public_key,
        tx_ref,
        amount:          finalAmount,
        currency:        'XAF',
        payment_options: 'mobilemoneycameroon, card',
        customer: {
          email:        data.donor_email,
          phone_number: data.donor_phone || '',
          name:         data.donor_name,
        },
        customizations: {
          title:       'Nkenkak-Ngiesang Village',
          description: selectedProject
            ? `Donation — ${selectedProject.title}`
            : 'General Village Development Fund',
        },
        callback: async (paymentData) => {
          try {
            await api.post('/donations/verify', {
              tx_ref:         paymentData.tx_ref,
              transaction_id: paymentData.transaction_id,
            })
          } catch {}
          refreshProjects()
          setStep(3)
        },
        onclose: () => {
          setLoading(false)
          toast('Payment window closed.', { icon: 'ℹ️' })
        },
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,4,28,0.72)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="bg-white w-full animate-slide-up flex flex-col"
        style={{ maxWidth: 700, borderRadius: '1.75rem', maxHeight: '92vh', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.28)' }}>

        {/* ── Header ── */}
        <div className="px-7 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid #F0EBF8' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                <i className="fas fa-heart text-white text-sm"/>
              </div>
              <div>
                <h2 className="font-display font-bold text-base leading-tight" style={{ color: '#1A0A35' }}>
                  Make a Donation
                </h2>
                <p className="text-[11px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                  Support Nkenkak-Ngiesang · Secured by Flutterwave
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}>
              <i className="fas fa-times text-sm"/>
            </button>
          </div>

          {/* Steps */}
          {step < 3 && (
            <div className="flex items-center gap-0">
              {[{ n: 1, label: 'Choose Project' }, { n: 2, label: 'Amount & Details' }].map(({ n, label }, i, arr) => (
                <div key={n} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                      style={{
                        background: step >= n ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#F3F4F6',
                        color:      step >= n ? '#fff' : '#9CA3AF',
                      }}>
                      {step > n ? <i className="fas fa-check text-[8px]"/> : n}
                    </div>
                    <span className="text-[11px] font-semibold hidden sm:block"
                      style={{ color: step >= n ? '#5B2D8E' : '#9CA3AF', fontFamily: 'Sora,sans-serif' }}>
                      {label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-px mx-3 transition-all duration-500"
                      style={{ background: step > n ? '#5B2D8E' : '#E5E7EB' }}/>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-7 py-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,45,142,0.2) transparent' }}>

          {/* ════ STEP 1: Project Selection ════ */}
          {step === 1 && (
            <div className="animate-fade-in">
              <p className="text-sm mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                Choose where your donation goes, or support the General Village Fund.
              </p>

              {/* General Fund */}
              <button type="button"
                onClick={() => { setSelectedProject(null); setStep(2) }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl mb-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: 'linear-gradient(135deg,#F9F5FF,#FFF8E8)', border: '1.5px solid rgba(91,45,142,0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  <i className="fas fa-globe-africa text-white text-lg"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-sm mb-0.5" style={{ color: '#1A0A35' }}>
                    General Village Development Fund
                  </div>
                  <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                    Your donation is allocated where it's needed most
                  </div>
                </div>
                <i className="fas fa-arrow-right text-xs flex-shrink-0" style={{ color: '#C4B5D5' }}/>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background: '#F0EBF8' }}/>
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#C4B5D5', fontFamily: 'Sora,sans-serif' }}>or pick a specific project</span>
                <div className="flex-1 h-px" style={{ background: '#F0EBF8' }}/>
              </div>

              {/* Project grid */}
              {projectsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: '#F9FAFB' }}/>
                  ))}
                </div>
              ) : !projects?.length ? (
                <div className="text-center py-10 rounded-2xl" style={{ background: '#F9FAFB' }}>
                  <i className="fas fa-seedling text-2xl mb-2 block" style={{ color: '#D1C4E9' }}/>
                  <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                    No active projects at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,45,142,0.2) transparent' }}>
                  {projects.map(p => {
                    const pct  = p.goalAmount > 0
                      ? Math.min(100, Math.round((p.raisedAmount / p.goalAmount) * 100)) : 0
                    const meta = CAT_META[p.category] || CAT_META.education
                    return (
                      <button key={p.id} type="button"
                        onClick={() => { setSelectedProject(p); setStep(2) }}
                        className="rounded-2xl overflow-hidden text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        style={{ background: '#fff', border: '1.5px solid #F0EBF8' }}>
                        {/* Cover */}
                        <div className="relative h-28 overflow-hidden" style={{ background: meta.bg }}>
                          {p.coverImage
                            ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" style={{ opacity: 0.85 }}/>
                            : <div className="w-full h-full flex items-center justify-center">
                                <i className={`fas ${meta.icon} text-3xl`} style={{ color: 'rgba(255,255,255,0.3)' }}/>
                              </div>
                          }
                          <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(to top,rgba(6,2,16,0.75),transparent 55%)' }}/>
                          <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white capitalize"
                            style={{ background: 'rgba(240,165,0,0.9)', fontFamily: 'Sora,sans-serif' }}>
                            {p.category}
                          </span>
                          <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.45)', color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
                            {pct}%
                          </span>
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <div className="font-display font-semibold text-xs line-clamp-2 mb-2 leading-snug"
                            style={{ color: '#1A0A35' }}>
                            {p.title}
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: '#F0EBF8' }}>
                            <div className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#5B2D8E,#F0A500)' }}/>
                          </div>
                          <div className="text-[9px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                            {fmt(p.raisedAmount)} / {fmt(p.goalAmount)} XAF
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════ STEP 2: Amount + Details ════ */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in">

              {/* Selected project chip */}
              <div className="flex items-center gap-3 p-3 rounded-2xl mb-5"
                style={{ background: '#F9F5FF', border: '1px solid rgba(91,45,142,0.12)' }}>
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: selectedProject ? (CAT_META[selectedProject.category]?.bg || 'linear-gradient(135deg,#5B2D8E,#7B4DB8)') : 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  {selectedProject?.coverImage
                    ? <img src={selectedProject.coverImage} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-globe-africa text-white text-sm"/>
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold line-clamp-1" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
                    {selectedProject?.title || 'General Village Development Fund'}
                  </div>
                  <div className="text-[10px] mt-0.5 capitalize" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                    {selectedProject
                      ? `${selectedProject.category} · Goal: ${fmt(selectedProject.goalAmount)} XAF`
                      : 'Supporting all community initiatives'}
                  </div>
                </div>
                <button type="button" onClick={() => setStep(1)}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition-all hover:opacity-80"
                  style={{ color: '#5B2D8E', background: 'rgba(91,45,142,0.08)', fontFamily: 'Sora,sans-serif' }}>
                  Change
                </button>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-2 gap-6">

                {/* Left: Amount */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2.5"
                    style={{ color: '#6B7280', fontFamily: 'Sora,sans-serif' }}>
                    Select Amount (XAF)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {AMOUNTS.map(a => (
                      <button key={a} type="button"
                        onClick={() => { setAmount(a); setCustom(false) }}
                        className="py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                        style={{
                          background: !custom && amount === a ? 'linear-gradient(135deg,#F0A500,#FFB84D)' : '#F9FAFB',
                          color:      !custom && amount === a ? '#fff' : '#374151',
                          border:     !custom && amount === a ? 'none' : '1.5px solid #E5E7EB',
                          boxShadow:  !custom && amount === a ? '0 4px 14px rgba(240,165,0,0.3)' : 'none',
                          fontFamily: 'Sora,sans-serif',
                        }}>
                        {(a / 1000).toLocaleString()}K
                      </button>
                    ))}
                  </div>

                  <input type="number" {...register('custom_amount')}
                    placeholder="Custom amount (XAF)…"
                    onClick={() => setCustom(true)}
                    onChange={() => setCustom(true)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none mb-4 transition-all"
                    style={{
                      background: '#F9FAFB',
                      border:     custom ? '1.5px solid #F0A500' : '1.5px solid #E5E7EB',
                      color:      '#1A0A35',
                      fontFamily: 'Poppins,sans-serif',
                    }}/>

                  {/* Amount summary */}
                  <div className="p-4 rounded-2xl text-center"
                    style={{ background: 'linear-gradient(135deg,#FFF8E8,#FFF3D0)', border: '1px solid rgba(240,165,0,0.2)' }}>
                    <div className="text-[10px] mb-1" style={{ color: '#92400E', fontFamily: 'Poppins,sans-serif' }}>
                      You are donating
                    </div>
                    <div className="font-display font-extrabold text-2xl" style={{ color: '#F0A500' }}>
                      {finalAmount > 0 ? fmt(finalAmount) : '—'}
                      <span className="text-sm font-semibold ml-1" style={{ color: 'rgba(240,165,0,0.6)' }}>XAF</span>
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: '#B45309', fontFamily: 'Poppins,sans-serif' }}>
                      ≈ {finalAmount > 0 ? (finalAmount / 655).toFixed(2) : '—'} USD
                    </div>
                  </div>
                </div>

                {/* Right: Donor details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: '#6B7280', fontFamily: 'Sora,sans-serif' }}>Full Name *</label>
                    <input {...register('donor_name', { required: true })}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{ background: '#F9FAFB', border: `1.5px solid ${errors.donor_name ? '#FCA5A5' : '#E5E7EB'}`, color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: '#6B7280', fontFamily: 'Sora,sans-serif' }}>Email Address *</label>
                    <input type="email" {...register('donor_email', { required: true })}
                      placeholder="your@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{ background: '#F9FAFB', border: `1.5px solid ${errors.donor_email ? '#FCA5A5' : '#E5E7EB'}`, color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: '#6B7280', fontFamily: 'Sora,sans-serif' }}>Phone Number</label>
                    <input {...register('donor_phone')}
                      placeholder="+237 6XX XXX XXX"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: '#6B7280', fontFamily: 'Sora,sans-serif' }}>Message (optional)</label>
                    <textarea {...register('message')} rows={2}
                      placeholder="A kind word for the community…"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                      style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}/>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_anonymous')} className="w-3.5 h-3.5 rounded accent-purple-600"/>
                    <span className="text-xs" style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>
                      Donate anonymously
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50"
                  style={{ background: '#F9FAFB', color: '#6B7280', border: '1.5px solid #E5E7EB', fontFamily: 'Sora,sans-serif' }}>
                  <i className="fas fa-arrow-left text-xs mr-1.5"/>Back
                </button>
                <button type="submit" disabled={loading || finalAmount < 100}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', boxShadow: '0 4px 18px rgba(240,165,0,0.35)', fontFamily: 'Sora,sans-serif' }}>
                  {loading
                    ? <><i className="fas fa-spinner animate-spin text-xs"/>Processing…</>
                    : <><i className="fas fa-lock text-xs"/>Pay {finalAmount > 0 ? `${fmt(finalAmount)} XAF` : ''} via Flutterwave</>
                  }
                </button>
              </div>

              {/* Trust row */}
              <div className="flex items-center justify-center gap-5 mt-4">
                {[
                  { icon: 'fa-lock',       text: 'SSL Secured' },
                  { icon: 'fa-shield-alt', text: '100% to village' },
                  { icon: 'fa-receipt',    text: 'Receipt by email' },
                ].map(t => (
                  <span key={t.text} className="flex items-center gap-1.5 text-[10px]"
                    style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                    <i className={`fas ${t.icon} text-[9px]`} style={{ color: '#C4B5D5' }}/>{t.text}
                  </span>
                ))}
              </div>
            </form>
          )}

          {/* ════ STEP 3: Success ════ */}
          {step === 3 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#FFF8E8,#FFE9A0)', border: '2px solid rgba(240,165,0,0.3)' }}>
                  <i className="fas fa-check text-2xl" style={{ color: '#F0A500' }}/>
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                  <i className="fas fa-heart text-[10px] text-white"/>
                </div>
              </div>

              <h3 className="font-display font-bold text-2xl mb-2" style={{ color: '#1A0A35' }}>
                Thank You!
              </h3>
              <p className="text-sm leading-relaxed mb-3 max-w-xs mx-auto"
                style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>
                Your donation of{' '}
                <strong style={{ color: '#F0A500' }}>{fmt(finalAmount)} XAF</strong>{' '}
                has been received.
                {selectedProject && (
                  <> It will go towards <strong style={{ color: '#1A0A35' }}>{selectedProject.title}</strong>.</>
                )}
              </p>

              {donationRef && (
                <div className="inline-block px-4 py-2 rounded-xl mb-5"
                  style={{ background: '#F9F5FF', border: '1px solid rgba(91,45,142,0.12)' }}>
                  <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                    Reference:{' '}
                    <span style={{ color: '#5B2D8E', fontWeight: 700 }}>{donationRef}</span>
                  </span>
                </div>
              )}

              <p className="text-sm font-semibold mb-7" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
                Nkenkak-Ngiesang thanks you from the heart.
              </p>

              <button onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 4px 18px rgba(91,45,142,0.3)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-check text-xs"/>Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
