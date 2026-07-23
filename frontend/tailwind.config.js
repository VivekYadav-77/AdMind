export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      colors: {
        brand: {
          50: '#FDF8F5',
          100: '#F9ECE6',
          400: '#E8836A',
          500: '#D97757', // Primary warm coral
          600: '#C26243',
          900: '#542316'
        },
        bgbase: 'var(--bg-base)',
        bgpanel: 'var(--bg-panel)',
        bgpanelhover: 'var(--bg-panel-hover)',
        bgglass: 'var(--bg-glass)',
        textprimary: 'var(--text-primary)',
        textsecondary: 'var(--text-secondary)',
        textmuted: 'var(--text-muted)',
        borderwarm: 'var(--border-warm)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}
