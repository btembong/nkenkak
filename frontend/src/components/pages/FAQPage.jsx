import { useState } from 'react'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  { id: 'all',       label: 'All Questions',    icon: 'fa-list' },
  { id: 'membership',label: 'Membership',       icon: 'fa-id-card' },
  { id: 'donations', label: 'Donations',        icon: 'fa-heart' },
  { id: 'projects',  label: 'Projects',         icon: 'fa-seedling' },
  { id: 'diaspora',  label: 'Diaspora',         icon: 'fa-globe-africa' },
  { id: 'events',    label: 'Events',           icon: 'fa-calendar' },
  { id: 'general',   label: 'General',          icon: 'fa-info-circle' },
]

const FAQS = [
  // Membership
  { cat: 'membership', q: 'Who can become a member of Nkenkak-Ngiesang?',
    a: 'Any person of Nkenkak-Ngiesang origin — whether born in the village, in another part of Cameroon, or anywhere in the diaspora worldwide — is welcome to register. Spouses and close associates who share our community values may also apply for associate membership.' },
  { cat: 'membership', q: 'How do I register as a member?',
    a: 'Click "Register" at the top of any page, fill in your details, and submit. Your account will be reviewed within 48 hours. Once approved you will receive a welcome email and access to your member portal where you can track projects, manage donations, and register for events.' },
  { cat: 'membership', q: 'Is membership free?',
    a: 'Yes. Basic membership is completely free. There are no registration fees or annual dues. Voluntary contributions to village development projects are always appreciated but are never mandatory.' },
  { cat: 'membership', q: 'I forgot my password — how do I reset it?',
    a: 'Click "Login" then "Forgot Password". Enter your registered email address and we will send you a secure reset link valid for one hour. If you do not receive the email within a few minutes, check your spam folder or contact us.' },
  { cat: 'membership', q: 'Can I update my profile and location?',
    a: 'Yes. Log in and go to your Member Portal, then click "Profile". You can update your name, photo, location, contact details, and bio at any time.' },

  // Donations
  { cat: 'donations', q: 'What payment methods do you accept?',
    a: 'We accept MTN Mobile Money (MoMo), Orange Money, PayPal, Flutterwave (Visa/Mastercard), and direct bank transfer. All payments are processed securely. We never store your card or mobile money credentials.' },
  { cat: 'donations', q: 'Can I donate to a specific project?',
    a: 'Absolutely. On the Projects page, click any active project and select "Donate to this Project". Your funds will be ring-fenced for that project. You can also make a general donation to the village development fund, which is allocated where it is needed most.' },
  { cat: 'donations', q: 'Will I receive a receipt for my donation?',
    a: 'Yes. An official receipt is emailed to you automatically as soon as your payment is confirmed. It includes your donor name, amount, project, reference number, and date. Please keep it for your records.' },
  { cat: 'donations', q: 'Does my employer match donations?',
    a: 'Many companies offer matching gift programmes. Contact your HR department to check eligibility. If your employer confirms a match, forward us the confirmation email at contact@nkenkak-ngiesang.cm and we will handle the paperwork.' },
  { cat: 'donations', q: 'How do I see my donation history?',
    a: 'Log in and navigate to Portal → Donations. You will see a full history of all your contributions, project allocations, receipts, and cumulative total.' },
  { cat: 'donations', q: 'Is Nkenkak-Ngiesang a registered non-profit?',
    a: 'Yes. We are registered as a Community Development Association under Cameroonian law. 100% of all donations go directly to village projects. We publish quarterly transparency reports showing every franc received and spent.' },

  // Projects
  { cat: 'projects', q: 'How are development projects chosen?',
    a: 'Projects are proposed by village residents or the community board, then voted on at our general assembly. Priority is given to projects addressing education, water, health, and infrastructure. The board publishes the shortlist before every vote.' },
  { cat: 'projects', q: 'Can I volunteer on a project?',
    a: 'Yes. Visit the Volunteers page to see current volunteer opportunities. You can offer skills such as construction, teaching, medical services, IT, or fundraising. Diaspora members can contribute remotely through mentorship, translation, or digital services.' },
  { cat: 'projects', q: 'How do I track progress on a funded project?',
    a: 'Every project has a dedicated page with live funding progress, milestone updates, and photo/video reports. Donors who have contributed to a project receive automatic email notifications whenever a new milestone update is posted.' },
  { cat: 'projects', q: 'What happens if a project does not reach its goal?',
    a: 'If a project falls short of its goal, the community board evaluates whether to extend the campaign, scale the project to the funds raised, or redirect donations to the general fund — always with donor consent. You are notified and may request a refund if preferred.' },

  // Diaspora
  { cat: 'diaspora', q: 'I live abroad — how can I stay connected?',
    a: 'Register on the platform and pin your location on the diaspora map. Join the forum, follow news updates, donate to projects, and attend virtual events. The diaspora network page lets you find fellow Nkenkak-Ngiesang members in your city or country.' },
  { cat: 'diaspora', q: 'Can the diaspora participate in village governance?',
    a: 'Registered diaspora members can attend general assembly meetings virtually, submit proposals, and vote on community resolutions. The community board includes a dedicated diaspora representative seat.' },
  { cat: 'diaspora', q: 'How can diaspora professionals support youth at home?',
    a: 'The Mentorship Programme connects diaspora professionals with Nkenkak-Ngiesang youth. You can register as a mentor, share your career experience, and guide young people remotely. Visit the Mentorship page to create your mentor profile.' },
  { cat: 'diaspora', q: 'Can I submit my business to the community directory?',
    a: 'Yes. Any member running a business — whether in Cameroon or abroad — can submit it to the Business Directory. Submissions are reviewed within 3 business days. The directory helps community members support each other\'s enterprises.' },

  // Events
  { cat: 'events', q: 'How do I register for an event?',
    a: 'Go to the Events page, find the event you want to attend, and click "Register". For free events, registration is instant. For paid events, you will be prompted to complete payment, after which a ticket confirmation is emailed to you.' },
  { cat: 'events', q: 'Are virtual events available for the diaspora?',
    a: 'Yes. Many of our events — including the annual diaspora forum, cultural webinars, and town hall meetings — are held online via video conference. The meeting link is included in your registration confirmation email.' },
  { cat: 'events', q: 'Can I propose a community event?',
    a: 'Yes. Members can submit event proposals through the Contact page. Include the event name, proposed date, location or format, and a short description. The events team will review it and get back to you within one week.' },
  { cat: 'events', q: 'What is the Annual Harvest Festival?',
    a: 'The Annual Harvest Festival is our biggest cultural celebration, held every year in the village. It includes traditional music, dance, food, cultural exhibitions, and the general community assembly. Diaspora members are warmly encouraged to attend or join virtually.' },

  // General
  { cat: 'general', q: 'What is Nkenkak-Ngiesang Development Council?',
    a: 'The Nkenkak-Ngiesang Development Council is the official community organisation uniting village residents and diaspora members to drive development across education, health, water, infrastructure and cultural preservation in Nkenkak-Ngiesang, West Region, Cameroon.' },
  { cat: 'general', q: 'How transparent is the organisation?',
    a: 'Transparency is central to how we operate. We publish quarterly financial reports, project audit results, board meeting minutes, and annual impact summaries. All reports are freely accessible on the Transparency page — no login required.' },
  { cat: 'general', q: 'How do I contact the team?',
    a: 'Use the Contact page to send a message. You can also email us at contact@nkenkak-ngiesang.cm. We aim to respond within 24–48 hours on weekdays. For urgent matters, contact details for the lead coordinator are available to registered members.' },
  { cat: 'general', q: 'How can I apply for a scholarship?',
    a: 'Visit the Scholarships page to see current scholarship opportunities. Each listing shows eligibility criteria, the application window, and required documents. Applications are submitted directly through the platform.' },
]

