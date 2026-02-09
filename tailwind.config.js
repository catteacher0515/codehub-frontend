/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom deep dark palette
        background: '#050505',
        surface: '#0A0A0A',
        'surface-highlight': '#151515',
        border: '#222222',
        
        // Anti-mainstream accent: Acid Lime / Cyber Yellow
        primary: '#DFFF00', 
        'primary-dim': '#b3cc00',
        
        // Text
        'text-main': '#E0E0E0',
        'text-muted': '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
