/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#E8DFD8',
        },
        gold: {
          50: '#fdfbf7',
          100: '#faf7f2',
          200: '#f3eedf',
          300: '#e5d7b5',
          400: '#d4bc87',
          500: '#c5a059',
          600: '#b08643',
          700: '#8c6834',
        },
      },
    },
  },
  plugins: [],
};
