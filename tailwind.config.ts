import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pretendard)'],
      },
      colors: {
        // Figma Export 디자인 시스템 기반 색상
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: '#c4b5f7',
          foreground: '#fff',
        },
        secondary: {
          DEFAULT: '#8bb5ff',
          foreground: '#fff',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Figma Export에서 추출한 주요 색상들
        figma: {
          primary: '#6b73ff',
          secondary: '#9f7aea',
          gradient: {
            primary: 'linear-gradient(45deg, #6b73ff, #9f7aea)',
            secondary: 'linear-gradient(135deg, #6b73ff, #9f7aea)',
            card: 'linear-gradient(45deg, #e0e7ff, #ede9fe)',
          },
          text: {
            primary: '#374151',
            secondary: '#6b7280',
            muted: '#9ca3af',
          },
          border: {
            light: '#f3f4f6',
            medium: '#e5e7eb',
            dark: '#d1d5db',
          },
          background: {
            light: '#f9fafb',
            card: '#ffffff',
            muted: '#fafbfc',
          },
          badge: {
            blue: '#6b73ff',
            purple: '#9f7aea',
            gray: '#6b7280',
          },
          rating: '#fbbf24',
          error: '#ef4444',
          success: '#22c55e',
        },
        // 기존 색상 시스템 유지
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['0.95rem', { lineHeight: '1.4rem' }],
        lg: ['1.05rem', { lineHeight: '1.5rem' }],
        xl: ['1.2rem', { lineHeight: '1.6rem' }],
        '2xl': ['1.35rem', { lineHeight: '1.7rem' }],
        '3xl': ['1.5rem', { lineHeight: '1.8rem' }],
        '4xl': ['1.8rem', { lineHeight: '2rem' }],
        '5xl': ['2.2rem', { lineHeight: '1.2' }],
        '6xl': ['2.6rem', { lineHeight: '1.2' }],
        '7xl': ['3rem', { lineHeight: '1.1' }],
        '8xl': ['3.5rem', { lineHeight: '1.1' }],
        '9xl': ['4rem', { lineHeight: '1' }],
      },
      borderRadius: {
        '4xl': '2rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        medium: '0 4px 20px rgba(0, 0, 0, 0.08)',
        strong:
          '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        button: '0 10px 25px -5px rgba(107, 115, 255, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(45deg, #6b73ff, #9f7aea)',
        'gradient-secondary': 'linear-gradient(135deg, #6b73ff, #9f7aea)',
        'gradient-card': 'linear-gradient(45deg, #e0e7ff, #ede9fe)',
      },
    },
  },
  plugins: [],
}
export default config