const CAT_COLORS = {
  membership: { bg: 'rgba(91,45,142,0.1)',  text: '#5B2D8E',  border: '#5B2D8E' },
  donations:  { bg: 'rgba(220,38,38,0.08)', text: '#dc2626',  border: '#dc2626' },
  projects:   { bg: 'rgba(22,163,74,0.1)',  text: '#16a34a',  border: '#16a34a' },
  diaspora:   { bg: 'rgba(2,132,199,0.1)',  text: '#0284c7',  border: '#0284c7' },
  events:     { bg: 'rgba(240,165,0,0.12)', text: '#C87800',  border: '#F0A500' },
  general:    { bg: 'rgba(91,45,142,0.08)', text: '#5B2D8E',  border: '#5B2D8E' },
}

function FAQItem({ q, a, cat, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false)
  const col = CAT_COLORS[cat] || CAT_COLORS.general
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ border: `1px solid ${open ? col.border : 'rgba(91,45,142,0.07)'}`, background: '#fff', boxShadow: open ? '0 4px 24px rgba(91,45,142,0.08)' : 'none' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all"
        style={{ background: open ? col.bg : '#fff' }}>
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.border }} />
        <span className="flex-1 font-display font-semibold text-sm pr-2" style={{ color: open ? col.text : '#1A0A35' }}>{q}</span>
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: open ? col.border : 'rgba(91,45,142,0.06)', transform: open ? 'rotate(180deg)' : 'none' }}>
          <i className="fas fa-chevron-down text-[10px]" style={{ color: open ? '#fff' : '#5B2D8E' }} />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-sm leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = FAQS.filter(f => {
    const matchesCat = activeCategory === 'all' || f.cat === activeCategory
    const matchesSearch = !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.id === 'all' ? FAQS.length : FAQS.filter(f => f.cat === cat.id).length
    return acc
  }, {})

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
          Help Centre
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">
          Frequently Asked <span style={{ color: '#F0A500' }}>Questions</span>
        </h1>
        <p className="text-sm max-w-lg mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
          Everything you need to know about membership, donations, projects, and our community.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs" />Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>FAQ</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'linear-gradient(135deg,#250F47,#3D1A6B)' }}>
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
            const col = CAT_COLORS[cat.id]
            return (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearch('') }}
                className="text-center p-3 rounded-2xl transition-all"
                style={{ background: activeCategory === cat.id ? col.bg : 'rgba(255,255,255,0.05)', border: `1px solid ${activeCategory === cat.id ? col.border : 'transparent'}` }}>
                <i className={`fas ${cat.icon} text-lg mb-1 block`} style={{ color: activeCategory === cat.id ? col.border : 'rgba(255,255,255,0.45)' }} />
                <div className="text-[10px] font-semibold" style={{ color: activeCategory === cat.id ? col.border : 'rgba(255,255,255,0.5)', fontFamily: 'Sora,sans-serif' }}>{cat.label}</div>
                <div className="text-lg font-bold mt-0.5" style={{ color: activeCategory === cat.id ? col.border : 'rgba(255,255,255,0.7)', fontFamily: 'Sora,sans-serif' }}>{counts[cat.id]}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <section className="py-16" style={{ background: '#FAF6EE' }}>
        <div className="max-w-5xl mx-auto px-6">

          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#A3A3A3' }} />
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input !pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearch('') }}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: activeCategory === cat.id ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                    color: activeCategory === cat.id ? '#fff' : '#5B2D8E',
                    fontFamily: 'Sora,sans-serif',
                    border: `1.5px solid ${activeCategory === cat.id ? 'transparent' : 'rgba(91,45,142,0.1)'}`,
                    boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(91,45,142,0.25)' : 'none',
                  }}>
                  <i className={`fas ${cat.icon} mr-1.5 text-[10px]`} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.1)' }}>
              <i className="fas fa-search text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1A0A35' }}>No results found</h3>
              <p className="text-sm mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Try a different keyword or browse all questions.</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all') }} className="btn-secondary !text-xs !py-2 !px-5">
                <i className="fas fa-undo text-[10px]" />Show All
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs mb-5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                {filtered.length} question{filtered.length !== 1 ? 's' : ''}
                {search && <> matching "<span style={{ color: '#5B2D8E' }}>{search}</span>"</>}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((f, i) => (
                  <FAQItem key={i} q={f.q} a={f.a} cat={f.cat} defaultOpen={i === 0} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: 'fa-envelope', title: 'Email Us', body: 'contact@nkenkak-ngiesang.cm', link: '/contact', label: 'Send a Message' },
            { icon: 'fa-comments', title: 'Community Forum', body: 'Ask fellow members and get answers from the community.', link: '/forum', label: 'Visit Forum' },
            { icon: 'fa-phone', title: 'Village Secretariat', body: 'Reach the village secretariat directly for urgent matters.', link: '/contact', label: 'Get in Touch' },
          ].map((c, i) => (
            <div key={i} className="card-dark rounded-3xl p-6 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
                <i className={`fas ${c.icon} text-xl`} style={{ color: '#F0A500' }} />
              </div>
              <h3 className="font-display font-bold text-base mb-1" style={{ color: '#fff' }}>{c.title}</h3>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif', lineHeight: 1.7 }}>{c.body}</p>
              <Link to={c.link} className="btn-gold !text-xs !py-2 !px-5">{c.label}</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
