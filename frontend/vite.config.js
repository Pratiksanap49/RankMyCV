// tailwind.config.js
import daisyui from "daisyui"; // 👈 Import daisyui at the top

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // 👇 Use the imported variable here
  plugins: [daisyui],
}