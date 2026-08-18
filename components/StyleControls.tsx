'use client'

import { useRef, useEffect, useState } from 'react'
import { renderMarker, markerShapeOptions, type MarkerShape } from '@/lib/markerShapes'
import { COLOR_PALETTES } from '@/lib/colorPalettes'

export function PickerGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      {label && <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function PickerButton({
  selected, onClick, title, compact = false, children,
}: {
  selected: boolean
  onClick: () => void
  title: string
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border transition-colors ${
        compact ? 'w-9 h-9' : 'min-w-[60px] px-3 py-2'
      } ${
        selected
          ? 'border-[#2563eb] bg-[#dbeafe] text-[#1d4ed8]'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
      {!compact && <span className="text-[11px] font-medium leading-none">{title}</span>}
    </button>
  )
}

export interface NumericPreset {
  label: string
  value: number
}

// Horizontal line samples, used for axis width and series stroke width.
export function LineThicknessPicker({
  label, value, presets, onChange, compact = false,
}: {
  label?: string
  value: number
  presets: NumericPreset[]
  onChange: (value: number) => void
  compact?: boolean
}) {
  return (
    <PickerGroup label={label}>
      {presets.map(p => (
        <PickerButton key={p.value} selected={value === p.value} onClick={() => onChange(p.value)} title={p.label} compact={compact}>
          <svg width="26" height="14" viewBox="0 0 26 14">
            <line x1="2" y1="7" x2="24" y2="7" stroke="currentColor" strokeWidth={Math.max(p.value, 1)} strokeLinecap="round" />
          </svg>
        </PickerButton>
      ))}
    </PickerGroup>
  )
}

// Dot samples, used for marker size. value 0 means "no marker".
export function MarkerSizePicker({
  label, value, presets, onChange, compact = false,
}: {
  label?: string
  value: number
  presets: NumericPreset[]
  onChange: (value: number) => void
  compact?: boolean
}) {
  return (
    <PickerGroup label={label}>
      {presets.map(p => (
        <PickerButton key={p.value} selected={value === p.value} onClick={() => onChange(p.value)} title={p.label} compact={compact}>
          <svg width="26" height="20" viewBox="0 0 26 20">
            {p.value > 0
              ? <circle cx="13" cy="10" r={p.value} fill="currentColor" />
              : <circle cx="13" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />}
          </svg>
        </PickerButton>
      ))}
    </PickerGroup>
  )
}

export function MarkerShapePicker({
  label, value, onChange, compact = false,
}: {
  label?: string
  value: MarkerShape
  onChange: (value: MarkerShape) => void
  compact?: boolean
}) {
  return (
    <PickerGroup label={label}>
      {markerShapeOptions.map(opt => (
        <PickerButton key={opt.value} selected={value === opt.value} onClick={() => onChange(opt.value)} title={opt.label} compact={compact}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            {renderMarker(10, 10, opt.value, 5, 'currentColor')}
          </svg>
        </PickerButton>
      ))}
    </PickerGroup>
  )
}

// "Aa" samples at increasing sizes, used for axis/legend text size presets.
export function TextSizePicker({
  label, value, presets, onChange, compact = false,
}: {
  label?: string
  value: number
  presets: NumericPreset[]
  onChange: (value: number) => void
  compact?: boolean
}) {
  const sampleSizes = ['12px', '15px', '18px']
  return (
    <PickerGroup label={label}>
      {presets.map((p, i) => (
        <PickerButton key={p.value} selected={value === p.value} onClick={() => onChange(p.value)} title={p.label} compact={compact}>
          <span className="font-semibold leading-none" style={{ fontSize: sampleSizes[i] ?? sampleSizes[sampleSizes.length - 1] }}>Aa</span>
        </PickerButton>
      ))}
    </PickerGroup>
  )
}

export function ColorSwatchPicker({ label, value, onChange }: { label?: string; value: string; onChange: (value: string) => void }) {
  return <ScientificColorPicker label={label} value={value} onChange={onChange} />
}

export function ScientificColorPicker({ label, value, onChange }: { label?: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const customRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={containerRef} className="min-w-0">
      {label && <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors text-[12px] text-[#334155] font-mono"
      >
        <span
          className="w-4 h-4 rounded-sm shrink-0 ring-1 ring-black/10"
          style={{ backgroundColor: value }}
        />
        {value.toUpperCase()}
      </button>

      {/* Expanded palette */}
      {open && (
        <div className="mt-2 p-3 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-3">
          {COLOR_PALETTES.map(palette => (
            <div key={palette.id}>
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1.5">{palette.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {palette.colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { onChange(c); setOpen(false) }}
                    title={c}
                    aria-label={c}
                    className={`w-6 h-6 rounded-md shrink-0 ring-2 transition-transform hover:scale-110 ${
                      value.toLowerCase() === c.toLowerCase() ? 'ring-[#2563EB] scale-110' : 'ring-transparent'
                    }`}
                    style={{ backgroundColor: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.10)' }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Custom color */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => customRef.current?.click()}
              className="text-[11px] text-[#2563EB] hover:underline font-medium"
            >
              Custom color…
            </button>
            <input
              ref={customRef}
              type="color"
              value={value}
              onChange={e => { onChange(e.target.value); setOpen(false) }}
              className="sr-only"
            />
          </div>
        </div>
      )}
    </div>
  )
}

const legendPositionOptions: { value: 'top' | 'bottom' | 'left' | 'right'; label: string }[] = [
  { value: 'top', label: 'Haut' },
  { value: 'right', label: 'Droite' },
  { value: 'bottom', label: 'Bas' },
  { value: 'left', label: 'Gauche' },
]

export function LegendPositionPicker({
  label, value, onChange,
}: {
  label?: string
  value: 'top' | 'bottom' | 'left' | 'right'
  onChange: (value: 'top' | 'bottom' | 'left' | 'right') => void
}) {
  return (
    <PickerGroup label={label}>
      {legendPositionOptions.map(opt => (
        <PickerButton key={opt.value} selected={value === opt.value} onClick={() => onChange(opt.value)} title={opt.label}>
          <svg width="26" height="20" viewBox="0 0 26 20">
            <rect x="1" y="1" width="24" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
            {opt.value === 'top' && <rect x="5" y="3" width="16" height="3" rx="1" fill="currentColor" />}
            {opt.value === 'bottom' && <rect x="5" y="14" width="16" height="3" rx="1" fill="currentColor" />}
            {opt.value === 'left' && <rect x="3" y="5" width="3" height="10" rx="1" fill="currentColor" />}
            {opt.value === 'right' && <rect x="20" y="5" width="3" height="10" rx="1" fill="currentColor" />}
          </svg>
        </PickerButton>
      ))}
    </PickerGroup>
  )
}

export function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#2563eb]' : 'bg-slate-200'}`}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="absolute inset-0 opacity-0 cursor-pointer" />
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
    </label>
  )
}
