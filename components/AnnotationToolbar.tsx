'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  onAdd: (type: string, options?: Record<string, unknown>) => void
  onInsertSymbol: (sym: string) => void
}

// ── Inline SVG tool icons ──────────────────────────────────────────────────
const StraightLine = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <line x1="1" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const ArrowLine = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="12,4 19,7 12,10" fill="currentColor" />
  </svg>
)
const DoubleArrow = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <line x1="6" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="7,4 0,7 7,10" fill="currentColor" />
    <polygon points="13,4 20,7 13,10" fill="currentColor" />
  </svg>
)
const DashedLine = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <line x1="1" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
  </svg>
)
const DashedArrow = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
    <polygon points="12,4 19,7 12,10" fill="currentColor" />
  </svg>
)
const RectShape = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <rect x="1.75" y="2.75" width="16.5" height="8.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const EllipseShape = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <ellipse cx="10" cy="7" rx="8.5" ry="5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const TextShape = () => (
  <svg width="20" height="16" viewBox="0 0 20 16">
    <text x="10" y="13" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor" fontFamily="Georgia, serif">T</text>
  </svg>
)

// ── Symbol grid ────────────────────────────────────────────────────────────
const SYMBOLS = [
  // Greek lowercase
  'α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ',
  'ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω',
  // Greek uppercase (selected)
  'Γ','Δ','Θ','Λ','Σ','Φ','Ψ','Ω',
  // Math operators
  '±','×','÷','∞','≤','≥','≈','≠',
  // Calculus / advanced
  '∑','∫','√','∂','∇','°','·','~',
  // Super/subscript & fractions
  '¹','²','³','⁻¹','⁻²','⁻³','½','¼',
  // Arrows
  '→','←','↑','↓','↔','⇒','⇐','⇔',
]

// ── Tool button ────────────────────────────────────────────────────────────
function ToolBtn({
  icon, label, onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
    >
      {icon}
    </button>
  )
}

// ── Group pill ─────────────────────────────────────────────────────────────
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 select-none mr-1">
        {label}
      </span>
      {children}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AnnotationToolbar({ onAdd, onInsertSymbol }: Props) {
  const [showSymbols, setShowSymbols] = useState(false)
  const symRef = useRef<HTMLDivElement>(null)

  // Close symbol panel on outside click
  useEffect(() => {
    if (!showSymbols) return
    const handler = (e: MouseEvent) => {
      if (!symRef.current?.contains(e.target as Node)) setShowSymbols(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSymbols])

  const lineTools = [
    { label: 'Trait droit', icon: <StraightLine />, opts: { dash: false, headStart: false, headEnd: false } },
    { label: 'Flèche', icon: <ArrowLine />, opts: { dash: false, headStart: false, headEnd: true } },
    { label: 'Double flèche', icon: <DoubleArrow />, opts: { dash: false, headStart: true, headEnd: true } },
    { label: 'Trait pointillé', icon: <DashedLine />, opts: { dash: true, headStart: false, headEnd: false } },
    { label: 'Flèche pointillée', icon: <DashedArrow />, opts: { dash: true, headStart: false, headEnd: true } },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Lines */}
      <Group label="Lignes">
        {lineTools.map((t, i) => (
          <ToolBtn key={i} icon={t.icon} label={t.label} onClick={() => onAdd('line', t.opts)} />
        ))}
      </Group>

      {/* Shapes */}
      <Group label="Formes">
        <ToolBtn icon={<RectShape />} label="Rectangle" onClick={() => onAdd('rect')} />
        <ToolBtn icon={<EllipseShape />} label="Ellipse" onClick={() => onAdd('ellipse')} />
      </Group>

      {/* Text */}
      <Group label="Texte">
        <ToolBtn icon={<TextShape />} label="Texte libre" onClick={() => onAdd('text')} />
      </Group>

      {/* Symbols dropdown */}
      <div ref={symRef} className="relative">
        <button
          onClick={() => setShowSymbols(v => !v)}
          className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors select-none"
        >
          <span className="text-sm font-normal">Σ</span>
          Symboles
          <svg
            className={`w-3 h-3 text-slate-400 transition-transform ${showSymbols ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSymbols && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 min-w-max">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-2 select-none">
              Symboles scientifiques
            </p>
            <div className="grid grid-cols-12 gap-0.5">
              {SYMBOLS.map(sym => (
                <button
                  key={sym}
                  title={sym}
                  onClick={() => { onInsertSymbol(sym); setShowSymbols(false) }}
                  className="w-7 h-7 flex items-center justify-center text-sm text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
