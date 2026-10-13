/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#070d1f',
        sidebar: '#0a1128',
        surface: {
          DEFAULT: '#0d1631',
          hover: '#16213f',
        },
        border: {
          DEFAULT: '#1f2c52',
          strong: '#2e3d6b',
        },
        text: {
          DEFAULT: '#f1ede8',
          2: '#dfe4f2',
          muted: '#aab4d3',
          'muted-2': '#8f9bc0',
        },
        accent: {
          DEFAULT: '#10b981',
          border: '#065f46',
        },
        warning: {
          DEFAULT: '#f59e0b',
          text: '#fcd34d',
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
