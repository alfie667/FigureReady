'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  onAdd: (type: string, options?: Record<string, unknown>) => void
  onInsertSymbol: (sym: string) => void
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
const StraightLine = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="1" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const ArrowLine = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="1" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="13,4 21,7 13,10" fill="currentColor" />
  </svg>
)
const DoubleArrow = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="7" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="8,4 0,7 8,10" fill="currentColor" />
    <polygon points="14,4 22,7 14,10" fill="currentColor" />
  </svg>
)
const DashedLine = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="1" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="1.5"
      strokeDasharray="4.5 3" strokeLinecap="round" />
  </svg>
)
const DashedArrow = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="1" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4.5 3" />
    <polygon points="13,4 21,7 13,10" fill="currentColor" />
  </svg>
)
const RectShape = () => (
  <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
    <rect x="1.75" y="2" width="18.5" height="11" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const EllipseShape = () => (
  <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
    <ellipse cx="11" cy="7.5" rx="9.25" ry="5.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const TextShape = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <text x="9" y="14" textAnchor="middle" fontSize="15" fontWeight="600"
      fill="currentColor" fontFamily="Georgia, serif">T</text>
  </svg>
)
const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 3.5l3 3 3-3" />
  </svg>
)

// ── Symbols ────────────────────────────────────────────────────────────────
const SYMBOLS = [
  'α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ',
  'ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω',
  'Γ','Δ','Θ','Λ','Σ','Φ','Ψ','Ω',
  '±','×','÷','∞','≤','≥','≈','≠',
  '∑','∫','√','∂','∇','°','·','~',
  '¹','²','³','⁻¹','⁻²','⁻³','½','¼',
  '→','←','↑','↓','↔','⇒','⇐','⇔',
]

// ── Tool button ────────────────────────────────────────────────────────────
function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
    >
      {icon}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AnnotationToolbar({ onAdd, onInsertSymbol }: Props) {
  const [showSymbols, setShowSymbols] = useState(false)
  const symRef = useRef<HTMLDivElement>(null)

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

  const sep = <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />

  return (
    <div className="flex items-center h-9 bg-white border border-slate-200 rounded-xl shadow-sm px-1 gap-0">
      {/* Line tools */}
      <div className="flex items-center gap-0">
        {lineTools.map((t, i) => (
          <ToolBtn key={i} icon={t.icon} label={t.label} onClick={() => onAdd('line', t.opts)} />
        ))}
      </div>

      {sep}

      {/* Shape tools */}
      <div className="flex items-center gap-0">
        <ToolBtn icon={<RectShape />} label="Rectangle" onClick={() => onAdd('rect')} />
        <ToolBtn icon={<EllipseShape />} label="Ellipse" onClick={() => onAdd('ellipse')} />
      </div>

      {sep}

      {/* Text */}
      <ToolBtn icon={<TextShape />} label="Texte" onClick={() => onAdd('text')} />

      {sep}

      {/* Symbol picker */}
      <div ref={symRef} className="relative flex items-center">
        <button
          onClick={() => setShowSymbols(v => !v)}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all select-none whitespace-nowrap"
        >
          <span className="text-sm leading-none text-slate-600">Σ</span>
          Symboles
          <ChevronDown />
        </button>

        {showSymbols && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 min-w-max">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5 select-none px-0.5">
              Symboles scientifiques
            </p>
            <div className="grid grid-cols-12 gap-0.5">
              {SYMBOLS.map(sym => (
                <button
                  key={sym}
                  title={sym}
                  onClick={() => { onInsertSymbol(sym); setShowSymbols(false) }}
                  className="w-7 h-7 flex items-center justify-center text-sm text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
