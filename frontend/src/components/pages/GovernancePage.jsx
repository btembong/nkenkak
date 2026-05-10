import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const TOC = [
  { id: 'governance-system',  label: 'Our Governance System' },
  { id: 'fon-authority',      label: "The Fon's Authority" },
  { id: 'kwifon',             label: 'Kwifon Regulatory Society' },
  { id: 'vdc',                label: 'Village Development Council' },
  { id: 'elders',             label: 'Council of Elders' },
  { id: 'committees',         label: 'Village Committees' },
  { id: 'decisions',          label: 'How Decisions Are Made' },
  { id: 'constitution',       label: 'Village Constitution' },
  { id: 'dispute',            label: 'Dispute Resolution' },
  { id: 'contact',            label: 'Contact the Council' },
]

const COMMITTEES = [
  { icon: 'fa-hard-hat',         name: 'Development Committee',    desc: 'Oversees infrastructure projects, roads, housing, utilities and the prioritisation of development spending.' },
  { icon: 'fa-drum',             name: 'Culture Committee',         desc: 'Preserves traditional practices, organises festivals, maintains language records and supports cultural education.' },
  { icon: 'fa-heartbeat',        name: 'Health Committee',          desc: 'Coordinates health outreach, liaises with the health centre, and manages community health campaigns.' },
  { icon: 'fa-graduation-cap',   name: 'Education Committee',       desc: 'Monitors school performance, awards scholarships, recruits volunteer teachers and advocates for educational infrastructure.' },
  { icon: 'fa-futbol',           name: 'Youth Committee',           desc: 'Organises youth programmes, sports, vocational training and represents young voices in governance.' },
  { icon: 'fa-venus',            name: "Women's Committee",         desc: "Champions women's rights, economic empowerment, maternal welfare, and gender equity in village decisions." },
]

const ARTICLES = [
  { n: 1, title: 'Sovereignty of the Village', text: 'Nkenkak-Ngiesang is a self-governing community. Its primary allegiance is to the welfare, culture and continuity of its people.' },
  { n: 2, title: 'The Office of the Fon',      text: 'The Fon is the highest traditional authority. His person is sacred; his decrees are binding unless overturned by the full Council of Elders.' },
  { n: 3, title: 'Equality of Persons',        text: 'Every resident, irrespective of sex, age, quarter of origin, or economic status, holds equal standing before the village and its institutions.' },
  { n: 4, title: 'Collective Ownership',       text: 'Land, sacred sites, forest reserves and communal infrastructure belong to the village in perpetuity and may not be sold or alienated without consensus.' },
  { n: 5, title: 'Participatory Governance',   text: 'Every household is entitled to send a representative to general village assemblies. Decisions affecting the whole community require broad consultation.' },
  { n: 6, title: 'Duty of the Diaspora',       text: 'Village members residing abroad retain their rights and obligations. They may vote in general assemblies and are expected to contribute to development.' },
  { n: 7, title: 'Protection of Customs',      text: 'No law or decision of the Village Development Council may abrogate a practice enshrined by the Council of Elders as a binding cultural tradition.' },
  { n: 8, title: 'Accountability',             text: 'All office-bearers are accountable to the community. They may be censured or removed by a two-thirds vote of the Council of Elders for misconduct or dereliction.' },
]

const DECISION_STEPS = [
  { n: 1, icon: 'fa-lightbulb',     title: 'Proposal Submitted',          desc: 'Any resident or committee may submit a proposal in writing to the VDC Secretary.' },
  { n: 2, icon: 'fa-tasks',         title: 'Committee Review',            desc: 'The relevant committee reviews the proposal, consults affected parties, and drafts a recommendation report.' },
  { n: 3, icon: 'fa-user-tie',      title: 'Elder Council Deliberation',  desc: 'The Council of Elders examines the recommendation, checks cultural compatibility and votes.' },
  { n: 4, icon: 'fa-crown',         title: "Fon's Approval",              desc: 'The Fon ratifies, amends or returns the decision. His approval is required for all major resolutions.' },
  { n: 5, icon: 'fa-check-circle',  title: 'Implementation',              desc: 'Approved decisions are implemented by the responsible committee with timelines and public reporting.' },
]

function SectionAnchor({ id }) {
  return <span id={id} style={{ display: 'block', position: 'relative', top: -100 }} />
}

