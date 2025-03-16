import type { Config } from 'tailwindcss';
import { plugins } from './src/lib/tailwind.plugins';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/containers/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  safelist: [
    {
      pattern:
        /(border|bg)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(300|900)/
    }
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'fuchsia-gradient': 'linear-gradient(270deg, #8b5cf6, #a78bfa, #c4b5fd)',
        'black-gradient':
          'linear-gradient(270deg, rgba(255, 255, 255, 0),rgba(0, 0, 0, 0.1),rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.1),rgba(255, 255, 255, 0))'
      },
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)'
      },
      keyframes: {
        shake: {
          '0%, 100%': {
            transform: 'translateX(0)'
          },
          '10%, 90%': {
            transform: 'translateX(-10p%)'
          },
          '20%, 80%': {
            transform: 'translateX(10%)'
          },
          '30%, 50%, 70%': {
            transform: 'translateX(-10%)'
          },
          '40%, 60%': {
            transform: 'translateX(10%)'
          }
        },
        shift: {
          '0%': {
            backgroundPosition: '0% 0%'
          },
          '50%': {
            backgroundPosition: '100% 0%'
          },
          '100%': {
            backgroundPosition: '0% 0%'
          }
        }
      },
      animation: {
        shake: 'shake 1.5s ease-in-out infinite',
        shift: 'shift 2s ease infinite'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      }
    }
  },
  plugins: [...plugins.plugins, require('tailwindcss-animate')]
};
export default config;
