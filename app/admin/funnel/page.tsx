import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ── Auth guard ────────────────────────────────────────────────────────────────

async function getSession() {
  const token = cookies().get('fr_session')?.value
  if (!token) return null
  return verifySession(token)
}

// ── Queries ───────────────────────────────────────────────────────────────────

async function getStats(days: number) {
  const interval = `${days} days`

  const [rawCounts, rawDurations, rawAbandonTypes, rawPlanBreakdown, rawDeviceBreakdown] =
    await Promise.all([
      sql`
        SELECT event_name, COUNT(*)::int AS count
        FROM funnel_events
        WHERE created_at > now() - ${interval}::interval
        GROUP BY event_name
      `,
      sql`
        SELECT
          ROUND(AVG(duration_s))::int AS avg_s,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_s)::int AS median_s
        FROM funnel_events
        WHERE event_name IN ('checkout_abandoned', 'checkout_returned_without_purchase')
          AND duration_s IS NOT NULL
          AND created_at > now() - ${interval}::interval
      `,
      sql`
        SELECT abandon_type, COUNT(*)::int AS count
        FROM funnel_events
        WHERE event_name IN ('checkout_abandoned', 'checkout_returned_without_purchase')
          AND abandon_type IS NOT NULL
          AND created_at > now() - ${interval}::interval
        GROUP BY abandon_type
      `,
      sql`
        SELECT plan, event_name, COUNT(*)::int AS count
        FROM funnel_events
        WHERE event_name IN ('checkout_opened', 'purchase')
          AND plan IS NOT NULL
          AND created_at > now() - ${interval}::interval
        GROUP BY plan, event_name
      `,
      sql`
        SELECT device_type, event_name, COUNT(*)::int AS count
        FROM funnel_events
        WHERE event_name IN ('checkout_opened', 'purchase')
          AND device_type IS NOT NULL
          AND created_at > now() - ${interval}::interval
        GROUP BY device_type, event_name
      `,
    ])

  return {
    counts:          rawCounts         as Array<{ event_name: string; count: number }>,
    durations:       rawDurations      as Array<{ avg_s: number | null; median_s: number | null }>,
    abandonTypes:    rawAbandonTypes   as Array<{ abandon_type: string; count: number }>,
    planBreakdown:   rawPlanBreakdown  as Array<{ plan: string; event_name: string; count: number }>,
    deviceBreakdown: rawDeviceBreakdown as Array<{ device_type: string; event_name: string; count: number }>,
  }
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function find(arr: Array<{ event_name: string; count: number }>, name: string) {
  return arr.find(r => r.event_name === name)?.count ?? 0
}

function pct(num: number, den: number) {
  if (den === 0) return '—'
  return `${Math.round((num / den) * 100)}%`
}

function fmtDuration(s: number | null) {
  if (s === null || s === undefined) return '—'
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

// ── Components ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{children}</h2>
}

function Row({ label, a, b, rate }: { label: string; a: number; b: number; rate: string }) {
  return (
    <tr className="border-t border-slate-100">
      <td className="py-2.5 pr-6 text-sm font-medium text-slate-700 capitalize">{label}</td>
      <td className="py-2.5 pr-6 text-sm text-slate-600 text-right tabular-nums">{a}</td>
      <td className="py-2.5 pr-6 text-sm text-slate-600 text-right tabular-nums">{b}</td>
      <td className="py-2.5 text-sm font-semibold text-right tabular-nums"
          style={{ color: rate === '—' ? '#94a3b8' : parseInt(rate) >= 30 ? '#16a34a' : '#dc2626' }}>
        {rate}
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: { days?: string }
}

export default async function FunnelPage({ searchParams }: PageProps) {
  const session = await getSession()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!session || (adminEmail && session.email !== adminEmail)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Access denied.</p>
      </div>
    )
  }

  const days = Math.min(Math.max(parseInt(searchParams.days ?? '30') || 30, 1), 365)
  const { counts, durations, abandonTypes, planBreakdown, deviceBreakdown } = await getStats(days)

  const opened    = find(counts, 'checkout_opened')
  const purchased = find(counts, 'purchase')
  // Sum both names: new events use checkout_abandoned, historical data uses checkout_returned_without_purchase
  const returned  = find(counts, 'checkout_abandoned') + find(counts, 'checkout_returned_without_purchase')
  const convRate  = pct(purchased, opened)

  const dur = durations[0]

  // Abandonment types
  const immediate  = abandonTypes.find(r => r.abandon_type === 'immediate')?.count  ?? 0
  const normal     = abandonTypes.find(r => r.abandon_type === 'normal')?.count     ?? 0
  const highIntent = abandonTypes.find(r => r.abandon_type === 'high_intent')?.count ?? 0
  const totalAbandoned = immediate + normal + highIntent

  // Plan breakdown helpers
  function planCount(p: string, evt: string) {
    return planBreakdown.find(r => r.plan === p && r.event_name === evt)?.count ?? 0
  }

  // Device breakdown helpers
  function devCount(d: string, evt: string) {
    return deviceBreakdown.find(r => r.device_type === d && r.event_name === evt)?.count ?? 0
  }

  const dayOptions = [7, 30, 90]

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Checkout Funnel</h1>
            <p className="text-sm text-slate-400 mt-0.5">Last {days} days · {session.email}</p>
          </div>
          <div className="flex gap-2">
            {dayOptions.map(d => (
              <a
                key={d}
                href={`?days=${d}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  d === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {d}d
              </a>
            ))}
          </div>
        </div>

        {/* Top funnel */}
        <SectionHeading>Funnel Overview</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Checkout Opened"   value={opened}    />
          <StatCard label="Purchased"         value={purchased} sub={`${convRate} conversion`} />
          <StatCard label="Abandoned"         value={returned}  sub={`${pct(returned, opened)} of opened`} />
          <StatCard label="Conversion Rate"   value={convRate}  />
        </div>

        {/* Duration */}
        <SectionHeading>Checkout Duration (abandoned)</SectionHeading>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard label="Average duration"  value={fmtDuration(dur?.avg_s    ?? null)} />
          <StatCard label="Median duration"   value={fmtDuration(dur?.median_s ?? null)} />
        </div>

        {/* Abandonment classification */}
        <SectionHeading>Abandonment Type</SectionHeading>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-8">
          {totalAbandoned === 0 ? (
            <p className="text-sm text-slate-400">No abandonment data yet.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Immediate  (<10s)',   count: immediate,  desc: 'Bounced immediately — Polar may look untrustworthy or price was a shock' },
                { label: 'Normal  (10 – 60s)',  count: normal,     desc: 'Browsed the checkout page but did not complete' },
                { label: 'High intent  (>60s)', count: highIntent, desc: 'Spent significant time — payment friction or indecision' },
              ].map(({ label, count, desc }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <span className="text-sm tabular-nums text-slate-600">
                      {count} · {pct(count, totalAbandoned)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: totalAbandoned > 0 ? `${(count / totalAbandoned) * 100}%` : '0%' }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan breakdown */}
        <SectionHeading>Monthly vs Yearly</SectionHeading>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="py-2.5 pr-6 text-left text-xs font-semibold text-slate-500 pl-5">Plan</th>
                <th className="py-2.5 pr-6 text-right text-xs font-semibold text-slate-500">Opened</th>
                <th className="py-2.5 pr-6 text-right text-xs font-semibold text-slate-500">Purchased</th>
                <th className="py-2.5 pr-5 text-right text-xs font-semibold text-slate-500">Conv. rate</th>
              </tr>
            </thead>
            <tbody className="pl-5">
              {['monthly', 'yearly'].map(plan => {
                const o = planCount(plan, 'checkout_opened')
                const p = planCount(plan, 'purchase')
                return (
                  <tr key={plan} className="border-t border-slate-100">
                    <td className="py-2.5 pr-6 pl-5 text-sm font-medium text-slate-700 capitalize">{plan}</td>
                    <td className="py-2.5 pr-6 text-sm text-slate-600 text-right tabular-nums">{o}</td>
                    <td className="py-2.5 pr-6 text-sm text-slate-600 text-right tabular-nums">{p}</td>
                    <td className="py-2.5 pr-5 text-sm font-semibold text-right tabular-nums"
                        style={{ color: o === 0 ? '#94a3b8' : Math.round(p/o*100) >= 30 ? '#16a34a' : '#dc2626' }}>
                      {pct(p, o)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Device breakdown */}
        <SectionHeading>Desktop vs Mobile</SectionHeading>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-10">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="py-2.5 pr-6 text-left text-xs font-semibold text-slate-500 pl-5">Device</th>
                <th className="py-2.5 pr-6 text-right text-xs font-semibold text-slate-500">Opened</th>
                <th className="py-2.5 pr-6 text-right text-xs font-semibold text-slate-500">Purchased</th>
                <th className="py-2.5 pr-5 text-right text-xs font-semibold text-slate-500">Conv. rate</th>
              </tr>
            </thead>
            <tbody>
              {['desktop', 'mobile'].map(device => {
                const o = devCount(device, 'checkout_opened')
                const p = devCount(device, 'purchase')
                return (
                  <tr key={device} className="border-t border-slate-100">
                    <td className="py-2.5 pr-6 pl-5 text-sm font-medium text-slate-700 capitalize">{device}</td>
                    <td className="py-2.5 pr-6 text-sm text-slate-600 text-right tabular-nums">{o}</td>
                    <td className="py-2.5 pr-6 text-sm text-slate-600 text-right tabular-nums">{p}</td>
                    <td className="py-2.5 pr-5 text-sm font-semibold text-right tabular-nums"
                        style={{ color: o === 0 ? '#94a3b8' : Math.round(p/o*100) >= 30 ? '#16a34a' : '#dc2626' }}>
                      {pct(p, o)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-center text-slate-300">
          Data from <code className="font-mono">funnel_events</code> table · refreshes on each load
        </p>

      </div>
    </div>
  )
}
