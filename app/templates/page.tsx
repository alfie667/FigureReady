'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'
import TemplateCard from '@/components/templates/TemplateCard'
import ColumnMappingModal from '@/components/templates/ColumnMappingModal'
import { FIGURE_TEMPLATES } from '@/lib/templates/definitions'
import { setPendingTemplate } from '@/lib/templates/session'
import { buildTemplateOverrides } from '@/lib/templates/apply'
import { trackTemplateGalleryViewed, trackTemplateSelected } from '@/lib/analytics'
import type { FigureTemplate } from '@/lib/templates/types'

const ENABLED = process.env.NEXT_PUBLIC_TEMPLATES_ENABLED === 'true'

export default function TemplatesPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<FigureTemplate | null>(null)

  useEffect(() => {
    if (!ENABLED) { router.replace('/app'); return }
    trackTemplateGalleryViewed()
  }, [router])

  const handleSelect = (tpl: FigureTemplate) => {
    trackTemplateSelected({
      template_id: tpl.id,
      template_name: tpl.name,
      chart_type: tpl.chartType,
    })
    setSelected(tpl)
  }

  const handleConfirm = (mapping: {
    columns: string[]
    rows: Record<string, unknown>[]
    xCol: string
    yCols: string[]
    errorCols: Record<string, string>
    xAxisLabel: string
    yAxisLabel: string
  }) => {
    if (!selected) return
    setPendingTemplate({
      templateId: selected.id,
      templateName: selected.name,
      chartType: selected.chartType,
      columns: mapping.columns,
      rows: mapping.rows,
      xCol: mapping.xCol,
      yCols: mapping.yCols,
      errorCols: mapping.errorCols,
      xAxisLabel: mapping.xAxisLabel,
      yAxisLabel: mapping.yAxisLabel,
      overrides: selected.overrides,
      seriesColorsList: selected.seriesColorsList,
      seriesStrokeWidthsList: selected.seriesStrokeWidthsList,
      seriesMarkerSizesList: selected.seriesMarkerSizesList,
      seriesMarkerShapesList: selected.seriesMarkerShapesList,
    })
    router.push('/app')
  }

  if (!ENABLED) return null

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.05)] shrink-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <LogoFull size={30} textSize={15} />
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Open editor
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#dbeafe] text-[#1d4ed8] uppercase tracking-wider">
              Template Gallery
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            Start from a proven<br className="hidden sm:block"/> scientific figure layout.
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-500 max-w-xl leading-relaxed">
            Choose a template, upload your data, and open the full editor — pre-configured for your figure type.
            Every setting remains editable.
          </p>
        </div>
      </div>

      {/* Template grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {FIGURE_TEMPLATES.map(tpl => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Alternative flow */}
        <div className="mt-10 pt-8 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            Prefer to start blank?{' '}
            <Link
              href="/app"
              className="text-[#2563eb] font-semibold hover:underline"
            >
              Open the editor directly →
            </Link>
          </p>
        </div>
      </main>

      {/* Column mapping modal */}
      {selected && (
        <ColumnMappingModal
          template={selected}
          onConfirm={handleConfirm}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
