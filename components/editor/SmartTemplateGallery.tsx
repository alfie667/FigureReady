'use client'
import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { SMART_TEMPLATES, type SmartTemplate } from '@/lib/smartTemplates'
import { buildTemplateOverrides } from '@/lib/templates/apply'
import { isErrorColumn, matchErrorColumn } from '@/lib/detectColumns'
import type { ChartType } from '@/lib/templateStorage'
import type { StyleOverrides } from '@/lib/chartStyles'
import { trackSmartTemplateViewed, trackSmartTemplateSelected } from '@/lib/analytics'

// ── Public types ──────────────────────────────────────────────────────────────

export interface SmartWorkflowResult {
  templateId: string
  templateName: string
  chartType: ChartType
  xCol: string
  yCols: string[]
  errorCols: Record<string, string>
  xAxisLabel: string
  yAxisLabel: string
  overrides: StyleOverrides
}

interface Props {
  columns: string[]
  data: Record<string, unknown>[]
  xCol: string
  yCols: string[]
  errorCols: Record<string, string>
  onApply: (result: SmartWorkflowResult) => void
  onClose: () => void
  onLoadFTIRDemo: () => void
  onLoadDRDemo: () => void
}

// ── Gallery card ──────────────────────────────────────────────────────────────

function GalleryCard({
  template,
  onSelect,
}: {
  template: SmartTemplate
  onSelect: () => void
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#E6EBF2] bg-white overflow-hidden hover:border-[#93c5fd] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-150">
      {/* Preview illustration */}
      <div className="relative w-full bg-[#F4F7FA]" style={{ aspectRatio: '4/3' }}>
        <Image
          src={template.previewImage}
          alt={template.name}
          fill
          className="object-contain p-5"
          unoptimized
        />
      </div>

      {/* Card content */}
      <div className="p-5 flex flex-col gap-3 flex-1 border-t border-[#F0F3F7]">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900 leading-snug mb-1.5">{template.name}</h3>
          <p className="text-[12px] text-slate-500 leading-relaxed">{template.tagline}</p>
        </div>

        <ul className="space-y-1.5">
          {template.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600 leading-snug">
              <svg className="w-3.5 h-3.5 text-[#2563eb] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {bullet}
            </li>
          ))}
        </ul>

        <button
          onClick={onSelect}
          className="mt-auto w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          Use workflow
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Workflow wizard ───────────────────────────────────────────────────────────

