/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16233A',
        paper: '#EDF1F5',
        panel: '#FFFFFF',
        circuit: '#2F6FED',
        'circuit-dim': '#DCE6FB',
        signal: '#1C9D6C',
        'signal-dim': '#DCF3E9',
        amber: '#DE9A34',
        'amber-dim': '#FBEEDA',
        line: '#C9D2DC',
        danger: '#D64545',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        panel: '6px',
      },
    },
  },
  plugins: [],
};
