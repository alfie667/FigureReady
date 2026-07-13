import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FigureReady — Publication-ready figures from Excel'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#ffffff',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '64px 72px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Chart icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 3 3 21 21 21" />
            <polyline points="7 16 11 11 14 14 19 7" />
          </svg>
        </div>
        <span style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.03em' }}>
          FigureReady
        </span>
      </div>

      {/* Main message */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1
          style={{
            fontSize: '62px',
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          From Excel to{' '}
          <span style={{ color: '#2563eb' }}>publication-ready</span>
          <br />figure in seconds
        </h1>
        <p style={{ fontSize: '26px', color: '#64748b', margin: 0, fontWeight: '400' }}>
          No Origin. No Prism. Free for researchers.
        </p>
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {['Nature style', 'ACS style', 'PNG & SVG export', 'Error bars'].map((tag) => (
          <div
            key={tag}
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '18px',
              fontWeight: '600',
              padding: '10px 20px',
              borderRadius: '999px',
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
