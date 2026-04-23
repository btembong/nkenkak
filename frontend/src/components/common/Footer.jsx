import { Link } from 'react-router-dom'

export default function Footer({ onDonate }) {
  return (
    <footer className="bg-earth text-cream/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="py-16 border-b border-white/6 grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-cinzel text-gold text-xl font-bold mb-4">🌿 Nkenkak-Ngiesang</h3>
            <p className="text-sm leading-relaxed mb-6 text-cream/50">A proud village community in Cameroon's West Region, united by heritage, driven by progress, and connected across the world.</p>
            <div className="flex gap-2">
              {['fab fa-facebook-f','fab fa-twitter','fab fa-instagram','fab fa-youtube','fab fa-whatsapp'].map(icon => (
                <a key={icon} href="#" className="w-8 h-8 rounded-full bg-white/6 flex items-center justify-center text-cream/40 hover:bg-gold hover:text-earth text-sm transition-all">
                  <i className={icon}/>
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-cinzel text-gold text-xs tracking-[3px] uppercase mb-5">Navigate</h4>
            <ul className="space-y-2.5">
              {[{to:'/culture',l:'Our Culture'},{to:'/projects',l:'Projects'},{to:'/events',l:'Events'},{to:'/gallery',l:'Gallery'},{to:'/team',l:'Team'},{to:'/news',l:'News'}].map(i => (
                <li key={i.to}><Link to={i.to} className="text-sm hover:text-gold transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-[8px] text-gold/40"/>{i.l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-cinzel text-gold text-xs tracking-[3px] uppercase mb-5">Get Involved</h4>
            <ul className="space-y-2.5">
              <li><button onClick={onDonate} className="text-sm hover:text-gold transition-colors flex items-center gap-2 text-cream/60"><i className="fas fa-chevron-right text-[8px] text-gold/40"/>Make a Donation</button></li>
              {[{to:'/team',l:'Join the Team'},{to:'/diaspora',l:'Diaspora Network'},{to:'/forum',l:'Community Forum'},{to:'/contact',l:'Partner With Us'}].map(i => (
                <li key={i.to}><Link to={i.to} className="text-sm hover:text-gold transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-[8px] text-gold/40"/>{i.l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cinzel text-gold text-xs tracking-[3px] uppercase mb-5">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-xs flex-shrink-0"><i className="fas fa-map-marker-alt"/></div><span>Nkenkak-Ngiesang, West Region, Cameroon</span></li>
              <li className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-xs flex-shrink-0"><i className="fas fa-envelope"/></div><span>contact@nkenkak-ngiesang.cm</span></li>
              <li className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-xs flex-shrink-0"><i className="fab fa-whatsapp"/></div><span>+237 6XX XXX XXX</span></li>
            </ul>
          </div>
        </div>

        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/30">
          <span>© {new Date().getFullYear()} Nkenkak-Ngiesang Village Community. All rights reserved.</span>
          <span>Built with ❤️ for the village &nbsp;·&nbsp; <Link to="/contact" className="hover:text-gold">Terms</Link> &nbsp;·&nbsp; <Link to="/contact" className="hover:text-gold">Privacy</Link></span>
        </div>
      </div>
    </footer>
  )
}
