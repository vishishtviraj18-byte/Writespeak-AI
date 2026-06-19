/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: "#FF5E7E",
        secondary: "#38E4B7",
        accent: "#FFD166",
        back: "#E8F9FD",
        doraBlue: "#00A5DC",
      }
    },
  },
  plugins: [],
}
