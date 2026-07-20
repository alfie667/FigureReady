'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { activatePro } from '@/lib/usageLimit'

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

export default function SuccessPage() {
  useEffect(() => {
    activatePro()
    window.fbq?.('track', 'Purchase', { value: 12, currency: 'EUR' })
  }, [])

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans antialiased flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">FigureReady</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

          {/* Checkmark */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
            Welcome to FigureReady Pro!
          </h1>
          <p className="text-slate-500 text-sm mb-2">
            Your payment was successful.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            You now have unlimited access to all features.
          </p>

          <a
            href="https://figureready.com/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm"
          >
            Go back to the app â†’
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-400">
          FigureReady â€” 2026
        </div>
      </footer>

    </div>
  )
}