function WorkflowWizard({
  template,
  columns,
  data,
  initialXCol,
  initialYCols,
  initialErrorCols,
  onApply,
  onBack,
  onClose,
  onLoadFTIRDemo,
  onLoadDRDemo,
}: {
  template: SmartTemplate
  columns: string[]
  data: Record<string, unknown>[]
  initialXCol: string
  initialYCols: string[]
  initialErrorCols: Record<string, string>
  onApply: (result: SmartWorkflowResult) => void
  onBack: () => void
  onClose: () => void
  onLoadFTIRDemo: () => void
  onLoadDRDemo: () => void
}) {
  const candidateColumns = useMemo(() => columns.filter(c => !isErrorColumn(c)), [columns])

  const [localXCol, setLocalXCol] = useState<string>(() => {
    if (candidateColumns.includes(initialXCol)) return initialXCol
    return candidateColumns[0] ?? ''
  })

  const yCandidate = useMemo(
    () => candidateColumns.filter(c => c !== localXCol),
    [candidateColumns, localXCol]
  )

  const [localYCols, setLocalYCols] = useState<string[]>(() => {
    const filtered = initialYCols.filter(c => c !== localXCol && candidateColumns.includes(c))
    return filtered.length > 0 ? filtered : yCandidate.slice(0, 6)
  })

  // Dose-response: auto-detect error columns
  const [localErrorCols, setLocalErrorCols] = useState<Record<string, string>>(() => {
    if (template.workflowType !== 'dose-response') return {}
    const detected: Record<string, string> = {}
    for (const y of localYCols) {
      const match = matchErrorColumn(y, columns)
      if (match) detected[y] = match
    }
    return Object.keys(detected).length > 0 ? detected : initialErrorCols
  })

  // Axis labels
  const [localXLabel, setLocalXLabel] = useState(template.defaultXLabel)
  const [localYLabel, setLocalYLabel] = useState(template.defaultYLabel)

  // Stacking options
  const [stackingMode, setStackingMode] = useState<'auto' | 'custom'>('auto')
  const [customGap, setCustomGap] = useState('0.20')

  // Remove selected X col from Y selection when X changes
  useEffect(() => {
    setLocalYCols(prev => prev.filter(c => c !== localXCol))
  }, [localXCol])

  const hasData = columns.length > 0 && data.length > 0
  const canGenerate = hasData && localXCol.length > 0 && localYCols.length > 0

  const isStacked = template.workflowType === 'ftir-stacked' || template.workflowType === 'xrd-stacked'
  const isDoseResponse = template.workflowType === 'dose-response'

  function toggleYCol(col: string) {
    setLocalYCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])
  }

  function handleGenerate() {
    const finalOverrides: StyleOverrides = {
      ...template.overrides,
      ...(stackingMode === 'custom' && isStacked
        ? { stackingMode: 'auto', stackGap: parseFloat(customGap) || 0.20 }
        : {}),
    }
    const overrides = buildTemplateOverrides(
      {
        overrides: finalOverrides,
        seriesColorsList: template.seriesColorsList,
        seriesStrokeWidthsList: template.seriesStrokeWidthsList,
        seriesMarkerSizesList: template.seriesMarkerSizesList,
        seriesMarkerShapesList: template.seriesMarkerShapesList,
        seriesYOffsetsList: template.seriesYOffsetsList,
        paletteId: template.paletteId,
      },
      localYCols
    )
    onApply({
      templateId: template.id,
      templateName: template.name,
      chartType: template.chartType,
      xCol: localXCol,
      yCols: localYCols,
      errorCols: isDoseResponse ? localErrorCols : {},
      xAxisLabel: localXLabel,
      yAxisLabel: localYLabel,
      overrides,
    })
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-6 pb-5 border-b border-[#F0F3F7]">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Smart Templates
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <h2 className="text-[18px] font-bold text-slate-900 tracking-tight leading-snug">{template.name}</h2>
        <p className="text-[13px] text-slate-400 mt-0.5 leading-snug">{template.tagline}</p>
      </div>

      {/* ── Scrollable form ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7">

        {/* No data banner */}
        {!hasData && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-[13px] font-semibold text-amber-800 mb-1.5">Upload data to use this workflow</p>
            <p className="text-[12px] text-amber-700 mb-4 leading-relaxed">
              {template.workflowType === 'ftir-stacked'
                ? 'Upload an Excel file with a Wavenumber column and one column per FTIR spectrum.'
                : template.workflowType === 'xrd-stacked'
                ? 'Upload an Excel file with a 2θ column and one column per diffraction pattern.'
                : 'Upload an Excel file with a Concentration column, one Response column per compound, and optional error columns.'}
            </p>
            {(template.workflowType === 'ftir-stacked' || template.workflowType === 'dose-response') && (
              <button
                onClick={template.workflowType === 'ftir-stacked' ? onLoadFTIRDemo : onLoadDRDemo}
                className="text-[12px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
              >
                Load demo data →
              </button>
            )}
          </div>
        )}

        {/* ── Column mapping section ──────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Data mapping
          </p>

          {/* X column */}
          <div className="mb-4">
            <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">
              {isDoseResponse
                ? 'Concentration column (X)'
                : template.workflowType === 'xrd-stacked'
                ? '2θ column (X)'
                : 'Wavenumber column (X)'}
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <select
              value={localXCol}
              onChange={e => setLocalXCol(e.target.value)}
              disabled={!hasData}
              className="w-full border border-[#E6EBF2] rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 focus:border-[#2563eb] bg-white disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            >
              {candidateColumns.length === 0
                ? <option value="">— no data loaded —</option>
                : candidateColumns.map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>

          {/* Y columns */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-semibold text-slate-700">
                {isDoseResponse ? 'Response series (Y)' : 'Spectra / Y series'}
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              {yCandidate.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setLocalYCols(yCandidate)}
                    className="text-[11px] font-medium text-[#2563eb] hover:underline"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLocalYCols([])}
                    className="text-[11px] font-medium text-slate-400 hover:underline"
                  >
                    None
                  </button>
                </div>
              )}
            </div>

            {yCandidate.length === 0 ? (
              <p className="text-[12px] text-slate-400 italic py-2">
                {hasData ? 'Select a different X column to unlock Y candidates.' : 'No columns available.'}
              </p>
            ) : (
              <div className="rounded-xl border border-[#E6EBF2] divide-y divide-[#F8FAFC] max-h-52 overflow-y-auto">
                {yCandidate.map(col => (
                  <label
                    key={col}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={localYCols.includes(col)}
                      onChange={() => toggleYCol(col)}
                      className="w-3.5 h-3.5 rounded accent-[#2563eb] shrink-0"
                    />
                    <span className="text-[13px] text-slate-700">{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Error columns — dose-response only */}
          {isDoseResponse && localYCols.length > 0 && (
            <div className="mb-4">
              <p className="text-[12px] font-semibold text-slate-700 mb-1.5">Error columns <span className="text-slate-400 font-normal">(optional)</span></p>
              <div className="space-y-2">
                {localYCols.map(y => (
                  <div key={y} className="flex items-center gap-3">
                    <span className="text-[12px] text-slate-500 w-36 truncate shrink-0">{y}</span>
                    <select
                      value={localErrorCols[y] ?? ''}
                      onChange={e => {
                        const v = e.target.value
                        setLocalErrorCols(prev => {
                          const next = { ...prev }
                          if (v) next[y] = v; else delete next[y]
                          return next
                        })
                      }}
                      className="flex-1 border border-[#E6EBF2] rounded-lg px-2 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 bg-white"
                    >
                      <option value="">None</option>
                      {columns
                        .filter(c => c !== localXCol && !localYCols.includes(c))
                        .map(c => <option key={c} value={c}>{c}</option>)
                      }
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Axis labels */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">X axis label</label>
              <input
                type="text"
                value={localXLabel}
                onChange={e => setLocalXLabel(e.target.value)}
                className="w-full border border-[#E6EBF2] rounded-xl px-3 py-2 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">Y axis label</label>
              <input
                type="text"
                value={localYLabel}
                onChange={e => setLocalYLabel(e.target.value)}
                className="w-full border border-[#E6EBF2] rounded-xl px-3 py-2 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── Scientific options section ──────────────────────────────── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Scientific options
          </p>

          {/* Stacking options — FTIR / XRD */}
          {isStacked && (
            <div>
              <p className="text-[12px] font-semibold text-slate-700 mb-2">Vertical spacing</p>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`stacking-${template.id}`}
                    value="auto"
                    checked={stackingMode === 'auto'}
                    onChange={() => setStackingMode('auto')}
                    className="accent-[#2563eb]"
                  />
                  <span className="text-[12px] text-slate-700">Automatic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`stacking-${template.id}`}
                    value="custom"
                    checked={stackingMode === 'custom'}
                    onChange={() => setStackingMode('custom')}
                    className="accent-[#2563eb]"
                  />
                  <span className="text-[12px] text-slate-700">Custom gap</span>
                </label>
                {stackingMode === 'custom' && (
                  <input
                    type="number"
                    value={customGap}
                    onChange={e => setCustomGap(e.target.value)}
                    min="0.05"
                    max="2"
                    step="0.05"
                    className="w-20 border border-[#E6EBF2] rounded-lg px-2 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 bg-white"
                  />
                )}
              </div>
            </div>
          )}

          {/* Dose-response options */}
          {isDoseResponse && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded bg-[#EEF3FF] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-700">4PL curve fitting</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automatic sigmoid fit — IC₅₀ visible in the Fit Results panel (right inspector → Series tab)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded bg-[#EEF3FF] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-700">Log-concentration axis</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">X axis automatically set to logarithmic scale</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Generate button ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 py-5 border-t border-[#F0F3F7] bg-white">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[14px] font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Generate figure
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {!canGenerate && hasData && (
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Select an X column and at least one Y column to continue.
          </p>
        )}
        {!hasData && (
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Load data first to generate the figure.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main gallery ──────────────────────────────────────────────────────────────

export default function SmartTemplateGallery({
  columns, data, xCol, yCols, errorCols,
  onApply, onClose, onLoadFTIRDemo, onLoadDRDemo,
}: Props) {
  const [activeTemplate, setActiveTemplate] = useState<SmartTemplate | null>(null)

  useEffect(() => { trackSmartTemplateViewed() }, [])

  if (activeTemplate) {
    return (
      <WorkflowWizard
        key={columns.join(',')} // remount when columns change (e.g. after demo load)
        template={activeTemplate}
        columns={columns}
        data={data}
        initialXCol={xCol}
        initialYCols={yCols}
        initialErrorCols={errorCols}
        onApply={onApply}
        onBack={() => setActiveTemplate(null)}
        onClose={onClose}
        onLoadFTIRDemo={onLoadFTIRDemo}
        onLoadDRDemo={onLoadDRDemo}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFBFC] overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-7 pb-5 border-b border-[#F0F3F7] bg-white">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Smart Templates</h2>
            <p className="text-[13px] text-slate-400 mt-0.5">Automate common scientific figure workflows.</p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {SMART_TEMPLATES.map(tpl => (
            <GalleryCard
              key={tpl.id}
              template={tpl}
              onSelect={() => {
                trackSmartTemplateSelected({ template_id: tpl.id, template_name: tpl.name, chart_type: tpl.chartType })
                setActiveTemplate(tpl)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
