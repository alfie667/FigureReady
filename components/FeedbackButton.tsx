'use client'
import { useState } from 'react'
import { saveFeedback } from '@/lib/feedback'
import { trackFeedback } from '@/lib/analytics'

const empty = { liked: '', frustrated: '', missing: '', email: '' }

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    saveFeedback(form)
    trackFeedback()
    setSubmitted(true)
    setTimeout(() => { setOpen(false); setSubmitted(false); setForm(empty) }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full shadow-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-xl transition-all"
      >
        <svg className="w-4 h-4 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Send Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">Send Feedback</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {submitted ? (
              <div className="py-10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">Thank you for your feedback!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Field
                  label="What did you like?"
                  value={form.liked}
                  onChange={(v) => setForm({ ...form, liked: v })}
                  placeholder="e.g. Fast, clean output…"
                />
                <Field
                  label="What frustrated you?"
                  value={form.frustrated}
                  onChange={(v) => setForm({ ...form, frustrated: v })}
                  placeholder="e.g. Hard to find the export button…"
                />
                <Field
                  label="What feature is missing?"
                  value={form.missing}
                  onChange={(v) => setForm({ ...form, missing: v })}
                  placeholder="e.g. LaTeX axis labels, PDF export…"
                />
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>
                <button
                  onClick={submit}
                  disabled={!form.liked && !form.frustrated && !form.missing}
                  className="w-full mt-2 py-2.5 bg-[#7c3aed] hover:bg-[#5b21b6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
      />
    </div>
  )
}
