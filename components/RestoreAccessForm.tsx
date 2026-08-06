'use client'
import { useState } from 'react'

interface Props {
  compact?: boolean   // horizontal layout for inline use
  onSent?: () => void
}

export default function RestoreAccessForm({ compact = false, onSent }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || state === 'loading') return
    setState('loading')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json() as { error?: string }
      if (res.status === 429) {
        setErrorMsg(data.error ?? 'Too many requests. Please wait 15 minutes.')
        setState('error')
        return
      }
      if (!res.ok) {
        setErrorMsg('Something went wrong. Please try again.')
        setState('error')
        return
      }
      setState('sent')
      onSent?.()
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className={`text-center ${compact ? 'py-2' : 'py-4'}`}>
        <p className="text-sm font-semibold text-slate-800 mb-1">Check your inbox</p>
        <p className="text-xs text-slate-500">
          We sent a sign-in link to{' '}
          <span className="font-medium text-slate-700">{email}</span>.
          {' '}It expires in 15 minutes.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'flex gap-2 items-center' : 'space-y-3'}>
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={e => {
          setEmail(e.target.value)
          if (state === 'error') setState('idle')
        }}
        disabled={state === 'loading'}
        className={[
          compact ? 'flex-1 min-w-0' : 'w-full',
          'border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-60',
        ].join(' ')}
      />
      <button
        type="submit"
        disabled={state === 'loading' || !email.trim()}
        className={[
          compact ? 'shrink-0' : 'w-full',
          'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl',
          'transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        {state === 'loading' ? 'Sending…' : 'Send link'}
      </button>
      {state === 'error' && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </form>
  )
}
