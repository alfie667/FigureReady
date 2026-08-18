'use client'
import { useState, useRef, useEffect } from 'react'
import type { ChartAnnotation, TextAnnotation, LineAnnotation, RectAnnotation, EllipseAnnotation, PeakLabelAnnotation } from '@/lib/annotations'
import type { AnnotationTool } from '@/hooks/useAnnotationInteraction'

interface Props {
  selected: ChartAnnotation | null
  activeTool: AnnotationTool
  defaultColor: string
  defaultFontSize: number
  zoomEnabled: boolean
  zoomDomain: [number, number] | null
  onUpdate: (id: string, changes: Record<string, unknown>) => void
  onDelete: (id: string) => void
  onResetZoom: () => void
}

const COLORS = ['#1e293b', '#2563eb', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#64748b', '#ffffff']

const SYMBOLS = [
  'α','β','γ','δ','ε','μ','σ','τ','ω','Δ','Σ','Ω',
  '±','×','÷','∞','≤','≥','≈','≠','∑','√','∂','°',
  '→','←','↑','↓','¹','²','³','⁻¹','⁻²',
]

const FILL_COLORS = ['#1e293b', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

function toRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

// ── Shared primitives ──────────────────────────────────────────────────────────

function Sep() {
  return <div className="w-px h-4 bg-slate-200 mx-1 shrink-0" />
}

function IconBtn({ active, title, onClick, children }: {
  active?: boolean; title: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors select-none ${
        active ? 'bg-[#2563eb] text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

// Used by line / rect / ellipse / peak sections
function ColorRow({ value, defaultColor, onChange }: { value?: string; defaultColor: string; onChange: (c: string | undefined) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button title="Default color" onClick={() => onChange(undefined)}
        className={`w-4 h-4 rounded border transition-all ${value === undefined ? 'ring-2 ring-[#2563eb] ring-offset-1' : 'ring-1 ring-slate-200'}`}
        style={{ background: defaultColor }} />
      {COLORS.map(c => (
        <button key={c} title={c} onClick={() => onChange(c)}
          className={`w-4 h-4 rounded transition-all ${value === c ? 'ring-2 ring-[#2563eb] ring-offset-1' : 'ring-1 ring-slate-200'}`}
          style={{ background: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : undefined }} />
      ))}
    </div>
  )
}

function RangeInput({ label, value, min, max, step = 0.5, fmt, onChange }: {
  label: string; value: number; min: number; max: number; step?: number
  fmt?: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-400 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-16 accent-[#2563eb] h-1.5 cursor-pointer" />
      <span className="text-[10px] text-slate-600 tabular-nums w-7 text-right">
        {fmt ? fmt(value) : value}
      </span>
    </div>
  )
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`text-[10px] px-2 py-0.5 rounded border transition-colors select-none ${
        active ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >{children}</button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AnnotationContextBar({
  selected, activeTool, defaultColor, defaultFontSize, zoomEnabled, zoomDomain,
  onUpdate, onDelete, onResetZoom,
}: Props) {
  const selId = selected?.id
  const [showSymbols, setShowSymbols] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const symRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Click-outside to close popovers
  useEffect(() => {
    if (!showSymbols && !showMenu) return
    const handler = (e: MouseEvent) => {
      if (showSymbols && !symRef.current?.contains(e.target as Node)) setShowSymbols(false)
      if (showMenu && !menuRef.current?.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSymbols, showMenu])

  // Close popovers when selection changes
  useEffect(() => { setShowSymbols(false); setShowMenu(false) }, [selId])

  const renderContent = () => {
    // Peak tool hint
    if (activeTool === 'peak' && !selected) {
      return (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563eb]">
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse inline-block" />
            Peak mode
          </span>
          <span className="text-[10px] text-slate-400">Click on a peak · Esc to cancel</span>
        </div>
      )
    }

    // Draw / zoom tool hint
    if (activeTool !== 'select' && activeTool !== 'peak' && !selected) {
      if (activeTool === 'zoom') {
        return <span className="text-[10px] text-slate-400">Zoom — drag to select range · double-click to reset · Esc to cancel</span>
      }
      const toolName = { arrow: 'Arrow', line: 'Line', dashed: 'Dashed line', rect: 'Rectangle', ellipse: 'Ellipse', text: 'Text' }[activeTool] ?? activeTool
      return <span className="text-[10px] text-slate-400">{toolName} — drag on the chart to place · Esc to cancel</span>
    }

    if (!selected || !selId) {
      return null
    }

    const type = selected.type

    // ── Text annotation — compact inline toolbar ─────────────────────────────
    if (type === 'text') {
      const ann = selected as TextAnnotation
      const fontSize = ann.fontSize ?? defaultFontSize
      return (
        <div className="flex items-center gap-0">
          <span className="px-2 text-[11px] font-medium text-slate-400 shrink-0">Text</span>
          <Sep />

          {/* Color swatches */}
          <div className="flex items-center gap-0.5 px-1.5">
            <button title="Default color" onClick={() => onUpdate(selId, { color: undefined })}
              className={`w-3.5 h-3.5 rounded-sm transition-all ${ann.color === undefined ? 'ring-2 ring-[#2563eb] ring-offset-1' : 'ring-1 ring-slate-300 hover:scale-110'}`}
              style={{ background: defaultColor }} />
            {COLORS.map(c => (
              <button key={c} title={c} onClick={() => onUpdate(selId, { color: c })}
                className={`w-3.5 h-3.5 rounded-sm transition-all ${ann.color === c ? 'ring-2 ring-[#2563eb] ring-offset-1' : 'ring-1 ring-slate-300 hover:scale-110'}`}
                style={{ background: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : undefined }} />
            ))}
          </div>
          <Sep />

          {/* Font size: − 12 + */}
          <div className="flex items-center gap-0 px-0.5">
            <button title="Decrease size"
              onClick={() => onUpdate(selId, { fontSize: Math.max(6, fontSize - 1) })}
              className="w-5 h-6 flex items-center justify-center text-[15px] leading-none text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded select-none"
            >−</button>
            <span className="w-7 text-center text-[11px] tabular-nums text-slate-700 select-none">{fontSize}</span>
            <button title="Increase size"
              onClick={() => onUpdate(selId, { fontSize: Math.min(36, fontSize + 1) })}
              className="w-5 h-6 flex items-center justify-center text-[15px] leading-none text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded select-none"
            >+</button>
          </div>
          <Sep />

          {/* Bold / Italic */}
          <IconBtn active={ann.fontWeight === 'bold'} title="Bold"
            onClick={() => onUpdate(selId, { fontWeight: ann.fontWeight === 'bold' ? 'normal' : 'bold' })}>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13 }}>B</span>
          </IconBtn>
          <IconBtn active={ann.fontStyle === 'italic'} title="Italic"
            onClick={() => onUpdate(selId, { fontStyle: ann.fontStyle === 'italic' ? 'normal' : 'italic' })}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13 }}>I</span>
          </IconBtn>
          <Sep />

          {/* Ω symbol picker */}
          <div className="relative" ref={symRef}>
            <IconBtn title="Insert symbol" onClick={() => { setShowMenu(false); setShowSymbols(v => !v) }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 13 }}>Ω</span>
            </IconBtn>
            {showSymbols && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 z-50" style={{ width: 208 }}>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-2 select-none">Symbols</p>
                <div className="grid grid-cols-8 gap-0.5">
                  {SYMBOLS.map(sym => (
                    <button key={sym} title={sym}
                      onClick={() => { onUpdate(selId, { text: ann.text + sym }); setShowSymbols(false) }}
                      className="w-6 h-6 flex items-center justify-center text-sm text-slate-600 rounded hover:bg-[#dbeafe] hover:text-[#1d4ed8] transition-colors"
                    >{sym}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Sep />

          {/* ··· overflow menu */}
          <div className="relative" ref={menuRef}>
            <IconBtn title="More actions" onClick={() => { setShowSymbols(false); setShowMenu(v => !v) }}>
              <span className="text-[10px] tracking-widest leading-none" style={{ letterSpacing: '0.15em' }}>···</span>
            </IconBtn>
            {showMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 min-w-[110px]">
                <button onClick={() => { onDelete(selId); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50 transition-colors">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }

    // ── Line / Arrow ─────────────────────────────────────────────────────────
    if (type === 'line' || type === 'arrow') {
      const ann = selected as LineAnnotation
      const isLine = type === 'line'
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 shrink-0">Line</span>
          <ColorRow value={ann.color} defaultColor={defaultColor} onChange={c => onUpdate(selId, { color: c })} />
          <RangeInput label="Width" value={ann.strokeWidth ?? 1.5} min={0.5} max={6} step={0.5}
            fmt={v => `${v}`} onChange={v => onUpdate(selId, { strokeWidth: v })} />
          {isLine && (
            <>
              <ToggleBtn active={ann.dash} onClick={() => onUpdate(selId, { dash: !ann.dash })}>Dash</ToggleBtn>
              <ToggleBtn active={ann.headStart} onClick={() => onUpdate(selId, { headStart: !ann.headStart })}>← Head</ToggleBtn>
              <ToggleBtn active={ann.headEnd} onClick={() => onUpdate(selId, { headEnd: !ann.headEnd })}>Head →</ToggleBtn>
            </>
          )}
          <button onClick={() => onDelete(selId)}
            className="ml-auto text-[10px] px-2 py-0.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Delete</button>
        </div>
      )
    }

    // ── Rect / Ellipse ───────────────────────────────────────────────────────
    if (type === 'rect' || type === 'ellipse') {
      const ann = selected as RectAnnotation | EllipseAnnotation
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 shrink-0">{type === 'rect' ? 'Rect' : 'Ellipse'}</span>
          <span className="text-[10px] text-slate-400">Border</span>
          <ColorRow value={ann.borderColor} defaultColor={defaultColor} onChange={c => onUpdate(selId, { borderColor: c })} />
          <RangeInput label="Width" value={ann.borderWidth ?? 1.5} min={0.5} max={6} step={0.5}
            fmt={v => `${v}`} onChange={v => onUpdate(selId, { borderWidth: v })} />
          <span className="text-[10px] text-slate-400 ml-1">Fill</span>
          <div className="flex items-center gap-1">
            <button title="No fill" onClick={() => onUpdate(selId, { fillColor: undefined })}
              className={`w-4 h-4 rounded border-2 transition-all ${!ann.fillColor ? 'border-[#2563eb]' : 'border-slate-200'}`}
              style={{ background: 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 6px 6px' }} />
            {FILL_COLORS.map(c => (
              <button key={c} title={c}
                onClick={() => onUpdate(selId, { fillColor: c, fillOpacity: ann.fillOpacity ?? 0.3 })}
                className={`w-4 h-4 rounded transition-all ${ann.fillColor === c ? 'ring-2 ring-[#2563eb] ring-offset-1' : 'ring-1 ring-slate-200'}`}
                style={{ background: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : undefined }} />
            ))}
          </div>
          {ann.fillColor && (
            <RangeInput label="Opacity" value={Math.round((ann.fillOpacity ?? 0.3) * 100)} min={0} max={100} step={5}
              fmt={v => `${v}%`} onChange={v => onUpdate(selId, { fillOpacity: v / 100 })} />
          )}
          <button onClick={() => onDelete(selId)}
            className="ml-auto text-[10px] px-2 py-0.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Delete</button>
        </div>
      )
    }

    // ── Peak label ───────────────────────────────────────────────────────────
    if (type === 'peak-label') {
      const ann = selected as PeakLabelAnnotation
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 shrink-0">Peak label</span>
          <ColorRow value={ann.color} defaultColor={defaultColor} onChange={c => onUpdate(selId, { color: c })} />
          <RangeInput label="Size" value={ann.fontSize ?? defaultFontSize} min={6} max={24} step={1}
            onChange={v => onUpdate(selId, { fontSize: v })} />
          <ToggleBtn active={ann.leaderLine} onClick={() => onUpdate(selId, { leaderLine: !ann.leaderLine })}>
            Leader line
          </ToggleBtn>
          <span className="text-[10px] text-slate-300">Arrow keys to nudge · Shift ×10</span>
          <button onClick={() => onDelete(selId)}
            className="ml-auto text-[10px] px-2 py-0.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Delete</button>
        </div>
      )
    }

    return (
      <span className="text-xs text-slate-400">
        Selected ·{' '}
        <kbd className="font-mono bg-slate-100 px-1 rounded text-slate-500">Delete</kbd>
        {' '}to remove · click elsewhere to deselect
      </span>
    )
  }

  const content = renderContent()
  if (!content && !zoomDomain) return null

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-1.5 bg-white border-t border-slate-100 shrink-0 min-h-[32px]">
      {content}
      {zoomDomain && (
        <button onClick={onResetZoom} className="text-xs text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-auto">
          Reset zoom
        </button>
      )}
    </div>
  )
}
