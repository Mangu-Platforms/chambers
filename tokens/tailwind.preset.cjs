/** Chambers Tailwind preset. Consume from any Mangu app. */
module.exports = {
  theme: {
    extend: {
      colors: {
        vermilion: { 500: '#FF4D00', 600: '#C63A00' },
        ink: '#1D1D1F',
        night: '#0B0B0F',
        fog: '#F5F5F7',
        cream: '#FFFAF6',
        muted: '#6E6E73',
        line: 'rgba(255,77,0,0.32)',
      },
      fontFamily: {
        sans: ['SF Pro Text', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        caption: ['11px', { lineHeight: '1.35' }],
        meta: ['12px', { lineHeight: '1.4' }],
        body: ['15px', { lineHeight: '1.47' }],
        lead: ['17px', { lineHeight: '1.45' }],
        title: ['22px', { lineHeight: '1.2' }],
        display: ['34px', { lineHeight: '1.05' }],
        hero: ['56px', { lineHeight: '1.05' }],
      },
      letterSpacing: {
        display: '-0.035em',
        tightish: '-0.02em',
        body: '-0.011em',
      },
      boxShadow: {
        chambers: '0 8px 24px rgba(29,29,31,0.06)',
      },
      borderRadius: {
        chambers: '14px',
        pill: '999px',
      },
      maxWidth: {
        chambers: '1120px',
        resume: '816px',
      },
    },
  },
};
