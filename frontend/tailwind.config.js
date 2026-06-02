/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // ── Brand colours ──────────────────────────────
        primary: {
          DEFAULT: '#5B2D8E', light: '#7B4DB8', lighter: '#9B6FD8',
          dark: '#3D1A6B', darker: '#250F47',
          50: '#F3EEF9', 100: '#E0D4F2', 200: '#C2A8E5', 300: '#A47CD8',
          400: '#8650CB', 500: '#5B2D8E', 600: '#4A2478', 700: '#3D1A6B',
          800: '#2F145A', 900: '#1A0A35',
        },
        gold: {
          DEFAULT: '#F0A500', light: '#FFB84D', lighter: '#FFD080',
          dark: '#C87800',
          50: '#FFF8E8', 100: '#FFEDB5', 200: '#FFD966', 300: '#FFC933',
          400: '#F0A500', 500: '#C87800',
        },
        cream: '#FBF8F2',
        dark:  '#1A0A35',

        // ── shadcn/ui CSS-variable colours ─────────────
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },

      fontFamily: {
        sans:    ['"Exo 2"', 'system-ui', 'sans-serif'],
        body:    ['"Exo 2"', 'system-ui', 'sans-serif'],
        display: ['"Exo 2"', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        card:       '0 4px 24px rgba(91,45,142,0.08)',
        'card-lg':  '0 8px 40px rgba(91,45,142,0.14)',
        gold:       '0 4px 20px rgba(240,165,0,0.35)',
        purple:     '0 4px 20px rgba(91,45,142,0.35)',
        'purple-lg':'0 12px 40px rgba(91,45,142,0.4)',
      },

      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #3D1A6B 0%, #5B2D8E 50%, #7B4DB8 100%)',
        'section-gradient': 'linear-gradient(135deg, #250F47 0%, #3D1A6B 100%)',
        'gold-gradient':    'linear-gradient(135deg, #F0A500 0%, #FFB84D 100%)',
        'cream-gradient':   'linear-gradient(135deg, #FBF8F2 0%, #F3EEF9 100%)',
      },

      keyframes: {
        // shadcn
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        // existing
        fadeUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideInR: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        bounceSm: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        ticker:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-in-r': 'slideInR 0.5s ease forwards',
        'bounce-sm':  'bounceSm 2s ease-in-out infinite',
        'ticker':     'ticker 25s linear infinite',
      },
    },
  },
  plugins: [],
}
