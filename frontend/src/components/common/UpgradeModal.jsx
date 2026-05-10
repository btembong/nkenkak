import { useState } from 'react'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: '2,000 XAF',
    period: '/month',
    perks: [
      'View recruiter contact details',
      'AI-powered CV generator',
      'Priority job alerts',
      'Premium badge on profile',
    ],
    popular: false,
  },
  {
    key: 'yearly',
    label: 'Yearly',
    price: '18,000 XAF',
    period: '/year',
    badge: 'Save 25%',
    perks: [
      'Everything in Monthly',
      '3 months free vs monthly',
      'Early access to new features',
      'Dedicated support',
    ],
    popular: true,
  },
]

export default function UpgradeModal({ onClose }) {
  const [selected, setSelected] = useState('yearly')

  const mut = useMutation(
    () => api.post('/premium/initiate', { plan: selected }).then(r => r.data),
    {
      onSuccess: ({ link }) => {
        // Redirect to Flutterwave hosted payment page
        window.location.href = link
      },
      onError: e => toast.error(e.response?.data?.error || 'Could not start payment'),
    }
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,4,28,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(10,4,28,0.3)' }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg,#1A0A35 0%,#5B2D8E 100%)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
            <i className="fas fa-times text-sm"/>
          </button>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(240,165,0,0.2)', border: '1px solid rgba(240,165,0,0.3)' }}>
            <i className="fas fa-crown text-2xl" style={{ color: '#F0A500' }}/>
          </div>
          <h2 className="font-display font-black text-2xl text-white mb-1">Upgrade to Premium</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Unlock recruiter contacts, AI CV generation and more
          </p>
        </div>

        {/* Plans */}
        <div className="p-6 grid grid-cols-2 gap-3">
          {PLANS.map(plan => (
            <button key={plan.key} onClick={() => setSelected(plan.key)}
              className="relative rounded-2xl p-5 text-left transition-all"
              style={{
                border: selected === plan.key ? '2px solid #5B2D8E' : '2px solid #F3F4F6',
                background: selected === plan.key ? 'rgba(91,45,142,0.04)' : '#fff',
              }}>
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full text-white"
                  style={{ background: '#F0A500' }}>
                  {plan.badge}
                </span>
              )}
              <p className="font-bold text-sm mb-1" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{plan.label}</p>
              <p className="font-black text-xl" style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                {plan.price}
                <span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>{plan.period}</span>
              </p>
              <ul className="mt-3 space-y-1.5">
                {plan.perks.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px]"
                    style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>
                    <i className="fas fa-check text-[9px] mt-0.5 flex-shrink-0" style={{ color: '#5B2D8E' }}/>
                    {p}
                  </li>
                ))}
              </ul>
              {selected === plan.key && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#5B2D8E' }}>
                  <i className="fas fa-check text-white text-[9px]"/>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Payment methods note */}
        <div className="px-6 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
            <i className="fas fa-shield-alt text-sm" style={{ color: '#16a34a' }}/>
            <p className="text-[11px]" style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>
              Secure payment via Flutterwave · MTN Mobile Money · Orange Money · Card accepted
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-3">
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isLoading}
            className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 8px 24px rgba(91,45,142,0.35)' }}>
            {mut.isLoading
              ? <><i className="fas fa-spinner animate-spin mr-2"/>Redirecting to payment…</>
              : <><i className="fas fa-crown mr-2"/>Upgrade Now — {PLANS.find(p => p.key === selected)?.price}</>}
          </button>
          <p className="text-center text-[11px] mt-3" style={{ color: '#9CA3AF', fontFamily: 'Poppins,sans-serif' }}>
            Cancel anytime · Instant activation after payment
          </p>
        </div>
      </div>
    </div>
  )
}
