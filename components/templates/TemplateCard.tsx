'use client'
import Image from 'next/image'
import type { FigureTemplate } from '@/lib/templates/types'

function getMetaLine(tpl: FigureTemplate): string {
  const typeLabel: Record<string, string> = { scatter: 'Scatter', line: 'Line', lineOnly: 'Line', bar: 'Bar' }
  const extras: string[] = []
  if (tpl.requiredDataRoles.group) extras.push('multi-series')
  if (tpl.requiredDataRoles.error) extras.push('error bars')
  if (!extras.length) extras.push('1–3 series')
  return [(typeLabel[tpl.chartType] ?? tpl.chartType), ...extras].join(' · ')
}

interface Props {
  template: FigureTemplate
  onClick: (tpl: FigureTemplate) => void
}

export default function TemplateCard({ template, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(template)}
      className="group text-left w-full bg-white rounded-xl ring-1 ring-black/[0.06] overflow-hidden hover:ring-black/[0.12] hover:shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Preview */}
      <div className="relative overflow-hidden border-b border-slate-100" style={{ aspectRatio: '7/5' }}>
        <Image
          src={template.previewImage}
          alt={`${template.name} preview`}
          fill
          unoptimized
          className="object-contain p-4"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/[0.025] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
          <span className="bg-white/95 text-slate-900 text-[13px] font-semibold px-4 py-2 rounded-full shadow-sm">
            Use this template →
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3.5">
        <p className="text-[13px] font-semibold text-slate-900 leading-tight">{template.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{getMetaLine(template)}</p>
      </div>
    </button>
  )
}
