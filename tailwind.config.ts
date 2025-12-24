import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0A0A0A",
        surface: "#F5F5F7",
        accent: "#00FFD1", // Surgical Teal
      },
      fontFamily: {
        sans: ['"Neue Montreal"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Editorial New"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px #000',
        'hard-hover': '6px 6px 0px 0px #000',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
} satisfies Config
