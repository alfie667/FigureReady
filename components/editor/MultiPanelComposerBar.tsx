'use client'
import {
  getLayoutCount,
  type PanelConfig,
  type PanelLayout,
  type PanelLabelConfig,
  type ComposerConfig,
} from '@/lib/panels'
import PanelLayoutSelector from '@/components/PanelLayoutSelector'

interface Props {
  panels: PanelConfig[]
  layout: PanelLayout
  labelConfig: PanelLabelConfig
  composerConfig: ComposerConfig
  onLayoutChange: (l: PanelLayout) => void
  onAddPanel: () => void
  onDuplicatePanel: () => void
  onRemovePanel: () => void
  onLabelConfigChange: (c: PanelLabelConfig) => void
  onComposerConfigChange: (c: ComposerConfig) => void
  onHarmonize: () => void
}

const LABEL_FORMATS: { value: PanelLabelConfig['format']; label: string }[] = [
  { value: 'paren-lower', label: '(a)' },
  { value: 'paren-upper', label: '(A)' },
  { value: 'lowercase',   label: 'a'   },
  { value: 'uppercase',   label: 'A'   },
  { value: 'none',        label: 'None' },
]

const LABEL_POSITIONS: { value: PanelLabelConfig['position']; label: string }[] = [
  { value: 'top-left',     label: '↖ Top-left'    },
  { value: 'top-right',    label: '↗ Top-right'   },
  { value: 'bottom-left',  label: '↙ Bot-left'    },
  { value: 'bottom-right', label: '↘ Bot-right'   },
]

function Sep() {
  return <div className="w-px h-4 bg-slate-200 shrink-0" />
}

function NumField({
  label, value, min = 0, max = 120, step = 4, onChange,
}: {
  label: string; value: number; min?: number; max?: number; step?: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-1">
      <span className="text-xs text-slate-400 select-none">{label}</span>
      <input
        type="number"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="w-12 px-1 py-0.5 text-xs text-center bg-slate-100 border-0 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
      />
    </label>
  )
}

export function MultiPanelComposerBar({
  panels, layout, labelConfig, composerConfig,
  onLayoutChange, onAddPanel, onDuplicatePanel, onRemovePanel,
  onLabelConfigChange, onComposerConfigChange, onHarmonize,
}: Props) {
  const max          = getLayoutCount(layout)
  const canAdd       = panels.length < max
  const canRemove    = panels.length > 1
  const canHarmonize = panels.length > 1

  const patchComposer = (p: Partial<ComposerConfig>)  => onComposerConfigChange({ ...composerConfig, ...p })
  const patchLabel    = (p: Partial<PanelLabelConfig>) => onLabelConfigChange({ ...labelConfig, ...p })

  const btnOn  = 'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer'
  const btnOff = 'px-2.5 py-1 text-xs font-medium rounded-md cursor-not-allowed select-none'

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white border-b border-slate-200 shrink-0 overflow-x-auto">

      {/* Layout */}
      <PanelLayoutSelector value={layout} onChange={onLayoutChange} />

      <Sep />

      {/* Panel actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onAddPanel}
          disabled={!canAdd}
          title={canAdd ? 'Add empty panel' : 'Layout is full'}
          className={canAdd
            ? `${btnOn} bg-slate-100 text-slate-700 hover:bg-slate-200`
            : `${btnOff} bg-slate-50 text-slate-300`}
        >
          + Add
        </button>
        <button
          onClick={onDuplicatePanel}
          disabled={!canAdd}
          title={canAdd ? 'Duplicate active panel — copies data, clears annotations' : 'Layout is full'}
          className={canAdd
            ? `${btnOn} bg-slate-100 text-slate-700 hover:bg-slate-200`
            : `${btnOff} bg-slate-50 text-slate-300`}
        >
          Duplicate
        </button>
        <button
          onClick={onRemovePanel}
          disabled={!canRemove}
          title={canRemove ? 'Remove active panel' : 'Need at least one panel'}
          className={canRemove
            ? `${btnOn} bg-red-50 text-red-600 hover:bg-red-100`
            : `${btnOff} bg-slate-50 text-slate-300`}
        >
          Remove
        </button>
      </div>

      <Sep />

      {/* Gap */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-slate-400 select-none">Gap</span>
        <NumField label="H" value={composerConfig.gapH}   onChange={v => patchComposer({ gapH: v })} />
        <NumField label="V" value={composerConfig.gapV}   onChange={v => patchComposer({ gapV: v })} />
      </div>

      <Sep />

      {/* Margin */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-slate-400 select-none">Margin</span>
        <NumField label="H" value={composerConfig.paddingH} onChange={v => patchComposer({ paddingH: v })} />
        <NumField label="V" value={composerConfig.paddingV} onChange={v => patchComposer({ paddingV: v })} />
      </div>

      <Sep />

      {/* Labels */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-slate-400 select-none">Labels</span>
        <select
          value={labelConfig.format}
          onChange={e => patchLabel({ format: e.target.value as PanelLabelConfig['format'] })}
          className="text-xs bg-slate-100 border-0 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 text-slate-700 cursor-pointer"
        >
          {LABEL_FORMATS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        {labelConfig.format !== 'none' && (
          <select
            value={labelConfig.position}
            onChange={e => patchLabel({ position: e.target.value as PanelLabelConfig['position'] })}
            className="text-xs bg-slate-100 border-0 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 text-slate-700 cursor-pointer"
          >
            {LABEL_POSITIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        )}
      </div>

      <Sep />

      {/* Harmonize — sync presentation keys from active panel to figure level */}
      <button
        onClick={onHarmonize}
        disabled={!canHarmonize}
        title={canHarmonize
          ? 'Copy font, axis width, and typography from the active panel to all panels (scientific settings untouched)'
          : 'Need at least two panels'}
        className={`shrink-0 ${canHarmonize
          ? `${btnOn} bg-blue-50 text-blue-700 hover:bg-blue-100`
          : `${btnOff} bg-slate-50 text-slate-300`}`}
      >
        Harmonize
      </button>

    </div>
  )
}
