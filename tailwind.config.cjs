/**** Tailwind CSS Configuration ****/
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'light-bg': '#f8f9fa',
        'light-text': '#212529',
        'light-card': '#ffffff',
        'light-border': '#dee2e6',
        'light-accent': '#0d6efd',
        'light-accent-hover': '#0b5ed7',
        'light-subtle-bg': '#e9ecef',

        'dark-bg': '#121212',
        'dark-text': '#e9ecef',
        'dark-card': '#1e1e1e',
        'dark-border': '#343a40',
        'dark-accent': '#63e6be',
        'dark-accent-hover': '#38d9a9',
        'dark-subtle-bg': '#2c2c2c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};