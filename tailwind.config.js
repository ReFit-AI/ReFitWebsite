/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        // iOS Dark Mode Surface System (Apple HIG)
        surface: {
          primary: '#000000',      // True black - base
          elevated: '#1C1C1E',     // Elevated surface (cards, sheets)
          secondary: '#2C2C2E',    // Secondary elevated (nested cards)
          tertiary: '#3A3A3C',     // Tertiary (hover states)
          quaternary: '#48484A',   // Borders, dividers
        },
        // iOS Label Colors
        label: {
          primary: '#FFFFFF',      // Primary text
          secondary: '#8E8E93',    // Secondary text (gray-600)
          tertiary: '#636366',     // Tertiary text (gray-700)
          quaternary: '#48484A',   // Quaternary text
        },
        // Accent colors (use sparingly)
        accent: {
          blue: '#007AFF',         // iOS blue - primary actions
          green: '#30D158',        // iOS green - success
          orange: '#FF9F0A',       // iOS orange - warnings
          red: '#FF453A',          // iOS red - destructive
          purple: '#BF5AF2',       // iOS purple - brand accent
        },
        // Legacy Solana colors (for gradual migration)
        solana: {
          purple: '#9945FF',
          green: '#14F195',
          dark: '#1a1a1a',
        },
      },
      fontFamily: {
        // System font stack that renders SF Pro on Apple devices
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // iOS Typography Scale
        'display': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title-1': ['34px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-2': ['28px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-3': ['22px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        'headline': ['17px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '1.5', letterSpacing: '0' }],
        'callout': ['16px', { lineHeight: '1.4', letterSpacing: '0' }],
        'subhead': ['15px', { lineHeight: '1.4', letterSpacing: '0' }],
        'footnote': ['13px', { lineHeight: '1.4', letterSpacing: '0' }],
        'caption-1': ['12px', { lineHeight: '1.3', letterSpacing: '0' }],
        'caption-2': ['11px', { lineHeight: '1.2', letterSpacing: '0.01em' }],
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
      },
      borderRadius: {
        'ios': '12px',        // Standard iOS corner radius
        'ios-lg': '16px',     // Large cards
        'ios-xl': '20px',     // Sheets, modals
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.16, 1, 0.3, 1)', // iOS spring-like easing
      },
    },
  },
  plugins: [],
}
