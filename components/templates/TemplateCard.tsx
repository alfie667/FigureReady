'use client'
import Image from 'next/image'
import type { FigureTemplate } from '@/lib/templates/types'

const CATEGORY_LABELS: Record<FigureTemplate['category'], string> = {
  scientific: 'Scientific',
  'time-series': 'Time-series',
  comparison: 'Comparison',
}

const CHART_TYPE_LABELS: Record<string, string> = {
  scatter: 'Scatter',
  line: 'Line',
  lineOnly: 'Line',
  bar: 'Bar',
}

interface Props {
  template: FigureTemplate
  onSelect: (tpl: FigureTemplate) => void
}

export default function TemplateCard({ template, onSelect }: Props) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#2563eb]/40 transition-all duration-200">
      {/* Preview image */}
      <div className="relative bg-slate-50 border-b border-slate-100 overflow-hidden" style={{ aspectRatio: '280/200' }}>
        <Image
          src={template.previewImage}
          alt={`${template.name} preview`}
          fill
          className="object-contain p-3"
          unoptimized
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900 leading-tight">{template.name}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{template.description}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {CATEGORY_LABELS[template.category]}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#dbeafe] text-[#1d4ed8]">
            {CHART_TYPE_LABELS[template.chartType] ?? template.chartType}
          </span>
          {template.requiredDataRoles.error && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
              Error bars
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelect(template)}
          className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          Use template
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}
