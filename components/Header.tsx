'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUsage, isProUser, FREE_LIMIT_VALUE } from '@/lib/usageLimit'

interface Props {
  hasData: boolean
  onReset: () => void
  onUpgrade?: () => void
}

export default function Header({ hasData, onReset, onUpgrade }: Props) {
  const [usage, setUsage] = useState(0)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    setUsage(getUsage().count)
    setIsPro(isProUser())
  }, [])

  const remaining = FREE_LIMIT_VALUE - usage

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-slate-100 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3v18h18M7 16l4-5 3 3 5-7" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800 tracking-tight">FigureReady</p>
            <p className="text-[11px] text-slate-400 hidden sm:block">Publication-ready figures for Nature, JACS, and beyond</p>
          </div>
        </Link>
        <Link href="/roadmap" className="hidden sm:block text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Roadmap
        </Link>
        <Link href="/pricing" className="hidden sm:block text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Pricing
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Usage badge + upgrade button for free users */}
        {!isPro && (
          <div className="flex items-center gap-2">
            <span className={`hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full ${
              remaining <= 0
                ? 'bg-red-50 text-red-600'
                : remaining === 1
                ? 'bg-orange-50 text-orange-600'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {remaining <= 0 ? 'Limit reached' : `${remaining}/${FREE_LIMIT_VALUE} figures left`}
            </span>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade to Pro
            </button>
          </div>
        )}

        {isPro && (
          <span className="hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
            Pro
          </span>
        )}

        {hasData && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            New figure
          </button>
        )}
      </div>
    </header>
  )
}
