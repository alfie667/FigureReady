'use client'
import type { ChartAnnotation } from '@/lib/annotations'

interface Props {
  annotation: ChartAnnotation
  onUpdate: (id: string, changes: Record<string, unknown>) => void
  onDelete: (id: string) => void
}

const COLORS = ['#1e293b', '#2563eb', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#64748b', '#ffffff']

const fieldCls = "w-full border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
const labelCls = "text-[10px] text-slate-400 mb-1 block"

function SH({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 mt-4 mb-2 first:mt-0 select-none">{children}</p>
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-5 h-5 rounded-full ring-offset-1 transition-all ${value === c ? 'ring-2 ring-[#2563eb]' : 'hover:scale-110'}`}
            style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : undefined }}
          />
        ))}
        <input
          type="color"
          value={value || '#1e293b'}
          onChange={e => onChange(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border border-slate-200"
          title="Custom color"
        />
      </div>
    </div>
  )
}

function NumRow({ label, value, min, max, step = 1, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 flex-1 truncate">{label}</span>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={e => { const v = Number(e.target.value); if (v >= min && v <= max) onChange(v) }}
        className="w-14 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
      />
      {unit && <span className="text-[10px] text-slate-400 shrink-0">{unit}</span>}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-7 h-4 rounded-full transition-colors cursor-pointer ${checked ? 'bg-[#2563eb]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-[10px] text-slate-600">{label}</span>
    </label>
  )
}

export default function AnnotationInspector({ annotation: ann, onUpdate, onDelete }: Props) {
  const u = (changes: Record<string, unknown>) => onUpdate(ann.id, changes)

  return (
    <div className="space-y-0">
      {/* Type badge + delete */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {ann.type === 'peak-label' ? 'Peak' : ann.type}
        </span>
        <button
          onClick={() => onDelete(ann.id)}
          className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* ── Text ────────────────────────────────────────────────────── */}
      {ann.type === 'text' && (
        <>
          <SH>Text</SH>
          <div>
            <span className={labelCls}>Content</span>
            <textarea
              value={ann.text}
              onChange={e => u({ text: e.target.value })}
              rows={2}
              className={fieldCls + ' resize-none'}
            />
          </div>
          <SH>Appearance</SH>
          <NumRow label="Font size" value={ann.fontSize ?? 12} min={6} max={48} unit="pt" onChange={v => u({ fontSize: v })} />
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => u({ fontWeight: ann.fontWeight === 'bold' ? 'normal' : 'bold' })}
              className={`flex-1 text-[10px] py-1 rounded border font-bold transition-colors ${ann.fontWeight === 'bold' ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >B</button>
            <button
              onClick={() => u({ fontStyle: ann.fontStyle === 'italic' ? 'normal' : 'italic' })}
              className={`flex-1 text-[10px] py-1 rounded border italic transition-colors ${ann.fontStyle === 'italic' ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >I</button>
          </div>
          <div className="mt-2">
            <ColorRow label="Color" value={ann.color ?? '#1e293b'} onChange={v => u({ color: v })} />
          </div>
        </>
      )}

      {/* ── Peak label ──────────────────────────────────────────────── */}
      {ann.type === 'peak-label' && (
        <>
          <SH>Label</SH>
          <div>
            <span className={labelCls}>Text</span>
            <input
              type="text"
              value={ann.text}
              onChange={e => u({ text: e.target.value })}
              className={fieldCls}
            />
          </div>
          <NumRow label="Font size" value={ann.fontSize ?? 10} min={6} max={24} unit="pt" onChange={v => u({ fontSize: v })} />
          <div className="mt-2">
            <ColorRow label="Color" value={ann.color ?? '#1e293b'} onChange={v => u({ color: v })} />
          </div>
          <SH>Leader</SH>
          <Toggle label="Show leader line" checked={ann.leaderLine} onChange={v => u({ leaderLine: v })} />
        </>
      )}

      {/* ── Arrow (legacy) ──────────────────────────────────────────── */}
      {ann.type === 'arrow' && (
        <>
          <SH>Stroke</SH>
          <NumRow label="Width" value={ann.strokeWidth ?? 1.5} min={0.5} max={6} step={0.5} unit="px" onChange={v => u({ strokeWidth: v })} />
          <div className="mt-2">
            <ColorRow label="Color" value={ann.color ?? '#1e293b'} onChange={v => u({ color: v })} />
          </div>
        </>
      )}

      {/* ── Line (solid / dashed / arrow) ───────────────────────────── */}
      {ann.type === 'line' && (
        <>
          <SH>Stroke</SH>
          <NumRow label="Width" value={ann.strokeWidth ?? 1.5} min={0.5} max={6} step={0.5} unit="px" onChange={v => u({ strokeWidth: v })} />
          <ColorRow label="Color" value={ann.color ?? '#1e293b'} onChange={v => u({ color: v })} />
          <SH>Arrowheads</SH>
          <Toggle label="Start arrow" checked={ann.headStart} onChange={v => u({ headStart: v })} />
          <Toggle label="End arrow" checked={ann.headEnd} onChange={v => u({ headEnd: v })} />
          <SH>Style</SH>
          <div className="flex gap-2">
            {[{ l: 'Solid', v: false }, { l: 'Dashed', v: true }].map(({ l, v }) => (
              <button key={l} onClick={() => u({ dash: v })}
                className={`flex-1 text-[10px] py-1 rounded border transition-colors ${ann.dash === v ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >{l}</button>
            ))}
          </div>
        </>
      )}

      {/* ── Rect / Ellipse ──────────────────────────────────────────── */}
      {(ann.type === 'rect' || ann.type === 'ellipse') && (
        <>
          <SH>Fill</SH>
          <ColorRow label="Color" value={ann.fillColor ?? '#ffffff'} onChange={v => u({ fillColor: v })} />
          <NumRow label="Opacity" value={Math.round((ann.fillOpacity ?? 0) * 100)} min={0} max={100} unit="%" onChange={v => u({ fillOpacity: v / 100 })} />
          <SH>Stroke</SH>
          <NumRow label="Width" value={ann.borderWidth ?? 1.5} min={0} max={6} step={0.5} unit="px" onChange={v => u({ borderWidth: v })} />
          <ColorRow label="Color" value={ann.borderColor ?? '#1e293b'} onChange={v => u({ borderColor: v })} />
        </>
      )}
    </div>
  )
}
