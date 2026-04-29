/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        guild: {
          void: '#030006',
          deep: '#0a0514',
          surface: '#12081f',
          raised: '#1a0d2e',
          border: '#2e1a4a',
          muted: '#9d8bb8',
          text: '#ede9f7',
          accent: '#a855f7',
          accentbright: '#c084fc',
          accentdim: '#7c3aed',
        },
      },
      backgroundImage: {
        'guild-gradient':
          'radial-gradient(ellipse 100% 70% at 50% -15%, rgba(124, 58, 237, 0.28), transparent 55%), linear-gradient(165deg, #030006 0%, #0a0514 40%, #000000 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(168, 85, 247, 0.45)',
      },
    },
  },
  plugins: [],
};
