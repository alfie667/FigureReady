'use client'
import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { FIGURE_TEMPLATES } from '@/lib/templates/definitions'
import { loadUserTemplates, type ChartTemplate } from '@/lib/templateStorage'
import type { FigureTemplate } from '@/lib/templates/types'

type Category = 'all' | 'spectra' | 'dose-response' | 'time-course' | 'comparison' | 'correlation'

const CATEGORY_LABELS: Record<Category, string> = {
  all:             'All',
  spectra:         'Spectroscopy',
  'dose-response': 'Dose-response',
  'time-course':   'Time-course',
  comparison:      'Comparison',
  correlation:     'Correlation',
}

const CHART_TYPE_LABEL: Record<string, string> = {
  line:         'Line',
  lineOnly:     'Line',
  scatter:      'Scatter',
  bar:          'Bar',
  doseResponse: 'Curve fit',
}

interface Props {
  onApply: (template: ChartTemplate) => void
  onClose: () => void
  activeTemplateId?: string | null
}

function cardSubtitle(t: FigureTemplate): string {
  const cat = CATEGORY_LABELS[t.category as Category] ?? t.category
  const chart = CHART_TYPE_LABEL[t.chartType] ?? ''
  return chart ? `${cat} · ${chart}` : cat
}

// ── Sticky "Use template" action bar ─────────────────────────────────────────

