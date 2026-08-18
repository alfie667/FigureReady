'use client'
import AnnotationInspector from './AnnotationInspector'
import type { ChartAnnotation } from '@/lib/annotations'

type InspectorTab = 'style' | 'settings'

interface Props {
  activeTab: InspectorTab
  onTabChange: (tab: InspectorTab) => void
  styleContent: React.ReactNode
  settingsContent: React.ReactNode
  isOpen?: boolean
  onCollapse?: () => void
  onExpand?: () => void
  selectedAnnotation?: ChartAnnotation | null
  onUpdateAnnotation?: (id: string, changes: Record<string, unknown>) => void
  onDeleteAnnotation?: (id: string) => void
}

const CollapseIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {direction === 'left'
      ? <path d="M10 2l-6 6 6 6"/>
      : <path d="M6 2l6 6-6 6"/>
    }
  </svg>
)

export default function RightInspector({
  activeTab, onTabChange, styleContent, settingsContent,
  isOpen = true, onCollapse, onExpand,
  selectedAnnotation, onUpdateAnnotation, onDeleteAnnotation,
}: Props) {

  // ── Collapsed strip ──────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div className="hidden md:flex w-[28px] shrink-0 flex-col items-center pt-4 bg-white border-l border-[#E2E8F0] z-10">
        <button
          onClick={onExpand}
          title="Expand inspector"
          className="w-7 h-7 flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors rounded-lg"
        >
          <CollapseIcon direction="left"/>
        </button>
      </div>
    )
  }

  // ── Annotation properties inspector ─────────────────────────────────────────
  if (selectedAnnotation) {
    return (
      <aside className="hidden md:flex w-[304px] shrink-0 flex-col bg-white border-l border-[#E2E8F0] overflow-hidden z-10">
        <div className="h-[56px] shrink-0 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
          <span className="text-[18px] font-semibold text-[#0F172A]">Properties</span>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse inspector"
              className="w-8 h-8 flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors rounded-lg shrink-0"
            >
              <CollapseIcon direction="right"/>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
          {onUpdateAnnotation && onDeleteAnnotation && (
            <AnnotationInspector
              annotation={selectedAnnotation}
              onUpdate={onUpdateAnnotation}
              onDelete={onDeleteAnnotation}
            />
          )}
        </div>
      </aside>
    )
  }

  // ── Style / Settings inspector ───────────────────────────────────────────────
  return (
    <aside className="hidden md:flex w-[304px] shrink-0 flex-col bg-white border-l border-[#E2E8F0] overflow-hidden z-10">
      {/* Tab bar with underline active state */}
      <div className="h-[48px] shrink-0 flex items-stretch border-b border-[#E2E8F0] px-5">
        <div className="flex items-stretch gap-6 flex-1">
          {(['style', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex items-center border-b-2 transition-colors text-[14px] font-medium capitalize -mb-px ${
                activeTab === tab
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab === 'style' ? 'Style' : 'Settings'}
            </button>
          ))}
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Collapse inspector"
            className="w-8 h-8 my-auto flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors rounded-lg shrink-0"
          >
            <CollapseIcon direction="right"/>
          </button>
        )}
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
        {activeTab === 'style'    && styleContent}
        {activeTab === 'settings' && settingsContent}
      </div>
    </aside>
  )
}
