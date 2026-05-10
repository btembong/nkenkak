/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT:'#5B2D8E', light:'#7B4DB8', lighter:'#9B6FD8', dark:'#3D1A6B', darker:'#250F47', 50:'#F3EEF9', 100:'#E0D4F2', 200:'#C2A8E5', 300:'#A47CD8', 400:'#8650CB', 500:'#5B2D8E', 600:'#4A2478', 700:'#3D1A6B', 800:'#2F145A', 900:'#1A0A35' },
        gold:      { DEFAULT:'#F0A500', light:'#FFB84D', lighter:'#FFD080', dark:'#C87800', 50:'#FFF8E8', 100:'#FFEDB5', 200:'#FFD966', 300:'#FFC933', 400:'#F0A500', 500:'#C87800' },
        neutral:   { 50:'#FAFAFA', 100:'#F5F5F5', 200:'#E8E8E8', 300:'#D4D4D4', 400:'#A3A3A3', 500:'#737373', 600:'#525252', 700:'#404040', 800:'#262626', 900:'#171717' },
        cream:     '#FBF8F2',
        dark:      '#1A0A35',
      },
      fontFamily: {
        sans:    ['Sora','system-ui','sans-serif'],
        body:    ['Poppins','system-ui','sans-serif'],
        display: ['Sora','system-ui','sans-serif'],
      },
      borderRadius: { '4xl':'2rem', '5xl':'2.5rem' },
      boxShadow: {
        'card':    '0 4px 24px rgba(91,45,142,0.08)',
        'card-lg': '0 8px 40px rgba(91,45,142,0.14)',
        'gold':    '0 4px 20px rgba(240,165,0,0.35)',
        'purple':  '0 4px 20px rgba(91,45,142,0.35)',
        'purple-lg':'0 12px 40px rgba(91,45,142,0.4)',
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #3D1A6B 0%, #5B2D8E 50%, #7B4DB8 100%)',
        'section-gradient': 'linear-gradient(135deg, #250F47 0%, #3D1A6B 100%)',
        'gold-gradient':    'linear-gradient(135deg, #F0A500 0%, #FFB84D 100%)',
        'cream-gradient':   'linear-gradient(135deg, #FBF8F2 0%, #F3EEF9 100%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-in-r': 'slideInR 0.5s ease forwards',
        'bounce-sm':  'bounceSm 2s ease-in-out infinite',
        'ticker':     'ticker 25s linear infinite',
      },
      keyframes: {
        fadeUp:    { from:{opacity:0,transform:'translateY(20px)'}, to:{opacity:1,transform:'translateY(0)'} },
        fadeIn:    { from:{opacity:0}, to:{opacity:1} },
        slideInR:  { from:{opacity:0,transform:'translateX(20px)'}, to:{opacity:1,transform:'translateX(0)'} },
        bounceSm:  { '0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-6px)'} },
        ticker:    { from:{transform:'translateX(0)'}, to:{transform:'translateX(-50%)'} },
      },
    },
  },
  plugins: [],
}
