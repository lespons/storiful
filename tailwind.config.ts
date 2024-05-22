import type { Config } from 'tailwindcss';
import { plugins } from './src/lib/tailwind.plugins';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/containers/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
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
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 90%': { transform: 'translateX(-10p%)' },
          '20%, 80%': { transform: 'translateX(10%)' },
          '30%, 50%, 70%': { transform: 'translateX(-10%)' },
          '40%, 60%': { transform: 'translateX(10%)' }
        },
        shift: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 0%' },
          '100%': { backgroundPosition: '0% 0%' }
        }
      },
      animation: {
        shake: 'shake 1.5s ease-in-out infinite',
        shift: 'shift 2s ease infinite'
      }
    }
  },
  plugins: [...plugins.plugins]
};
export default config;
