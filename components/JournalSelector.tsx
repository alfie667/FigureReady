'use client'
import { useState } from 'react'
import {
  JOURNAL_PRESETS,
  getJournalExportWidth,
  getJournalExportPixelRatio,
  type JournalApplyArgs,
} from '@/lib/journalPresets'

interface Props {
  onApply: (args: JournalApplyArgs) => void
  onClear: () => void
}

export default function JournalSelector({ onApply, onClear }: Props) {
  const [journalId, setJournalId] = useState('')
  const [column, setColumn] = useState<'single' | 'double'>('single')

  const preset = JOURNAL_PRESETS.find(p => p.id === journalId) ?? null

  function applyPreset(p: typeof preset, col: 'single' | 'double') {
    if (!p) return
    onApply({
      exportWidth: getJournalExportWidth(p, col),
      exportPixelRatio: getJournalExportPixelRatio(p),
    })
  }

  function handleJournalChange(id: string) {
    setJournalId(id)
    if (!id) { onClear(); return }
    const p = JOURNAL_PRESETS.find(j => j.id === id)
    applyPreset(p ?? null, column)
  }

  function handleColumnChange(col: 'single' | 'double') {
    setColumn(col)
    applyPreset(preset, col)
  }

  return (
    <div className="space-y-3">

      {/* Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-500">Target journal</label>
        <select
          value={journalId}
          onChange={e => handleJournalChange(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">— None —</option>
          {JOURNAL_PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Column toggle + spec card — only when a journal is selected */}
      {preset && (
        <>
          {/* Column toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500">Column layout</label>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => handleColumnChange('single')}
                className={`flex-1 py-2 transition-colors ${
                  column === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Single · {preset.mmSingle}
              </button>
              <button
                onClick={() => handleColumnChange('double')}
                className={`flex-1 py-2 transition-colors border-l border-slate-200 ${
                  column === 'double'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Double · {preset.mmDouble}
              </button>
            </div>
          </div>

          {/* Spec info card */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
              Applied specifications
            </p>
            <div className="space-y-1">
              <SpecRow icon="📐" label="Width">
                {column === 'single' ? preset.mmSingle : preset.mmDouble}
                {' '}({column} column)
              </SpecRow>
              <SpecRow icon="🖋" label="Font">
                {preset.fontFamily.split(',')[0]}&nbsp;·&nbsp;
                {preset.labelSize}pt labels&nbsp;/&nbsp;{preset.tickSize}pt ticks
              </SpecRow>
              <SpecRow icon="🖨" label="Export">
                {preset.dpi}
              </SpecRow>
              {preset.panelLabels && (
                <SpecRow icon="🔤" label="Labels">
                  {preset.panelLabels}
                </SpecRow>
              )}
            </div>
          </div>

          {/* Export-only note */}
          <p className="text-[10px] text-slate-400 italic leading-snug">
            Specs applied at export — display size is for preview only
          </p>
        </>
      )}
    </div>
  )
}

function SpecRow({
  icon,
  label,
  children,
}: {
  icon: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline gap-1.5 text-[11px]">
      <span className="text-[10px] shrink-0">{icon}</span>
      <span className="font-medium text-slate-600 shrink-0 w-10">{label}</span>
      <span className="text-slate-500">{children}</span>
    </div>
  )
}
