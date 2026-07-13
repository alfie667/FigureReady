'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  onAdd: (type: string, options?: Record<string, unknown>) => void
  onInsertSymbol: (sym: string) => void
}

// ── Icons (larger, strokeWidth 2) ─────────────────────────────────────────
const StraightLine = () => (
  <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
    <line x1="2" y1="7" x2="26" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
const ArrowLine = () => (
  <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
    <line x1="2" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="2" />
    <polygon points="17,3.5 27,7 17,10.5" fill="currentColor" />
  </svg>
)
const DoubleArrow = () => (
  <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
    <line x1="9" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="2" />
    <polygon points="10,3.5 1,7 10,10.5" fill="currentColor" />
    <polygon points="18,3.5 27,7 18,10.5" fill="currentColor" />
  </svg>
)
const DashedLine = () => (
  <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
    <line x1="2" y1="7" x2="26" y2="7" stroke="currentColor" strokeWidth="2"
      strokeDasharray="5.5 3.5" strokeLinecap="round" />
  </svg>
)
const DashedArrow = () => (
  <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
    <line x1="2" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="2" strokeDasharray="5.5 3.5" />
    <polygon points="17,3.5 27,7 17,10.5" fill="currentColor" />
  </svg>
)
const RectShape = () => (
  <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
    <rect x="2" y="2" width="24" height="14" stroke="currentColor" strokeWidth="2" rx="1" />
  </svg>
)
const EllipseShape = () => (
  <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
    <ellipse cx="14" cy="9" rx="11.5" ry="6.5" stroke="currentColor" strokeWidth="2" />
  </svg>
)
const TextShape = () => (
  <svg width="22" height="20" viewBox="0 0 22 20">
    <text x="11" y="17" textAnchor="middle" fontSize="19" fontWeight="700"
      fill="currentColor" fontFamily="Georgia, serif">T</text>
  </svg>
)
const ChevronDown = () => (
  <svg width="10" height="7" viewBox="0 0 10 7" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M1 1l4 4 4-4" />
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
function ToolBtn({
  icon,
  label,
  shortLabel,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  shortLabel: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-[5px] px-2.5 py-2 rounded-lg transition-all duration-150 select-none min-w-[52px] ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className={`text-[9px] font-semibold uppercase tracking-wide leading-none whitespace-nowrap ${
        active ? 'text-blue-100' : 'text-slate-400'
      }`}>
        {shortLabel}
      </span>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AnnotationToolbar({ onAdd, onInsertSymbol }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [showSymbols, setShowSymbols] = useState(false)
  const symRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!showSymbols) return
    const handler = (e: MouseEvent) => {
      if (!symRef.current?.contains(e.target as Node)) setShowSymbols(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSymbols])

  const activate = useCallback((key: string, fn: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveKey(key)
    fn()
    timerRef.current = setTimeout(() => setActiveKey(null), 700)
  }, [])

  const lineTools = [
    { key: 'line-straight',      label: 'Trait droit',        shortLabel: 'Trait',    icon: <StraightLine />, opts: { dash: false, headStart: false, headEnd: false } },
    { key: 'line-arrow',         label: 'Flèche',             shortLabel: 'Flèche',   icon: <ArrowLine />,    opts: { dash: false, headStart: false, headEnd: true  } },
    { key: 'line-double',        label: 'Double flèche',      shortLabel: 'Double',   icon: <DoubleArrow />,  opts: { dash: false, headStart: true,  headEnd: true  } },
    { key: 'line-dashed',        label: 'Trait pointillé',    shortLabel: 'Ptl.',     icon: <DashedLine />,   opts: { dash: true,  headStart: false, headEnd: false } },
    { key: 'line-dashed-arrow',  label: 'Flèche pointillée',  shortLabel: 'Fl. ptl.', icon: <DashedArrow />, opts: { dash: true,  headStart: false, headEnd: true  } },
  ]

  const sep = <div className="w-px h-14 bg-slate-100 mx-0.5 shrink-0" />

  return (
    <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow px-1.5 py-1.5 gap-0">
      {/* Line tools */}
      <div className="flex items-center">
        {lineTools.map(t => (
          <ToolBtn
            key={t.key}
            icon={t.icon}
            label={t.label}
            shortLabel={t.shortLabel}
            active={activeKey === t.key}
            onClick={() => activate(t.key, () => onAdd('line', t.opts))}
          />
        ))}
      </div>

      {sep}

      {/* Shape tools */}
      <div className="flex items-center">
        <ToolBtn
          icon={<RectShape />}
          label="Ajouter un rectangle"
          shortLabel="Rect."
          active={activeKey === 'rect'}
          onClick={() => activate('rect', () => onAdd('rect'))}
        />
        <ToolBtn
          icon={<EllipseShape />}
          label="Ajouter une ellipse"
          shortLabel="Ellipse"
          active={activeKey === 'ellipse'}
          onClick={() => activate('ellipse', () => onAdd('ellipse'))}
        />
      </div>

      {sep}

      {/* Text */}
      <ToolBtn
        icon={<TextShape />}
        label="Ajouter du texte"
        shortLabel="Texte"
        active={activeKey === 'text'}
        onClick={() => activate('text', () => onAdd('text'))}
      />

      {sep}

      {/* Symbol picker */}
      <div ref={symRef} className="relative flex items-center">
        <button
          title="Insérer un symbole scientifique"
          onClick={() => setShowSymbols(v => !v)}
          className={`flex flex-col items-center justify-center gap-[5px] px-2.5 py-2 min-w-[52px] rounded-lg transition-all duration-150 select-none ${
            showSymbols
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-1">
            <span className="text-[18px] leading-none font-serif">Σ</span>
            <ChevronDown />
          </span>
          <span className={`text-[9px] font-semibold uppercase tracking-wide leading-none ${
            showSymbols ? 'text-blue-100' : 'text-slate-400'
          }`}>
            Symb.
          </span>
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
