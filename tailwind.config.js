/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: '#D70A0A',
        'slate-navy': '#0A192F',
        'ghost-white': '#F8FAFC',
        emerald: '#00C853',
        'sky-blue': '#2563EB',
        'slate-gray': '#64748B',
        'light-gray': '#E2E8F0',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        h1: ['3.5rem', { lineHeight: '1.2' }],
        h2: ['2.25rem', { lineHeight: '1.3' }],
        h3: ['1.875rem', { lineHeight: '1.4' }],
        body: ['1rem', { lineHeight: '1.5' }],
        small: ['0.875rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        card: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02)',
      },
      backgroundImage: {
        'cusat-campus': "linear-gradient(135deg, rgba(10, 25, 47, 0.85), rgba(215, 10, 10, 0.4)), url('https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop')",
      },
    },
  },
  plugins: [],
};
