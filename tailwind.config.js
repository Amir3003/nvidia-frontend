/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pure Carbon Palette (Vercel / Raycast / Linear Dark Standard)
        bg: '#09090b', // Pure Carbon App Background
        sidebar: '#09090b',
        surface: {
          DEFAULT: '#121215', // Elevated Card / Surface Background
          hover: '#18181b',   // Secondary / Interactive Hover Surface
        },
        border: {
          DEFAULT: '#27272a', // Crisp 1px border-zinc-800
          strong: '#3f3f46',  // Hover / focus border border-zinc-700
        },
        text: {
          DEFAULT: '#fafafa', // Primary text-zinc-50
          2: '#e4e4e7',       // Secondary text-zinc-200
          muted: '#a1a1aa',   // Secondary text-zinc-400
          'muted-2': '#71717a', // Muted text-zinc-500
        },
        accent: {
          DEFAULT: '#10b981', // Refined Emerald #10b981
          border: '#059669',  // emerald-600
        },
        warning: {
          DEFAULT: '#f59e0b',
          text: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        btn: '6px',
        card: '8px',
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
