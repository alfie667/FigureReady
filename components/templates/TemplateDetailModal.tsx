'use client'
import Image from 'next/image'
import type { FigureTemplate } from '@/lib/templates/types'

const CHART_LABELS: Record<string, string> = {
  scatter: 'Scatter plot',
  line: 'Line plot',
  lineOnly: 'Line plot',
  bar: 'Bar chart',
}

function RoleRow({ label, required }: { label: string; required: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {required ? (
        <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        </span>
      )}
      <span className={`text-sm ${required ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
      {!required && <span className="text-[11px] text-slate-300 ml-0.5">optional</span>}
    </div>
  )
}

interface Props {
  template: FigureTemplate
  onUse: () => void
  onClose: () => void
}

export default function TemplateDetailModal({ template, onUse, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[3px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row">

        {/* Left — large preview */}
        <div className="md:w-[58%] bg-[#F8FAFC] flex items-center justify-center p-8 md:p-10 min-h-[220px] border-b md:border-b-0 md:border-r border-slate-100">
          <Image
            src={template.previewImage}
            alt={`${template.name} preview`}
            width={420}
            height={300}
            unoptimized
            className="w-full h-auto max-h-[300px] object-contain"
          />
        </div>

        {/* Right — info + CTA */}
        <div className="flex-1 flex flex-col p-7 md:p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-1 pt-1">
            {/* Type label */}
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {CHART_LABELS[template.chartType] ?? template.chartType}
            </p>

            {/* Name */}
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{template.name}</h2>

            {/* Description */}
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{template.description}</p>

            {/* Data requirements */}
            <div className="mt-6">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Data requirements
              </p>
              <div className="space-y-2">
                <RoleRow label="X column" required={template.requiredDataRoles.x} />
                <RoleRow label="Y column (1 or more)" required={template.requiredDataRoles.y} />
                <RoleRow
                  label="Error column (SD, SE, SEM)"
                  required={!!template.requiredDataRoles.error}
                />
                <RoleRow
                  label="Group / series column"
                  required={!!template.requiredDataRoles.group}
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onUse}
            className="mt-7 w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Use this template
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
