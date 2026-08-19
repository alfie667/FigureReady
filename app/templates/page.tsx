'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'
import TemplateCard from '@/components/templates/TemplateCard'
import TemplateDetailModal from '@/components/templates/TemplateDetailModal'
import ColumnMappingModal from '@/components/templates/ColumnMappingModal'
import { FIGURE_TEMPLATES } from '@/lib/templates/definitions'
import { setPendingTemplate } from '@/lib/templates/session'
// analytics imports removed — page redirects immediately to /app?tab=templates
import type { FigureTemplate } from '@/lib/templates/types'

const ENABLED = process.env.NEXT_PUBLIC_TEMPLATES_ENABLED === 'true'

type FilterKey = 'all' | 'dose-response' | 'time-course' | 'comparison' | 'correlation' | 'spectra'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'dose-response', label: 'Dose-response' },
  { key: 'time-course', label: 'Time course' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'correlation', label: 'Correlation' },
  { key: 'spectra', label: 'Spectra' },
]

function matchesFilter(tpl: FigureTemplate, filter: FilterKey): boolean {
  if (filter === 'all') return true
  return tpl.category === filter
}

export default function TemplatesPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [detailTemplate, setDetailTemplate] = useState<FigureTemplate | null>(null)
  const [mappingTemplate, setMappingTemplate] = useState<FigureTemplate | null>(null)

  useEffect(() => {
    router.replace('/app?tab=templates')
  }, [router])

  const handleCardClick = (tpl: FigureTemplate) => {
    setDetailTemplate(tpl)
  }

  const handleUseTemplate = () => {
    if (!detailTemplate) return
    setMappingTemplate(detailTemplate)
    setDetailTemplate(null)
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
    if (!mappingTemplate) return
    setPendingTemplate({
      templateId: mappingTemplate.id,
      templateName: mappingTemplate.name,
      chartType: mappingTemplate.chartType,
      columns: mapping.columns,
      rows: mapping.rows,
      xCol: mapping.xCol,
      yCols: mapping.yCols,
      errorCols: mapping.errorCols,
      xAxisLabel: mapping.xAxisLabel,
      yAxisLabel: mapping.yAxisLabel,
      overrides: mappingTemplate.overrides,
      seriesColorsList: mappingTemplate.seriesColorsList,
      seriesStrokeWidthsList: mappingTemplate.seriesStrokeWidthsList,
      seriesMarkerSizesList: mappingTemplate.seriesMarkerSizesList,
      seriesMarkerShapesList: mappingTemplate.seriesMarkerShapesList,
    })
    router.push('/app')
  }

  if (!ENABLED) return null

  const visibleTemplates = FIGURE_TEMPLATES.filter(tpl => matchesFilter(tpl, activeFilter))

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="hover:opacity-75 transition-opacity">
            <LogoFull size={30} textSize={15} />
          </Link>
          <Link href="/app" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
            Open editor →
          </Link>
        </div>
      </header>

      {/* Hero + filter bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-10">
          <h1 className="text-[28px] md:text-[36px] font-bold text-slate-900 leading-tight tracking-tight">
            Choose the figure you want.
          </h1>
          <p className="mt-2.5 text-[15px] text-slate-500 max-w-lg leading-relaxed">
            Upload your data and recreate the same style in seconds.
          </p>

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 mt-7 overflow-x-auto pb-0">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${
                  activeFilter === f.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:text-slate-900 hover:ring-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-100 mt-4" />
        </div>
      </div>

      {/* Gallery */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 md:px-8 py-8 md:py-10">
        {visibleTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {visibleTemplates.map(tpl => (
              <TemplateCard key={tpl.id} template={tpl} onClick={handleCardClick} />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-slate-400 text-center py-16">
            No templates for this filter yet.
          </p>
        )}

        <div className="mt-10 pt-8 border-t border-slate-200 text-center">
          <p className="text-[13px] text-slate-400">
            Prefer to start blank?{' '}
            <Link href="/app" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">
              Open the editor directly →
            </Link>
          </p>
        </div>
      </main>

      {/* Detail modal */}
      {detailTemplate && (
        <TemplateDetailModal
          template={detailTemplate}
          onUse={handleUseTemplate}
          onClose={() => setDetailTemplate(null)}
        />
      )}

      {/* Mapping modal */}
      {mappingTemplate && (
        <ColumnMappingModal
          template={mappingTemplate}
          onConfirm={handleConfirm}
          onClose={() => setMappingTemplate(null)}
        />
      )}
    </div>
  )
}
