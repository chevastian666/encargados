export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Tablet specific breakpoints
      'tablet': '768px',
      'tablet-portrait': { 'raw': '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)' },
      'tablet-landscape': { 'raw': '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)' },
      'mobile': { 'max': '767px' },
      'desktop': '1025px',
      // Galaxy Tab Active5 5G specific breakpoints
      'galaxy-tab-active5': { 'raw': '(min-width: 1200px) and (max-width: 1920px)' },
      'galaxy-tab-active5-portrait': { 'raw': '(min-width: 1200px) and (max-width: 1920px) and (orientation: portrait)' },
      'galaxy-tab-active5-landscape': { 'raw': '(min-width: 1200px) and (max-width: 1920px) and (orientation: landscape)' }
    },
    extend: {
      animation: {
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
        'in': 'in 0.2s ease-out',
      },
      keyframes: {
        in: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        gray: {
          750: '#2d3748', // Custom gray between 700 and 800
        },
      },
      spacing: {
        'touch': '48px', // Minimum touch target size
        'touch-lg': '56px', // Large touch target
        'touch-xl': '64px', // Extra large touch target
      },
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px', 
        'touch-xl': '64px',
      },
      minWidth: {
        'touch': '48px',
        'touch-lg': '56px',
        'touch-xl': '64px',
      },
    },
  },
  safelist: [
    'text-green-500',
    'text-blue-500',
    'text-red-500',
    'text-orange-500',
    'text-purple-500',
    'text-yellow-500',
    'text-teal-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-green-600',
    'bg-blue-600',
    'bg-red-600',
    'bg-orange-600',
    'bg-purple-600',
    'bg-teal-600',
    'stroke-green-500',
    'stroke-blue-500',
    'stroke-red-500',
    'stroke-orange-500',
    'stroke-purple-500',
    'fill-green-500',
    'fill-blue-500',
    'fill-red-500',
    'fill-orange-500',
    'fill-purple-500',
  ],
  plugins: [],
};
