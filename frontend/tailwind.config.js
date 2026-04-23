/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT:'#D4AF37', light:'#F0D060', lighter:'#FBF0A0', dark:'#A07820', darker:'#6B4F10' },
        purple: { 50:'#F5F0FF', 100:'#EDE4FF', 200:'#D8C8FF', 300:'#BFA0FF', 400:'#A07AFF', 500:'#7C4DFF', 600:'#5E2FD6', 700:'#4520A8', 800:'#2E1578', 900:'#1A0A50', 950:'#0E0530', DEFAULT:'#7C4DFF' },
        ink: { DEFAULT:'#12082E', light:'#1E1040', mid:'#2A1858' },
        parchment: { DEFAULT:'#F8F4FF', light:'#FDFCFF' },
      },
      fontFamily: {
        sora: ['"sora"','"poppins"','serif'],
        serif:  ['"sans"','Georgia','serif'],
        sans:   ['"DM Sans"','system-ui','sans-serif'],
      },
      backgroundImage: {
        'royal':       'linear-gradient(135deg, #1A0A50 0%, #2E1578 40%, #4520A8 100%)',
        'royal-deep':  'linear-gradient(135deg, #0E0530 0%, #1A0A50 50%, #2A1858 100%)',
        'gold-shine':  'linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #A07820 100%)',
        'hero-mesh':   'radial-gradient(ellipse at 20% 50%, #4520A8 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #2E1578 0%, transparent 50%), linear-gradient(135deg, #0E0530 0%, #1A0A50 100%)',
      },
      boxShadow: {
        'gold':   '0 4px 24px rgba(212,175,55,0.35)',
        'gold-lg':'0 8px 48px rgba(212,175,55,0.45)',
        'purple': '0 4px 24px rgba(94,47,214,0.4)',
      },
      animation: {
        'fade-up':'fadeUp 0.7s ease forwards',
        'slide-up':'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'pulse-gold':'pulseGold 2.5s ease-in-out infinite',
        'float':'float 6s ease-in-out infinite',
        'shimmer':'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp:    { from:{opacity:0,transform:'translateY(24px)'}, to:{opacity:1,transform:'translateY(0)'} },
        slideUp:   { from:{opacity:0,transform:'translateY(16px)'}, to:{opacity:1,transform:'translateY(0)'} },
        pulseGold: { '0%,100%':{boxShadow:'0 0 0 0 rgba(212,175,55,0.4)'},'50%':{boxShadow:'0 0 0 12px rgba(212,175,55,0)'} },
        float:     { '0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-8px)'} },
        shimmer:   { from:{backgroundPosition:'200% center'}, to:{backgroundPosition:'-200% center'} },
      },
    },
  },
  plugins: [],
}
