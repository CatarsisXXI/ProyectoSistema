/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#2E7D32',
        accent: '#FF6F00',
        background: '#F5F7FA',
        surface: '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#64748B',
        error: '#DC2626',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
