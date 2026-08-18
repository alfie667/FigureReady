'use client'
import { Fragment } from 'react'

export interface NavTab {
  id: string
  label: string
  icon: React.ReactNode
}

interface Props {
  tabs: NavTab[]
  activeTab: string | null
  onTabChange: (id: string | null) => void
}

export default function LeftNav({ tabs, activeTab, onTabChange }: Props) {
  return (
    <nav className="hidden md:flex w-[88px] shrink-0 flex-col items-center py-3 gap-1 bg-white border-r border-[#E2E8F0] z-20">
      {tabs.map((tab, i) => {
        const active = activeTab === tab.id
        return (
          <Fragment key={tab.id}>
            {/* Separator between "templates" and "graph" (before index 2) */}
            {i === 2 && (
              <div className="w-12 h-px bg-[#E2E8F0] my-2 shrink-0" />
            )}
            <button
              title={tab.label}
              onClick={() => onTabChange(active ? null : tab.id)}
              className={`w-[72px] h-[64px] rounded-xl flex flex-col items-center justify-center gap-[7px] transition-all duration-100 select-none ${
                active
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                {tab.icon}
              </div>
              <span className={`text-[12px] font-semibold leading-none whitespace-nowrap ${
                active ? 'text-[#2563EB]' : 'text-[#334155]'
              }`}>
                {tab.label}
              </span>
            </button>
          </Fragment>
        )
      })}
    </nav>
  )
}
