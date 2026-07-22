'use client'
import { useEffect, useRef, useState } from 'react'
import { getAllTemplates, deleteUserTemplate, type ChartTemplate } from '@/lib/templateStorage'

interface Props {
  onApply: (template: ChartTemplate) => void
}

export default function TemplateSelector({ onApply }: Props) {
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
              {builtIn.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleApply(t)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-[#e8f5ee] hover:text-[#155d35] transition-colors"
                >
                  {t.name}
                </button>
              ))}
            </>
          )}

          {user.length > 0 && (
            <>
              <div className="border-t border-slate-100 mt-1" />
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                My templates
              </p>
              {user.map(t => (
                <div key={t.id} className="flex items-center group">
                  <button
                    onClick={() => handleApply(t)}
                    className="flex-1 text-left px-3 py-2 text-xs text-slate-700 hover:bg-[#e8f5ee] hover:text-[#155d35] transition-colors"
                  >
                    {t.name}
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
              ))}
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
