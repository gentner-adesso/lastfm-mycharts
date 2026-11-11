/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lastfm: {
          red: '#ff1721',
          hover: '#e00d16',
          glow: 'rgba(255, 23, 33, 0.55)',
        },
        neu: {
          bg: '#070709',
          surface: '#0e0f12',
          light: '#1b1d22',
          dark: '#000000',
          border: 'rgba(255, 255, 255, 0.14)',
          text: '#ffffff',
          muted: '#d1d5db',
        }
      },
      boxShadow: {
        'neu-flat': '8px 8px 20px #000000, -4px -4px 14px rgba(255, 255, 255, 0.06)',
        'neu-flat-sm': '4px 4px 12px #000000, -2px -2px 8px rgba(255, 255, 255, 0.05)',
        'neu-pressed': 'inset 4px 4px 10px #000000, inset -3px -3px 8px rgba(255, 255, 255, 0.06)',
        'neu-pressed-sm': 'inset 2px 2px 6px #000000, inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
        'neu-red-glow': '0 0 25px rgba(255, 23, 33, 0.65), 5px 5px 14px #000000',
        'neu-red-pressed': 'inset 4px 4px 8px #8b0007, inset -3px -3px 8px #ff4d55',
      }
    },
  },
  plugins: [],
}
