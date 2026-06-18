'use client'
import { useState } from 'react'

// TODO: Replace with your Tally form ID — create a free form at tally.so
// then replace TALLY_FORM_ID below (e.g. "wbDkQM")
const TALLY_FORM_URL = 'https://tally.so/r/TALLY_FORM_ID'

export default function BetaSignupForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const url = email
      ? `${TALLY_FORM_URL}?email=${encodeURIComponent(email)}`
      : TALLY_FORM_URL
    window.open(url, '_blank')
    setSent(true)
    setEmail('')
  }

  if (sent) {
    return (
      <p className="text-sm text-blue-600 font-medium">
        Thanks! Check the form that just opened to confirm your email.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shadow-sm"
      >
        Get early access
      </button>
    </form>
  )
}
