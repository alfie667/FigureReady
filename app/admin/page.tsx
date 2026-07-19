'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAnalytics, type AnalyticsData } from '@/lib/analytics'
import { getFeedbackEntries, type FeedbackEntry } from '@/lib/feedback'
import { getEmailEntries, type EmailEntry } from '@/lib/emailGate'

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [emails, setEmails] = useState<EmailEntry[]>([])

  useEffect(() => {
    setAnalytics(getAnalytics())
    setFeedback(getFeedbackEntries())
    setEmails(getEmailEntries())
  }, [])

  const exportEmailsCSV = () => {
    const rows = ['email,date', ...emails.map(e => `${e.email},${new Date(e.capturedAt).toLocaleString()}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'figureready-emails.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = analytics
    ? [
        { label: 'Uploads', value: analytics.uploads },
        { label: 'Charts created', value: analytics.chartsCreated },
        { label: 'Exports', value: analytics.exports },
        { label: 'Feedback submissions', value: analytics.feedbackSubmissions },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">FigureReady</span>
          </Link>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Admin — local data only</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Analytics</h1>
        <p className="text-sm text-slate-400 mb-8">Data is stored locally in your browser (localStorage). Visible only to you.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
          {!analytics && (
            <div className="col-span-4 text-center text-sm text-slate-400 py-8">No data yet.</div>
          )}
        </div>

        {/* Last updated */}
        {analytics?.lastUpdated && (
          <p className="text-xs text-slate-400 -mt-8 mb-10">
            Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
          </p>
        )}

        {/* Emails */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Collected emails ({emails.length})</h2>
          {emails.length > 0 && (
            <button
              onClick={exportEmailsCSV}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Export CSV
            </button>
          )}
        </div>
        {emails.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400 mb-12">
            No emails collected yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...emails].reverse().map((entry, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <a href={`mailto:${entry.email}`} className="text-blue-600 hover:underline">{entry.email}</a>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{new Date(entry.capturedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Feedback */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Feedback entries ({feedback.length})</h2>
        {feedback.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
            No feedback submitted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {[...feedback].reverse().map(entry => (
              <div key={entry.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                  {entry.email && (
                    <a href={`mailto:${entry.email}`} className="text-xs text-blue-500 hover:underline">{entry.email}</a>
                  )}
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {entry.liked && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-green-600 font-semibold mb-1">Liked</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.liked}</p>
                    </div>
                  )}
                  {entry.frustrated && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-red-500 font-semibold mb-1">Frustrated by</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.frustrated}</p>
                    </div>
                  )}
                  {entry.missing && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-blue-500 font-semibold mb-1">Missing</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.missing}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
