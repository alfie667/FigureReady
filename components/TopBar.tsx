'use client'
import { useState } from 'react'
import { Logo, StepNav, type NavStep } from './Sidebar'

export default function TopBar({ steps }: { steps: NavStep[] }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <Logo />
      </div>
      {open && (
        <div className="border-t border-slate-200 px-4 py-3">
          <StepNav steps={steps} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </header>
  )
}
