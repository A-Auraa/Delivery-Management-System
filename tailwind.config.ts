import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f6f7',
          100: '#e8eaec',
          200: '#c8ccd2',
          300: '#a1a8b2',
          400: '#727c8a',
          500: '#57616f',
          600: '#454d5a',
          700: '#383e48',
          800: '#262a31',
          900: '#14161a',
        },
        route: {
          // primary accent — a route-line teal, not the generic terracotta/violet defaults
          50: '#eefbf9',
          100: '#d3f4ee',
          200: '#a4e9dd',
          300: '#6dd8c7',
          400: '#3bc0ac',
          500: '#1ea491',
          600: '#158376',
          700: '#146960',
          800: '#14544e',
          900: '#134642',
        },
        signal: {
          amber: '#c78a1f',
          blue: '#2f6fb0',
          violet: '#6a5acd',
          green: '#1e8e5a',
          red: '#c0392b',
          gray: '#8b93a1',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
