'use client'
import { useEffect, useRef, useState } from 'react'
import { saveEmail } from '@/lib/emailGate'

interface Props {
  onConfirm: () => void
  onClose: () => void
  title?: string
  description?: string
  cta?: string
  source?: string
}

export default function EmailGateModal({ onConfirm, onClose, title, description, cta, source }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: source ?? 'gate' }),
      })
    } catch {}
    saveEmail(trimmed)
    onConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-8">
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 16.5V3" />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 text-center mb-1">
          {title ?? 'Download your figure'}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
          {description ?? 'Enter your email to receive FigureReady updates.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? 'Loading…' : (cta ?? 'Download')}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-400 text-center">
          No spam. FigureReady updates only.
        </p>
      </div>
    </div>
  )
}
