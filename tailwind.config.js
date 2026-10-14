/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Daylight Warm Pearl & Soft Ivory Palette (Stripe / Arc Inspired)
        bg: '#F4F5F8', // Warm Alabaster / Soft Pearl Canvas
        sidebar: '#FFFFFF', // Crisp White Sidebar
        surface: {
          DEFAULT: '#FFFFFF', // Crisp Warm White Card
          hover: '#F8FAFC',   // Hover Surface
          subtle: '#EAECEF',  // Secondary / Contrasting Tinted Stone
          tint: '#E8F3EE',    // Soft Mint-Tinted Stone
        },
        border: {
          DEFAULT: '#E2E8F0', // Soft subtle border
          strong: '#CBD5E1',  // Focus / highlight border
        },
        text: {
          DEFAULT: '#0F172A', // Deep Slate Navy Primary
          2: '#334155',       // Rich Charcoal Slate Body
          muted: '#64748B',   // Warm Slate Muted
          'muted-2': '#94A3B8', // Deep Muted Slate
        },
        accent: {
          DEFAULT: '#0D9488', // Vibrant Emerald-Teal Primary
          light: '#10B981',   // Warm Emerald
          border: '#0D9488',  // Teal Accent Border
          indigo: '#4F46E5',  // Electric Indigo Accent
          sky: '#0284C7',     // Sky Blue
          amber: '#D97706',   // Warm Amber
          rose: '#E11D48',    // Coral Rose
        },
        warning: {
          DEFAULT: '#D97706',
          text: '#B45309',
        },
      },
      boxShadow: {
        card: '0 12px 40px -12px rgba(15, 23, 42, 0.08)',
        elevated: '0 20px 48px -16px rgba(15, 23, 42, 0.12)',
        subtle: '0 4px 20px -4px rgba(15, 23, 42, 0.04)',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        btn: '8px',
        card: '16px',
        '3xl': '24px',
      },
      fontSize: {
        pageTitle: ['18px', { lineHeight: '24px', fontWeight: '600' }],
        subheading: ['15px', { lineHeight: '20px', fontWeight: '600' }],
        body: ['13px', { lineHeight: '18px' }],
        caption: ['12px', { lineHeight: '16px' }],
        mini: ['11px', { lineHeight: '14px' }],
      },
    },
  },
  plugins: [],
}
