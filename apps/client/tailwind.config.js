export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          50: '#FAF8FF',
          100: '#F4EEFF',
          200: '#E7DCFF',
          300: '#D5C2FE',
          400: '#BA9BFB',
          500: '#9D6BF8',
          600: '#8442F2',
          700: '#6C24E8',
          800: '#5415B8',
          900: '#3D0D88',
        },
        yape: '#742284',
        plin: '#00D2B5',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'pastel': '0 10px 30px -10px rgba(132, 66, 242, 0.15)',
        'pastel-lg': '0 20px 40px -15px rgba(132, 66, 242, 0.25)',
      }
    },
  },
  plugins: [],
}
