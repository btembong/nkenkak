import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function NewsCard({ article: a, featured }) {
  return (
    <Link to={`/news/${a.slug}`} className={`card group block ${featured?'md:col-span-2':''}`}>
      <div className={`bg-gradient-to-br from-earth to-earth-light flex items-center justify-center relative overflow-hidden ${featured?'h-64':'h-44'}`}>
        {a.cover_image
          ? <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          : <i className="fas fa-newspaper text-white/20 text-4xl"/>}
        {a.category && <span className="absolute top-3 left-3 bg-gold text-earth text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{a.category}</span>}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-earth/40 text-xs mb-2">
          <span className="flex items-center gap-1"><i className="fas fa-calendar"/> {a.published_at ? format(new Date(a.published_at),'MMM d, yyyy') : 'Draft'}</span>
          {a.author_name && <span className="flex items-center gap-1"><i className="fas fa-user"/> {a.author_name}</span>}
        </div>
        <h3 className={`font-serif text-earth leading-snug mb-2 group-hover:text-gold-dark transition-colors ${featured?'text-xl':'text-base'}`}>{a.title}</h3>
        <p className="text-earth/60 text-sm line-clamp-2 leading-relaxed">{a.excerpt}</p>
        <div className="flex items-center gap-1.5 text-gold-dark text-xs font-bold mt-3 tracking-wide">Read More <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"/></div>
      </div>
    </Link>
  )
}
