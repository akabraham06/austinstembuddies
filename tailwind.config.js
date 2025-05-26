/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-freckle-face)', 'system-ui', '-apple-system', 'sans-serif'],
        freckle: ['var(--font-freckle-face)', 'system-ui'],
      },
      colors: {
        brand: {
          primary: '#9DC88D',    // Logo's light green
          secondary: '#4A7C59',  // Darker complementary green
          accent: '#FFD6BA',     // Warm peach accent
          light: '#C4E3B5',      // Lighter variant of primary
          dark: '#1C3829',       // Very dark green for text
        },
        text: {
          primary: '#1C3829',    // Dark green for primary text
          secondary: '#4A7C59',  // Medium green for secondary text
          muted: '#6B9080',      // Muted green for subtle text
        },
        background: {
          light: '#FFFFFF',
          off: '#F9FBF8',        // Very light green tint
          accent: '#F0F7ED',     // Light green background
        },
        border: {
          light: '#E2EFD9',      // Light green border
          dark: '#9DC88D',       // Primary green border
        }
      },
      spacing: {
        '18': '4.5rem',
        '128': '32rem',
      },
      maxWidth: {
        'content': '860px',
        'wide': '1200px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      typography: theme => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: theme('colors.text.primary'),
            lineHeight: '1.75',
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              color: theme('colors.text.secondary'),
            },
            a: {
              color: theme('colors.brand.primary'),
              textDecoration: 'none',
              borderBottom: `1px solid ${theme('colors.brand.primary')}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: theme('colors.brand.secondary'),
                borderColor: theme('colors.brand.secondary'),
              },
            },
            h1: {
              fontFamily: theme('fontFamily.freckle'),
              color: theme('colors.text.primary'),
              fontWeight: '700',
              fontSize: '2.25rem',
              marginTop: '0',
              marginBottom: '2rem',
              lineHeight: '1.2',
            },
            h2: {
              fontFamily: theme('fontFamily.freckle'),
              color: theme('colors.text.primary'),
              fontWeight: '600',
              fontSize: '1.875rem',
              marginTop: '2.5rem',
              marginBottom: '1.5rem',
              lineHeight: '1.3',
            },
            h3: {
              fontFamily: theme('fontFamily.freckle'),
              color: theme('colors.text.primary'),
              fontWeight: '600',
              fontSize: '1.5rem',
              marginTop: '2rem',
              marginBottom: '1rem',
              lineHeight: '1.4',
            },
          },
        },
      }),
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 