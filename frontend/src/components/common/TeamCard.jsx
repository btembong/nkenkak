const TEAM_COLORS = {
  leadership:  'from-earth to-earth-light',
  development: 'from-forest to-forest-light',
  culture:     'from-[#5C1A1A] to-[#8B2A2A]',
  youth:       'from-[#1A3A5C] to-[#2A5080]',
  health:      'from-[#1A3D3A] to-[#2D5C58]',
  environment: 'from-[#2D4A1A] to-[#3D6020]',
}

export default function TeamCard({ member: m }) {
  const grad = TEAM_COLORS[m.team] || TEAM_COLORS.leadership
  return (
    <div className="card group">
      <div className={`h-52 bg-gradient-to-br ${grad} flex items-center justify-center relative`}>
        {m.avatar_url
          ? <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover"/>
          : <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/20 flex items-center justify-center text-2xl text-white/60"><i className="fas fa-user"/></div>
        }
        <span className="absolute bottom-3 right-3 bg-gold/90 text-earth text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{m.team}</span>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-earth text-base mb-0.5">{m.name}</h3>
        <div className="text-gold-dark text-xs font-semibold tracking-wide mb-2">{m.role_title}</div>
        {m.bio && <p className="text-earth/55 text-xs leading-relaxed line-clamp-2">{m.bio}</p>}
        <div className="flex gap-2 mt-3">
          {m.facebook  && <a href={m.facebook}  className="w-7 h-7 rounded-full bg-earth/8 flex items-center justify-center text-earth/50 hover:bg-gold hover:text-earth text-xs transition-all"><i className="fab fa-facebook-f"/></a>}
          {m.linkedin  && <a href={m.linkedin}  className="w-7 h-7 rounded-full bg-earth/8 flex items-center justify-center text-earth/50 hover:bg-gold hover:text-earth text-xs transition-all"><i className="fab fa-linkedin-in"/></a>}
          {m.twitter   && <a href={m.twitter}   className="w-7 h-7 rounded-full bg-earth/8 flex items-center justify-center text-earth/50 hover:bg-gold hover:text-earth text-xs transition-all"><i className="fab fa-twitter"/></a>}
        </div>
      </div>
    </div>
  )
}
