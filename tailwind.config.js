/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9eeff',
          200: '#b8defe',
          300: '#85c7fd',
          400: '#4eabfa',
          500: '#2588ea',
          600: '#176dd0',
          700: '#1658a8',
          800: '#174a88',
          900: '#173f71',
        },
      },
      boxShadow: {
        soft: '0 8px 22px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
