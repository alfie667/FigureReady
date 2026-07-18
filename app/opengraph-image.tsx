import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FigureReady — Publication-ready figures from Excel'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#0f172a',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        padding: '0 80px',
      }}
    >
      {/* Subtle blue glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.25) 0%, transparent 70%)',
          display: 'flex',
        }}
      />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 3 3 21 21 21" />
            <polyline points="7 16 11 11 14 14 19 7" />
          </svg>
        </div>
        <span style={{ fontSize: '24px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.01em' }}>
          FigureReady
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: '56px',
          fontWeight: '800',
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px',
          marginBottom: '28px',
        }}
      >
        <span>Excel → Publication figure.</span>
        <span style={{ color: '#60a5fa' }}>In seconds.</span>
      </div>

      {/* Subline */}
      <p
        style={{
          fontSize: '22px',
          color: '#64748b',
          margin: '0 0 52px 0',
          fontWeight: '400',
          textAlign: 'center',
        }}
      >
        No Origin. No Prism. Nature & ACS styles. Free to try.
      </p>

      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {['Nature style', 'ACS style', 'PNG · SVG · TIFF', 'Error bars'].map((tag) => (
          <div
            key={tag}
            style={{
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(37,99,235,0.3)',
              color: '#93c5fd',
              fontSize: '16px',
              fontWeight: '500',
              padding: '8px 18px',
              borderRadius: '999px',
              display: 'flex',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  )
}
