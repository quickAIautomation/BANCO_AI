/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'banco-red': '#DC2626',
        'banco-black': '#000000',
        'banco-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}

