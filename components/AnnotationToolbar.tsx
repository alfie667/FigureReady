'use client'
import { useState, useEffect, useRef } from 'react'
import type { AnnotationTool } from '@/hooks/useAnnotationInteraction'

interface Props {
  activeTool: AnnotationTool
  onToolChange: (tool: AnnotationTool) => void
  onInsertSymbol: (sym: string) => void
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const SelectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 2l12 7-7 2-2 7L3 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
  </svg>
)
const TextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <text x="9" y="15" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor" fontFamily="Georgia,serif">T</text>
  </svg>
)
const PeakIcon = () => (
  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
    <circle cx="7" cy="13" r="2" fill="currentColor" />
    <line x1="7" y1="13" x2="15" y2="5" stroke="currentColor" strokeWidth="1.4" />
    <text x="16" y="8" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="Arial,sans-serif">pk</text>
  </svg>
)
const ArrowIcon = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="2" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.8" />
    <polygon points="13,3.5 21,7 13,10.5" fill="currentColor" />
  </svg>
)
const LineIcon = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="2" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
const DashedIcon = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <line x1="2" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4.5 3" strokeLinecap="round" />
  </svg>
)
const RectIcon = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <rect x="2" y="2" width="18" height="12" stroke="currentColor" strokeWidth="1.8" rx="1" />
  </svg>
)
const EllipseIcon = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <ellipse cx="11" cy="8" rx="9" ry="6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)
const ZoomIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.7" />
    <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <line x1="5.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="7.5" y1="5.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const ChevronDown = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M1 1l3 3 3-3" />
  </svg>
)

// ── Symbols ────────────────────────────────────────────────────────────────────
const SYMBOLS = [
  'α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ',
  'ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω',
  'Γ','Δ','Θ','Λ','Σ','Φ','Ψ','Ω',
  '±','×','÷','∞','≤','≥','≈','≠',
  '∑','∫','√','∂','∇','°','·','~',
  '¹','²','³','⁻¹','⁻²','⁻³','½','¼',
  '→','←','↑','↓','↔','⇒','⇐','⇔',
]

// ── Tool button ────────────────────────────────────────────────────────────────
function ToolBtn({ icon, label, shortLabel, active, onClick }: {
  icon: React.ReactNode; label: string; shortLabel: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-[4px] px-2 py-1.5 rounded-lg transition-all duration-100 select-none min-w-[44px] ${
        active ? 'bg-[#2563eb] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className={`text-[9px] font-light tracking-wide leading-none whitespace-nowrap ${active ? 'text-[#bfdbfe]' : 'text-slate-400'}`}>
        {shortLabel}
      </span>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AnnotationToolbar({ activeTool, onToolChange, onInsertSymbol }: Props) {
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

  const tools: Array<{ key: AnnotationTool; label: string; shortLabel: string; icon: React.ReactNode }> = [
    { key: 'select',  label: 'Select',       shortLabel: 'Select',  icon: <SelectIcon /> },
    { key: 'text',    label: 'Add text',      shortLabel: 'Text',    icon: <TextIcon /> },
    { key: 'peak',    label: 'Add peak label',shortLabel: 'Peak',    icon: <PeakIcon /> },
    { key: 'arrow',   label: 'Draw arrow',    shortLabel: 'Arrow',   icon: <ArrowIcon /> },
    { key: 'line',    label: 'Draw line',     shortLabel: 'Line',    icon: <LineIcon /> },
    { key: 'dashed',  label: 'Draw dashed line', shortLabel: 'Dashed', icon: <DashedIcon /> },
    { key: 'rect',    label: 'Draw rectangle', shortLabel: 'Rect',   icon: <RectIcon /> },
    { key: 'ellipse', label: 'Draw ellipse',  shortLabel: 'Ellipse', icon: <EllipseIcon /> },
    { key: 'zoom',    label: 'Zoom (drag to select range, double-click to reset)', shortLabel: 'Zoom', icon: <ZoomIcon /> },
  ]

  const sep = <div className="w-px h-10 bg-slate-100 mx-0.5 shrink-0" />

  return (
    <div className="flex items-center bg-white rounded-2xl shadow-lg px-2 py-1.5 gap-0 flex-wrap">
      {/* Select */}
      <ToolBtn {...tools[0]} active={activeTool === 'select'} onClick={() => onToolChange('select')} />
      {sep}
      {/* Text + Peak */}
      <ToolBtn {...tools[1]} active={activeTool === 'text'} onClick={() => onToolChange('text')} />
      <ToolBtn {...tools[2]} active={activeTool === 'peak'} onClick={() => onToolChange('peak')} />
      {sep}
      {/* Line tools */}
      <ToolBtn {...tools[3]} active={activeTool === 'arrow'} onClick={() => onToolChange('arrow')} />
      <ToolBtn {...tools[4]} active={activeTool === 'line'} onClick={() => onToolChange('line')} />
      <ToolBtn {...tools[5]} active={activeTool === 'dashed'} onClick={() => onToolChange('dashed')} />
      {sep}
      {/* Shape tools */}
      <ToolBtn {...tools[6]} active={activeTool === 'rect'} onClick={() => onToolChange('rect')} />
      <ToolBtn {...tools[7]} active={activeTool === 'ellipse'} onClick={() => onToolChange('ellipse')} />
      {sep}
      {/* Zoom tool */}
      <ToolBtn {...tools[8]} active={activeTool === 'zoom'} onClick={() => onToolChange('zoom')} />
      {sep}
      {/* Symbol picker */}
      <div ref={symRef} className="relative flex items-center">
        <button
          title="Insert scientific symbol"
          onClick={() => setShowSymbols(v => !v)}
          className={`flex flex-col items-center justify-center gap-[4px] px-2 py-1.5 min-w-[44px] rounded-lg transition-all duration-100 select-none ${
            showSymbols ? 'bg-[#2563eb] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-0.5">
            <span className="text-[15px] leading-none font-serif">Σ</span>
            <ChevronDown />
          </span>
          <span className={`text-[9px] font-light tracking-wide leading-none ${showSymbols ? 'text-[#bfdbfe]' : 'text-slate-400'}`}>
            Symb.
          </span>
        </button>
        {showSymbols && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 min-w-max">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5 select-none px-0.5">Scientific symbols</p>
            <div className="grid grid-cols-12 gap-0.5">
              {SYMBOLS.map(sym => (
                <button
                  key={sym}
                  title={sym}
                  onClick={() => { onInsertSymbol(sym); setShowSymbols(false) }}
                  className="w-7 h-7 flex items-center justify-center text-sm text-slate-600 rounded-lg hover:bg-[#dbeafe] hover:text-[#1d4ed8] transition-colors"
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
