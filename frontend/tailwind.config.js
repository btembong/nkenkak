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
          DEFAULT: '#4b0082', light: '#a57fc0', lighter: '#c4a0d8',
          dark: '#430075', darker: '#2d004e',
          50: '#F3EDF8', 100: '#e5d9f2', 200: '#c4a0d8', 300: '#a57fc0',
          400: '#a57fc0', 500: '#4b0082', 600: '#430075', 700: '#430075',
          800: '#2d004e', 900: '#2d004e',
        },
        gold: {
          DEFAULT: '#eeb549', light: '#f5cc77', lighter: '#fbe3aa',
          dark: '#c48b1a',
          50: '#fffbef', 100: '#fef3cc', 200: '#fde799', 300: '#f5cc77',
          400: '#eeb549', 500: '#c48b1a',
        },
        cream: '#F3EDF8',
        dark:  '#2d004e',

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
        card:       '0 4px 24px rgba(75,0,130,0.08)',
        'card-lg':  '0 8px 40px rgba(75,0,130,0.14)',
        gold:       '0 4px 20px rgba(238,181,73,0.45)',
        purple:     '0 4px 20px rgba(75,0,130,0.35)',
        'purple-lg':'0 12px 40px rgba(75,0,130,0.4)',
      },

      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #2d004e 0%, #4b0082 50%, #a57fc0 100%)',
        'section-gradient': 'linear-gradient(135deg, #430075 0%, #4b0082 100%)',
        'gold-gradient':    'linear-gradient(135deg, #eeb549 0%, #f5cc77 100%)',
        'cream-gradient':   'linear-gradient(135deg, #F3EDF8 0%, #e5d9f2 100%)',
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
