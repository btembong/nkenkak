import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import DonationModal from '../common/DonationModal'

export default function Layout() {
  const [donateProjectId, setDonateProjectId] = useState(null)
  const [showTop, setShowTop] = useState(false)

  const openDonate = (projectId = null) => setDonateProjectId(projectId || '__open__')
  const closeDonate = () => setDonateProjectId(null)

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 500)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onDonate={openDonate}/>
      <main className="flex-1">
        <Outlet context={{ openDonate }}/>
      </main>
      <Footer onDonate={openDonate}/>

      {donateProjectId && (
        <DonationModal
          onClose={closeDonate}
          defaultProject={donateProjectId === '__open__' ? '' : donateProjectId}
        />
      )}

      {/* Floating donate button — hidden on mobile (available in mobile menu) */}
      <button onClick={() => openDonate()}
        className="hidden sm:flex fixed bottom-8 left-8 z-40 group items-center overflow-hidden rounded-full shadow-xl transition-all duration-300 animate-pulse-gold"
        style={{boxShadow:'0 4px 24px rgba(91,45,142,0.35)'}}>
        <span className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-lg text-white"
          style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
          <i className="fas fa-hand-holding-heart"/>
        </span>
        <span className="max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap h-12 flex items-center transition-all duration-500 group-hover:pr-4 text-xs font-bold tracking-widest uppercase"
          style={{background:'#5B2D8E', color:'#F0A500'}}>
          Donate
        </span>
      </button>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)',
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? 'auto' : 'none',
          transform: showTop ? 'translateY(0)' : 'translateY(16px)',
          boxShadow: '0 4px 20px rgba(91,45,142,0.4)',
        }}>
        <i className="fas fa-arrow-up text-sm"/>
      </button>
    </div>
  )
}