function ActionBar({
  template,
  onApply,
  onDeselect,
}: {
  template: FigureTemplate | ChartTemplate
  onApply: () => void
  onDeselect: () => void
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-[#E5EAF2] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] px-5 py-3">
      <span className="text-[13px] font-semibold text-slate-800 max-w-[220px] truncate">
        {template.name}
      </span>
      <div className="w-px h-4 bg-slate-200 mx-1" />
      <button
        onClick={onApply}
        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold px-4 py-1.5 rounded-xl transition-colors"
      >
        Use template
      </button>
      <button
        onClick={onDeselect}
        className="text-slate-400 hover:text-slate-700 transition-colors p-1"
        aria-label="Deselect"
      >
        <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Public template card (SVG preview) ───────────────────────────────────────

function PublicCard({
  template,
  selected,
  isActive,
  onSelect,
  onApply,
}: {
  template: FigureTemplate
  selected: boolean
  isActive: boolean
  onSelect: () => void
  onApply: () => void
}) {
  const subtitle = cardSubtitle(template)

  return (
    <div
      onDoubleClick={onApply}
      onClick={onSelect}
      className={`group relative flex flex-col rounded-2xl border bg-white cursor-pointer overflow-hidden transition-all duration-150 ${
        selected
          ? 'border-[#2563eb] shadow-[0_0_0_1px_#2563eb,0_2px_12px_rgba(37,99,235,0.08)]'
          : 'border-[#E6EBF2] hover:border-[#93c5fd] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Selection check badge */}
      {selected && (
        <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center shadow-sm">
          <svg style={{ width: 10, height: 10 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* "Active" badge — template currently applied to canvas */}
      {isActive && !selected && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
          <svg style={{ width: 8, height: 8 }} fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Active
        </div>
      )}

      {/* "Preview" hover affordance — top-left */}
      {!selected && (
        <div className="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <span className="text-[11px] font-medium bg-white/90 backdrop-blur-sm text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
            Preview
          </span>
        </div>
      )}

      {/* Preview — scientific figure on light background */}
      <div className="relative w-full bg-[#F4F7FA]" style={{ aspectRatio: '4/3' }}>
        <Image
          src={template.previewImage}
          alt={template.name}
          fill
          className="object-contain p-5"
          unoptimized
        />
      </div>

      {/* Card footer */}
      <div className="px-4 py-3.5 border-t border-[#F0F3F7]">
        <p className="text-[15px] font-semibold text-slate-800 leading-snug mb-0.5 truncate">{template.name}</p>
        <p className="text-[12px] text-slate-500 leading-snug">{subtitle}</p>
      </div>
    </div>
  )
}

// ── User template card (no SVG preview) ──────────────────────────────────────

function UserCard({
  template,
  selected,
  isActive,
  onSelect,
  onApply,
}: {
  template: ChartTemplate
  selected: boolean
  isActive: boolean
  onSelect: () => void
  onApply: () => void
}) {
  return (
    <div
      onDoubleClick={onApply}
      onClick={onSelect}
      className={`group relative flex flex-col rounded-2xl border bg-white cursor-pointer overflow-hidden transition-all duration-150 ${
        selected
          ? 'border-[#2563eb] shadow-[0_0_0_1px_#2563eb,0_2px_12px_rgba(37,99,235,0.08)]'
          : 'border-[#E6EBF2] hover:border-[#93c5fd] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      }`}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center shadow-sm">
          <svg style={{ width: 10, height: 10 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {isActive && !selected && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
          <svg style={{ width: 8, height: 8 }} fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Active
        </div>
      )}

      <div
        className="w-full flex items-center justify-center bg-[#F4F7FA]"
        style={{ aspectRatio: '4/3' }}
      >
        <svg style={{ width: 36, height: 36 }} className="text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 3 3 4-5" />
        </svg>
      </div>

      <div className="px-4 py-3.5 border-t border-[#F0F3F7]">
        <p className="text-[15px] font-semibold text-slate-800 leading-snug mb-0.5 truncate">{template.name}</p>
        <p className="text-[12px] text-slate-500 leading-snug">My template</p>
      </div>
    </div>
  )
}

// ── Main gallery ──────────────────────────────────────────────────────────────

export default function TemplateGallery({ onApply, onClose, activeTemplateId }: Props) {
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState<Category>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userTemplates, setUserTemplates] = useState<ChartTemplate[]>([])

  useEffect(() => { setUserTemplates(loadUserTemplates()) }, [])

  const selectedTemplate: (FigureTemplate | ChartTemplate) | null = useMemo(() => {
    if (!selectedId) return null
    return (
      FIGURE_TEMPLATES.find(t => t.id === selectedId) ??
      userTemplates.find(t => t.id === selectedId) ??
      null
    )
  }, [selectedId, userTemplates])

  const filteredPublic = useMemo(() => {
    const q = search.toLowerCase()
    return FIGURE_TEMPLATES.filter(t => {
      const matchesCategory = category === 'all' || t.category === category
      const matchesSearch   = !q || t.name.toLowerCase().includes(q) || t.category.includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  const filteredUser = useMemo(() => {
    const q = search.toLowerCase()
    return userTemplates.filter(t => !q || t.name.toLowerCase().includes(q))
  }, [search, userTemplates])

  function handleApply(template: FigureTemplate | ChartTemplate) {
    onApply(template)
    onClose()
  }

  const categories: Category[] = ['all', 'spectra', 'dose-response', 'time-course', 'comparison', 'correlation']
  const hasResults = filteredPublic.length > 0 || filteredUser.length > 0

  return (
    <div className="relative flex flex-col h-full bg-white overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-7 pb-5 border-b border-[#F0F3F7] bg-white">

        {/* Title + close */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight leading-snug">
              Templates
            </h2>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Start with a publication-ready scientific layout.
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Close gallery"
          >
            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            style={{ width: 15, height: 15 }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full pl-9 pr-8 py-2 text-[13px] text-slate-700 placeholder-slate-400 border border-[#E6EBF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 focus:border-[#2563eb] transition-colors bg-[#F8FAFC]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                category === cat
                  ? 'bg-[#EEF3FF] text-[#2563eb] font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 bg-[#FAFBFC]">

        {/* Empty state */}
        {!hasResults && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <svg className="mb-3 text-slate-200" style={{ width: 32, height: 32 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[13px]">No templates found for &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {/* Public templates */}
        {filteredPublic.length > 0 && (
          <div className="mb-8">
            {filteredUser.length > 0 && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Scientific Templates
              </p>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredPublic.map(tpl => (
                <PublicCard
                  key={tpl.id}
                  template={tpl}
                  selected={selectedId === tpl.id}
                  isActive={activeTemplateId === tpl.id}
                  onSelect={() => setSelectedId(prev => prev === tpl.id ? null : tpl.id)}
                  onApply={() => handleApply(tpl)}
                />
              ))}
            </div>
          </div>
        )}

        {/* User templates */}
        {filteredUser.length > 0 && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
              My Templates
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredUser.map(tpl => (
                <UserCard
                  key={tpl.id}
                  template={tpl}
                  selected={selectedId === tpl.id}
                  isActive={activeTemplateId === tpl.id}
                  onSelect={() => setSelectedId(prev => prev === tpl.id ? null : tpl.id)}
                  onApply={() => handleApply(tpl)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Sticky action bar (appears on card selection) ───────────────── */}
      {selectedTemplate && (
        <ActionBar
          template={selectedTemplate}
          onApply={() => handleApply(selectedTemplate)}
          onDeselect={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
