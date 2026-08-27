'use client'
import { useRef, useState } from 'react'
import { useProjectStore } from '@/lib/projectStore'

interface Props {
  onSwitch: (id: string) => void
  onCreate: () => void
  onToggleMultiPanel: () => void
  isMultiPanel: boolean
}

// ── Inline editable figure name ───────────────────────────────────────────────

function TabLabel({ id, name, isActive }: { id: string; name: string; isActive: boolean }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)
  const rename = useProjectStore(s => s.renameFigure)

  const commit = () => {
    const trimmed = draft.trim() || 'Untitled figure'
    if (trimmed !== name) rename(id, trimmed)
    setEditing(false)
  }

  if (editing && isActive) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(name); setEditing(false) }
        }}
        autoFocus
        className="bg-transparent outline-none text-[13px] font-medium text-[#0F172A] w-[120px] min-w-0"
        onClick={e => e.stopPropagation()}
      />
    )
  }

  return (
    <span
      className="truncate max-w-[130px] text-[13px] font-medium"
      onDoubleClick={e => { if (isActive) { e.stopPropagation(); setDraft(name); setEditing(true) } }}
    >
      {name}
    </span>
  )
}

// ── FigureTabBar ──────────────────────────────────────────────────────────────

export default function FigureTabBar({ onSwitch, onCreate, onToggleMultiPanel, isMultiPanel }: Props) {
  const figures       = useProjectStore(s => s.figures)
  const activeFigureId = useProjectStore(s => s.activeFigureId)
  const deleteFigure  = useProjectStore(s => s.deleteFigure)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (figures.length <= 1) return  // always keep at least one
    if (confirmDelete === id) {
      deleteFigure(id)
      // If deleting active figure, switch to the new active (store handles it)
      if (id === activeFigureId) {
        const remaining = figures.filter(f => f.id !== id)
        if (remaining[0]) onSwitch(remaining[0].id)
      }
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      // Auto-dismiss confirm after 2s
      setTimeout(() => setConfirmDelete(c => c === id ? null : c), 2000)
    }
  }

  return (
    <div className="h-10 shrink-0 flex items-center bg-[#F8FAFC] border-b border-[#E2E8F0] px-2 gap-0.5 overflow-x-auto">

      {/* Figure tabs */}
      {figures.map(fig => {
        const isActive = fig.id === activeFigureId
        return (
          <button
            key={fig.id}
            onClick={() => { if (!isActive) onSwitch(fig.id) }}
            className={`
              group flex items-center gap-1.5 h-7 px-3 rounded-md text-[13px] shrink-0
              transition-colors select-none whitespace-nowrap
              ${isActive
                ? 'bg-white shadow-sm border border-[#E2E8F0] text-[#0F172A]'
                : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
              }
            `}
          >
            {/* File icon */}
            <svg className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>

            <TabLabel id={fig.id} name={fig.name} isActive={isActive} />

            {/* Close button — only on active, only when > 1 figure */}
            {isActive && figures.length > 1 && (
              <span
                role="button"
                onClick={e => handleDelete(e, fig.id)}
                className={`
                  ml-0.5 w-4 h-4 flex items-center justify-center rounded transition-colors
                  ${confirmDelete === fig.id
                    ? 'bg-red-100 text-red-500'
                    : 'opacity-0 group-hover:opacity-100 text-[#94A3B8] hover:text-[#ef4444] hover:bg-[#FEF2F2]'
                  }
                `}
                title={confirmDelete === fig.id ? 'Click again to confirm' : 'Close figure'}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
            )}
          </button>
        )
      })}

      {/* New figure button */}
      <button
        onClick={onCreate}
        title="New figure"
        className="flex items-center justify-center w-7 h-7 rounded-md text-[#94A3B8] hover:text-[#2563EB] hover:bg-white transition-colors shrink-0 ml-0.5"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Multi-panel toggle */}
      <button
        onClick={onToggleMultiPanel}
        className={`
          flex items-center gap-1.5 h-7 px-3 rounded-md text-[13px] font-medium shrink-0 transition-colors
          ${isMultiPanel
            ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
            : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
          }
        `}
        title="Multi-panel composer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="5" height="12" rx="1"/>
          <rect x="8" y="1" width="5" height="12" rx="1"/>
        </svg>
        <span className="hidden sm:inline">Multi-panel</span>
      </button>
    </div>
  )
}
