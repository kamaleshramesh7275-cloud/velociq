/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#F4F6F9',
        'bg-surface': '#FFFFFF',
        'bg-sunken': '#EBEEF3',
        'bg-raised': '#F8FAFC',
        'base': '#F4F6F9',
        'line': '#CBD5E1',
        'line-light': '#E2E8F0',
        'text-hi': '#0A0F1D',
        'text-mid': '#1E293B',
        'text-lo': '#334155',
        
        // Showroom Precision Automotive Brand Colors
        'brand-blue': '#0B3D91',
        'brand-red': '#D7263D',
        'accent-green': '#047857',
        'accent-amber': '#B45309',
        'accent-sky': '#0284C7',
        
        // Backward-compatibility aliases mapped to automotive palette
        'accent-cyan': '#0284C7',
        'accent-emerald': '#047857',
        'accent-rose': '#D7263D',
        'accent-violet': '#0B3D91',

        // 10% permitted dark cluster & 3D stage
        'cluster-bg': '#0A0F1C',
      },
      fontFamily: {
        display: ['"Rajdhani"', '"Barlow Semi Condensed"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'showroom': '0 1px 3px rgba(15, 23, 42, 0.05), 0 8px 24px rgba(15, 23, 42, 0.05)',
        'showroom-hover': '0 2px 6px rgba(15, 23, 42, 0.08), 0 12px 32px rgba(15, 23, 42, 0.08)',
        'bezel': 'inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(15, 23, 42, 0.06)',
        'cluster': 'inset 0 2px 10px rgba(0, 0, 0, 0.85), 0 6px 20px rgba(0, 0, 0, 0.35)',
        'hero-blue': '0 0 20px -3px rgba(11, 61, 145, 0.25)',
        'hero-cyan': '0 0 20px -3px rgba(30, 136, 229, 0.25)',
        'hero-emerald': '0 0 20px -3px rgba(15, 157, 107, 0.25)',
        'hero-rose': '0 0 20px -3px rgba(215, 38, 61, 0.25)',
        'hero-amber': '0 0 20px -3px rgba(242, 169, 0, 0.25)',
        'hero-violet': '0 0 20px -3px rgba(11, 61, 145, 0.25)',
        'card-glow': '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 20px rgba(15, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
};
