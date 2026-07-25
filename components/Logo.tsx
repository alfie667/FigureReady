const LOGO_STYLE = {
  fontFamily: "var(--font-plus-jakarta), Inter, sans-serif",
  fontWeight: 800,
  color: '#1a2f5e',
  letterSpacing: '0.5px',
} as const

function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#1a2f5e" />
      <polyline
        points="7,22 12,15 17,18 25,8"
        stroke="white" strokeWidth="2"
        fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="7"  cy="22" r="1.8" fill="white" />
      <circle cx="12" cy="15" r="1.8" fill="white" />
      <circle cx="17" cy="18" r="1.8" fill="white" />
      <circle cx="25" cy="8"  r="1.8" fill="white" />
    </svg>
  )
}

export function LogoFull({ size = 32, textSize = 17 }: { size?: number; textSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoIcon size={size} />
      <span style={{ ...LOGO_STYLE, fontSize: textSize }}>FigureReady</span>
    </div>
  )
}

export function LogoSmall() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <LogoIcon size={24} />
      <span style={{ ...LOGO_STYLE, fontSize: 14 }}>FigureReady</span>
    </div>
  )
}