export default function GovernancePage() {
  const [activeSection, setActiveSection] = useState('governance-system')
  const sectionRefs = useRef({})

  useEffect(() => {
    const observers = []
    TOC.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const ob = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      )
      ob.observe(el)
      observers.push(ob)
    })
    return () => observers.forEach(ob => ob.disconnect())
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
          Village Governance
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">
          Governance &amp; <span style={{ color: '#F0A500' }}>Constitution</span>
        </h1>
        <p className="text-sm max-w-xl mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
          How Nkenkak-Ngiesang is governed — from the Fon's Palace to the Village Development Council.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <i className="fas fa-home text-xs" />Home
          </Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>Governance</span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex gap-10 items-start">

          {/* Sticky TOC — desktop only */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24">
            <div className="card p-5">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2" style={{ color: '#1A0A35' }}>
                <i className="fas fa-list-ul" style={{ color: '#F0A500' }} />Table of Contents
              </h3>
              <nav className="space-y-1">
                {TOC.map(item => (
                  <a key={item.id} href={`#${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      fontFamily: 'Poppins,sans-serif',
                      background: activeSection === item.id ? 'rgba(91,45,142,0.08)' : 'transparent',
                      color: activeSection === item.id ? '#5B2D8E' : '#737373',
                      fontWeight: activeSection === item.id ? 700 : 400,
                      borderLeft: activeSection === item.id ? '3px solid #F0A500' : '3px solid transparent',
                    }}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-16">

            {/* 1. Our Governance System */}
            <div>
              <SectionAnchor id="governance-system" />
              <div className="eyebrow mb-3">Overview</div>
              <h2 className="section-title mb-5">Our Governance <span>System</span></h2>
              <div className="card p-7">
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                  Nkenkak-Ngiesang operates under a <strong style={{ color: '#1A0A35' }}>dual governance model</strong> that harmonises centuries-old traditional authority with modern participatory structures. The traditional arm is led by the Fon and supported by the Kwifon society and the Council of Elders. The modern arm is the Village Development Council (VDC), composed of elected officers who manage development, finance and community services.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                  Both arms are expected to act in concert: the VDC cannot implement major decisions without elder and Fon approval, while traditional authority is expected to embrace inclusive development. This balance has preserved cultural continuity while enabling the village to benefit from modern governance practices.
                </p>
                <div className="grid sm:grid-cols-3 gap-5 mt-6">
                  {[
                    { icon: 'fa-crown',    label: 'Traditional Authority', val: 'Fon + Kwifon + Elders' },
                    { icon: 'fa-building', label: 'Development Council',   val: 'Elected Officers' },
                    { icon: 'fa-users',    label: 'Community Assembly',    val: 'All Households' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 text-center"
                      style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.07)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                        style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                        <i className={`fas ${s.icon} text-sm`} style={{ color: '#F0A500' }} />
                      </div>
                      <div className="font-display font-bold text-xs mb-0.5" style={{ color: '#1A0A35' }}>{s.label}</div>
                      <div className="text-[11px]" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. The Fon's Authority */}
            <div>
              <SectionAnchor id="fon-authority" />
              <div className="eyebrow mb-3">Traditional Leadership</div>
              <h2 className="section-title mb-5">The Fon's <span>Authority</span></h2>
              <div className="card p-7">
                <div className="flex items-start gap-5 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                    <i className="fas fa-crown text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base mb-1" style={{ color: '#1A0A35' }}>The Sacred Fon</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                      The Fon is the supreme authority of Nkenkak-Ngiesang — spiritual intermediary between the ancestors and the living, chief judge, commander-in-chief, and custodian of sacred objects and traditions. His authority is hereditary, passing through a designated royal lineage with selection ratified by the Kwifon society.
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Installation', text: 'The Fon is chosen from the royal lineage by the Kwifon society following the passing of the previous Fon. A period of seclusion, purification and initiation precedes the public enthronement ceremony.' },
                    { label: 'Powers',       text: 'The Fon presides over all judicial proceedings, ratifies VDC decisions, appoints committee heads, can veto any resolution, and calls or dissolves village assemblies.' },
                    { label: 'The Palace Court', text: 'The palace courtyard serves as the seat of justice. Disputants present their cases before the Fon and notables in an open session governed by customary procedure.' },
                    { label: 'Symbols',      text: 'The royal stool, the carved staff, the royal elephant tusk horn and the palace python are among the sacred regalia that embody the Fon\'s authority.' },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl p-4"
                      style={{ background: 'rgba(240,165,0,0.05)', border: '1px solid rgba(240,165,0,0.12)' }}>
                      <div className="font-display font-semibold text-xs mb-1.5 flex items-center gap-1.5" style={{ color: '#1A0A35' }}>
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F0A500' }} />
                        {item.label}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Kwifon */}
            <div>
              <SectionAnchor id="kwifon" />
              <div className="eyebrow mb-3">Regulatory Society</div>
              <h2 className="section-title mb-5">Kwifon <span>Regulatory Society</span></h2>
              <div className="card p-7">
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                  The <strong style={{ color: '#1A0A35' }}>Kwifon</strong> (also spelled Kwifo) is the most powerful regulatory society in the Grasslands tradition. It acts as a check on the Fon's authority, enforces village law, and carries out key ritual and judicial functions. Membership is by invitation only, restricted to proven elders of high standing and ritual knowledge.
                </p>
                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,rgba(37,15,71,0.04),rgba(91,45,142,0.06))', border: '1px solid rgba(91,45,142,0.1)' }}>
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    {[
                      { icon: 'fa-shield-alt', label: 'Law Enforcement',   desc: 'Kwifon enforces village ordinances and can impose fines, curfews or collective sanctions.' },
                      { icon: 'fa-user-check', label: 'Fon Selection',     desc: 'Kwifon chooses and installs the Fon, making it the ultimate check on royal succession.' },
                      { icon: 'fa-scroll',     label: 'Sacred Rituals',    desc: 'Performs ancestral rites, seasonal ceremonies, and presides over the sacred grove.' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                          style={{ background: 'rgba(91,45,142,0.1)' }}>
                          <i className={`fas ${item.icon} text-sm`} style={{ color: '#5B2D8E' }} />
                        </div>
                        <div className="font-display font-semibold text-xs mb-1" style={{ color: '#1A0A35' }}>{item.label}</div>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. VDC */}
            <div>
              <SectionAnchor id="vdc" />
              <div className="eyebrow mb-3">Modern Arm</div>
              <h2 className="section-title mb-5">Village Development <span>Council (VDC)</span></h2>
              <div className="card p-7">
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                  The Village Development Council is the modern governance structure of Nkenkak-Ngiesang. Established to manage development, diaspora relations, finance and community services, it is composed of elected officers serving four-year terms. The VDC proposes budgets, manages projects, and represents the village before external bodies including government agencies and NGOs.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Elected Officers',    icon: 'fa-users-cog', text: 'President, Vice-President, Secretary-General, Treasurer, Cultural Secretary, Youth Secretary, and Women\'s Representative.' },
                    { title: 'Mandate',             icon: 'fa-bullseye',  text: 'Economic development, education support, infrastructure, health, cultural preservation, diaspora liaison and financial accountability.' },
                    { title: 'Elections',           icon: 'fa-vote-yea',  text: 'All registered village members (residents and diaspora) vote by secret ballot every four years at the General Village Assembly.' },
                    { title: 'Decision Making',     icon: 'fa-gavel',     text: 'The VDC meets monthly. Resolutions require a simple majority. Major decisions require Elder Council ratification and Fon approval.' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 rounded-2xl p-4"
                      style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.07)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                        <i className={`fas ${item.icon} text-xs`} style={{ color: '#F0A500' }} />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-xs mb-1" style={{ color: '#1A0A35' }}>{item.title}</div>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Council of Elders */}
            <div>
              <SectionAnchor id="elders" />
              <div className="eyebrow mb-3">Wisdom Body</div>
              <h2 className="section-title mb-5">Council of <span>Elders</span></h2>
              <div className="card p-7">
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                  The Council of Elders comprises senior men and women who have demonstrated wisdom, integrity and service to the village. Membership is granted by the Fon on the recommendation of the Kwifon. Elders serve for life and may only be suspended for conduct unbecoming their station.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.15)' }}>
                    <div className="font-display font-semibold text-xs mb-2" style={{ color: '#1A0A35' }}>Eligibility</div>
                    <ul className="space-y-1.5 text-xs" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                      {['Minimum age of 55', 'Outstanding contribution to village life', 'No criminal or moral disqualification', 'Nomination by sitting Elder and Kwifon approval'].map(e => (
                        <li key={e} className="flex items-start gap-2">
                          <i className="fas fa-check-circle text-[10px] mt-0.5 flex-shrink-0" style={{ color: '#F0A500' }} />{e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.08)' }}>
                    <div className="font-display font-semibold text-xs mb-2" style={{ color: '#1A0A35' }}>How They Meet</div>
                    <p className="text-xs leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                      The Council convenes quarterly at the Elder Council House and whenever the Fon calls an extraordinary session. Meetings are presided over by the Senior Elder (Fo Nkwi). Deliberations are conducted in the vernacular and decisions recorded in writing by the VDC Secretary.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Committees */}
            <div>
              <SectionAnchor id="committees" />
              <div className="eyebrow mb-3">Working Groups</div>
              <h2 className="section-title mb-5">Village <span>Committees</span></h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {COMMITTEES.map((c, i) => (
                  <div key={i} className="card p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                      <i className={`fas ${c.icon} text-lg`} style={{ color: '#F0A500' }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm mb-1" style={{ color: '#1A0A35' }}>{c.name}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{c.desc}</p>
                      <div className="mt-2 text-[10px] font-semibold" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>
                        <i className="fas fa-user-tie mr-1" />Chaired by elected committee head
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. How Decisions Are Made */}
            <div>
              <SectionAnchor id="decisions" />
              <div className="eyebrow mb-3">Process</div>
              <h2 className="section-title mb-5">How Decisions <span>Are Made</span></h2>
              <div className="card p-7">
                <div className="space-y-0">
                  {DECISION_STEPS.map((step, i) => (
                    <div key={i} className="flex items-start gap-5 relative">
                      {/* Connector line */}
                      {i < DECISION_STEPS.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-0 w-0.5 z-0"
                          style={{ background: 'linear-gradient(to bottom,rgba(240,165,0,0.4),rgba(91,45,142,0.2))' }} />
                      )}
                      <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-display font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', border: '3px solid #fff', boxShadow: '0 0 0 3px rgba(91,45,142,0.15)' }}>
                        {step.n}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-2 mb-1">
                          <i className={`fas ${step.icon} text-sm`} style={{ color: '#F0A500' }} />
                          <h3 className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>{step.title}</h3>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 8. Village Constitution */}
            <div>
              <SectionAnchor id="constitution" />
              <div className="eyebrow mb-3">Foundational Document</div>
              <h2 className="section-title mb-5">Village <span>Constitution</span></h2>
              <div className="card overflow-hidden">
                {/* Header */}
                <div className="px-7 py-5 text-center" style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)' }}>
                    <i className="fas fa-scroll text-xl" style={{ color: '#F0A500' }} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">Constitutional Principles</h3>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
                    Key articles of the Nkenkak-Ngiesang Village Constitution
                  </p>
                </div>
                {/* Articles */}
                <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
                  {ARTICLES.map(article => (
                    <div key={article.n} className="flex items-start gap-5 px-7 py-5 group hover:bg-purple-50 transition-colors"
                      style={{ '--tw-bg-opacity': 0.03 }}>
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center"
                        style={{ background: 'rgba(240,165,0,0.08)', border: '1.5px solid rgba(240,165,0,0.18)' }}>
                        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Art.</div>
                        <div className="font-display font-bold text-lg leading-none" style={{ color: '#F0A500' }}>{article.n}</div>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm mb-1" style={{ color: '#1A0A35' }}>{article.title}</h4>
                        <p className="text-xs leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>{article.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 9. Dispute Resolution */}
            <div>
              <SectionAnchor id="dispute" />
              <div className="eyebrow mb-3">Justice</div>
              <h2 className="section-title mb-5">Dispute <span>Resolution</span></h2>
              <div className="card p-7">
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                  The Fon's court is the primary mechanism for resolving disputes among village members. Parties in conflict present their case to the Fon and an assembled panel of Elders. The court operates under customary law, applying principles of restitution, reconciliation and community harmony rather than purely punitive sanctions.
                </p>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.08)' }}>
                  <h4 className="font-display font-bold text-sm mb-3" style={{ color: '#1A0A35' }}>Escalation Path</h4>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {[
                      { label: 'Ward Elder Mediation', icon: 'fa-handshake' },
                      { label: "Fon's Court",           icon: 'fa-gavel' },
                      { label: 'Full Elder Council',   icon: 'fa-users' },
                      { label: 'State Courts (last resort)', icon: 'fa-balance-scale' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2 flex-shrink-0">
                        <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
                          style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.09)', border: '1px solid rgba(91,45,142,0.07)' }}>
                          <i className={`fas ${step.icon} text-sm`} style={{ color: '#5B2D8E' }} />
                          <span className="text-xs font-semibold" style={{ color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}>{step.label}</span>
                        </div>
                        {i < 3 && <i className="fas fa-arrow-right text-xs" style={{ color: '#F0A500' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 10. Contact */}
            <div>
              <SectionAnchor id="contact" />
              <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                <div className="wave-pattern absolute inset-0 pointer-events-none rounded-3xl" />
                <div className="relative p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
                    <i className="fas fa-envelope text-2xl" style={{ color: '#F0A500' }} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">Contact the Council</h3>
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
                    Questions about governance, the constitution, or how to raise an issue? Reach out to the Village Development Council.
                  </p>
                  <Link to="/contact" className="btn-gold">
                    <i className="fas fa-paper-plane" />Send a Message
                  </Link>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
