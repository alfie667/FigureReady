'use client'
import { useEffect, useRef, useState } from 'react'
import { getAllTemplates, deleteUserTemplate, type ChartTemplate } from '@/lib/templateStorage'
import { checkTemplateCompatibility, type CompatibilityContext, type CompatibilityResult } from '@/lib/templateCompatibility'

interface Props {
  onApply: (template: ChartTemplate) => void
  /** When provided, each template shows a ✓ / ⚠️ compatibility badge. */
  compatibilityContext?: CompatibilityContext
}

// ── Badge ─────────────────────────────────────────────────────────────────────

function CompatBadge({ result }: { result: CompatibilityResult }) {
  if (result.compatible) {
    return (
      <span
        title="Compatible with your data"
        className="shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
      >
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    )
  }
  return (
    <span
      title={result.message ?? 'Incompatible with your data'}
      className="shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[9px] font-bold leading-none"
    >
      !
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TemplateSelector({ onApply, compatibilityContext }: Props) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<ChartTemplate[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const refresh = () => setTemplates(getAllTemplates())

  useEffect(() => { refresh() }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleApply = (t: ChartTemplate) => {
    onApply(t)
    setOpen(false)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteUserTemplate(id)
    refresh()
  }

  const getCompat = (t: ChartTemplate): CompatibilityResult | null => {
    // Only show badges when we have real data (xRange non-null)
    if (!compatibilityContext || !compatibilityContext.xRange) return null
    return checkTemplateCompatibility(
      { chartType: t.chartType, overrides: t.overrides },
      compatibilityContext,
    )
  }

  const builtIn = templates.filter(t => t.builtIn)
  const user = templates.filter(t => !t.builtIn)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium">My Templates</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">

          {builtIn.length > 0 && (
            <>
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Built-in
              </p>
              {builtIn.map(t => {
                const compat = getCompat(t)
                const isIncompat = compat !== null && !compat.compatible
                return (
                  <button
                    key={t.id}
                    onClick={() => handleApply(t)}
                    title={isIncompat ? compat.message : undefined}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors ${
                      isIncompat
                        ? 'text-slate-400 hover:bg-amber-50 hover:text-slate-600'
                        : 'text-slate-700 hover:bg-[#dbeafe] hover:text-[#1d4ed8]'
                    }`}
                  >
                    <span className="flex-1 truncate">{t.name}</span>
                    {compat && <CompatBadge result={compat} />}
                  </button>
                )
              })}
            </>
          )}

          {user.length > 0 && (
            <>
              <div className="border-t border-slate-100 mt-1" />
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                My templates
              </p>
              {user.map(t => {
                const compat = getCompat(t)
                const isIncompat = compat !== null && !compat.compatible
                return (
                  <div key={t.id} className="flex items-center group">
                    <button
                      onClick={() => handleApply(t)}
                      title={isIncompat ? compat.message : undefined}
                      className={`flex-1 text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors ${
                        isIncompat
                          ? 'text-slate-400 hover:bg-amber-50 hover:text-slate-600'
                          : 'text-slate-700 hover:bg-[#dbeafe] hover:text-[#1d4ed8]'
                      }`}
                    >
                      <span className="flex-1 truncate">{t.name}</span>
                      {compat && <CompatBadge result={compat} />}
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, t.id)}
                      title="Delete template"
                      className="opacity-0 group-hover:opacity-100 px-3 py-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </>
          )}

          {templates.length === 0 && (
            <p className="px-3 py-3 text-xs text-slate-400">No templates saved yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
