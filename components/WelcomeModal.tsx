'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'figureready-welcomed'

export default function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#7c3aed] flex items-center justify-center mb-5 shrink-0">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to FigureReady</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-1">
          This is an early prototype created to simplify publication figure preparation.
        </p>
        <p className="text-sm text-slate-500 leading-relaxed mb-7">
          Upload an Excel file, configure your axes, and export a publication-ready figure in seconds — no Origin or Prism required.
        </p>

        <button
          onClick={dismiss}
          className="w-full py-3 px-6 bg-[#7c3aed] hover:bg-[#5b21b6] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Start Exploring
        </button>

        <p className="mt-4 text-xs text-slate-400">
          Your feedback helps shape this tool —{' '}
          <a href="mailto:zeggai_nouh@hotmail.fr" className="underline hover:text-slate-600">send a note</a>
        </p>
      </div>
    </div>
  )
}
