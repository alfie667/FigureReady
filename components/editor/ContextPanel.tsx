'use client'

interface Props {
  title: string
  children: React.ReactNode
  onCollapse?: () => void
}

export default function ContextPanel({ title, children, onCollapse }: Props) {
  return (
    <aside className="hidden md:flex w-[308px] shrink-0 flex-col bg-white border-r border-[#E2E8F0] overflow-hidden z-10">
      {/* Panel header */}
      <div className="h-[56px] shrink-0 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
        <span className="text-[18px] font-semibold text-[#0F172A]">
          {title}
        </span>
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Collapse panel"
            className="w-8 h-8 flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors rounded-lg"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 2L4 8l6 6"/>
            </svg>
          </button>
        )}
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
        {children}
      </div>
    </aside>
  )
}
