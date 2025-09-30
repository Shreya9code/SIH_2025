/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        yellowTheme: '#FFD34E',
        redTheme: '#D94F3D',
        brownTheme: '#8B4513',
      },
    },
  },
  plugins: [],
};
