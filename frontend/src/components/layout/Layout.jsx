import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import DonationModal from '../common/DonationModal'
import { useState } from 'react'

export default function Layout() {
  const [donateOpen, setDonateOpen] = useState(false)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onDonate={() => setDonateOpen(true)}/>
      <main className="flex-1">
        <Outlet context={{ openDonate: () => setDonateOpen(true) }}/>
      </main>
      <Footer onDonate={() => setDonateOpen(true)}/>
      {donateOpen && <DonationModal onClose={() => setDonateOpen(false)}/>}
      {/* Floating donate */}
      <button onClick={() => setDonateOpen(true)}
        className="fixed bottom-8 left-8 z-40 group flex items-center overflow-hidden rounded-full shadow-xl transition-all duration-300">
        <span className="w-12 h-12 bg-gradient-to-br from-forest to-forest-light flex items-center justify-center text-cream text-lg flex-shrink-0">
          <i className="fas fa-hand-holding-heart"/>
        </span>
        <span className="max-w-0 group-hover:max-w-[100px] overflow-hidden bg-forest-light text-cream text-xs font-bold tracking-widest uppercase whitespace-nowrap h-12 flex items-center transition-all duration-500 group-hover:pr-4">
          Donate
        </span>
      </button>
    </div>
  )
}
