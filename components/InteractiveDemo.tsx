'use client'

import { useState } from 'react'
import { gtagEvent } from '@/lib/ga'
import { trackUploadCtaClick } from '@/lib/analytics'

// ── Chart geometry ───────────────────────────────────────────────────────────

const W = 520, H = 340
const PAD = { top: 24, right: 30, bottom: 64, left: 70 }
const PW = W - PAD.left - PAD.right   // 420
const PH = H - PAD.top - PAD.bottom   // 252
const Y_MAX = 10
const Y_MAJOR = [0, 2, 4, 6, 8, 10]

function toY(y: number) {
  return PAD.top + PH * (1 - y / Y_MAX)
}

const BAR_DATA = [
  { label: 'HeLa',   mean: 4.2, sd: 0.38, color: '#3b82f6' },
  { label: 'MCF-7',  mean: 6.8, sd: 0.55, color: '#ef4444' },
  { label: 'HEK293', mean: 2.9, sd: 0.28, color: '#10b981' },
  { label: 'A549',   mean: 8.5, sd: 0.62, color: '#f59e0b' },
  { label: 'PC-3',   mean: 5.1, sd: 0.44, color: '#8b5cf6' },
]

const GROUP_W = PW / BAR_DATA.length  // 84
const BAR_W = 50

// ── Publication-quality bar chart ────────────────────────────────────────────

function PublicationChart({ animate }: { animate: boolean }) {
  const baseY = PAD.top + PH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Horizontal grid lines */}
      {Y_MAJOR.filter(y => y > 0).map(y => (
        <line key={y}
          x1={PAD.left} y1={toY(y)}
          x2={PAD.left + PW} y2={toY(y)}
          stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3,3"
        />
      ))}

      {/* Bars + error bars */}
      {BAR_DATA.map((d, i) => {
        const cx = PAD.left + (i + 0.5) * GROUP_W
        const barH = PH * d.mean / Y_MAX
        const delay = i * 0.09

        return (
          <g key={i}>
            {/* Bar — grows from bottom */}
            <rect
              x={cx - BAR_W / 2}
              y={baseY - barH}
              width={BAR_W}
              height={barH}
              fill={d.color}
              rx={4}
              style={{
                transformOrigin: `${cx}px ${baseY}px`,
                transform: animate ? 'scaleY(1)' : 'scaleY(0)',
                transition: animate
                  ? `transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) ${delay}s`
                  : 'none',
              }}
            />

            {/* Error bar — fades in after bar */}
            <g style={{
              opacity: animate ? 1 : 0,
              transition: animate ? `opacity 0.25s ease ${0.55 + delay}s` : 'none',
            }}>
              <line
                x1={cx} y1={toY(d.mean + d.sd)}
                x2={cx} y2={toY(d.mean - d.sd)}
                stroke="#1a1a1a" strokeWidth={1.8}
              />
              <line x1={cx - 6} y1={toY(d.mean + d.sd)} x2={cx + 6} y2={toY(d.mean + d.sd)}
                stroke="#1a1a1a" strokeWidth={1.8} />
              <line x1={cx - 6} y1={toY(d.mean - d.sd)} x2={cx + 6} y2={toY(d.mean - d.sd)}
                stroke="#1a1a1a" strokeWidth={1.8} />
            </g>
          </g>
        )
      })}

      {/* Axes */}
      <line x1={PAD.left} y1={baseY} x2={PAD.left + PW} y2={baseY} stroke="#111" strokeWidth={1.5} />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={baseY} stroke="#111" strokeWidth={1.5} />

      {/* X labels */}
      {BAR_DATA.map((d, i) => {
        const cx = PAD.left + (i + 0.5) * GROUP_W
        return (
          <text key={i} x={cx} y={baseY + 16} textAnchor="middle" fontSize={9.5} fill="#333" fontWeight="600">
            {d.label}
          </text>
        )
      })}

      {/* Y ticks + labels */}
      {Y_MAJOR.map(y => (
        <g key={y}>
          <line x1={PAD.left - 5} y1={toY(y)} x2={PAD.left} y2={toY(y)} stroke="#111" strokeWidth={1.3} />
          <text x={PAD.left - 9} y={toY(y) + 3.5} textAnchor="end" fontSize={9} fill="#444">{y}</text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={PAD.left + PW / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#333">
        Cell Line
      </text>
      <text
        x={13} y={PAD.top + PH / 2}
        textAnchor="middle" fontSize={11} fill="#333"
        transform={`rotate(-90, 13, ${PAD.top + PH / 2})`}
      >
        mRNA Expression (AU)
      </text>
    </svg>
  )
}

// ── Demo component ───────────────────────────────────────────────────────────

const TABLE_DATA = [
  { sample: 'HeLa',   value: '4.2 ± 0.4' },
  { sample: 'MCF-7',  value: '6.8 ± 0.6' },
  { sample: 'HEK293', value: '2.9 ± 0.3' },
  { sample: 'A549',   value: '8.5 ± 0.6' },
  { sample: 'PC-3',   value: '5.1 ± 0.4' },
]

type Phase = 'table' | 'loading' | 'chart'

export default function InteractiveDemo() {
  const [phase, setPhase] = useState<Phase>('table')
  const [animate, setAnimate] = useState(false)

  function handleGenerate() {
    gtagEvent('demo_generate')
    setPhase('loading')
    setTimeout(() => {
      setPhase('chart')
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    }, 900)
  }

  function handleReset() {
    setAnimate(false)
    setPhase('table')
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-2xl bg-white">

      {/* Browser chrome */}
      <div className="bg-[#efefef] border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] block" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] block" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] block" />
        </div>
        <div className="flex-1 bg-white rounded border border-slate-200 px-3 py-0.5 text-[11px] text-slate-400 font-mono truncate">
          figureready.com/app
        </div>
      </div>

      <div className="px-6 py-8 min-h-[420px] flex items-center justify-center">

        {phase === 'table' && (
          <div className="flex flex-col items-center gap-6 w-full">
            <p className="text-sm text-slate-500 font-medium text-center">
              Your Excel file — select columns X and Y:
            </p>
            <div className="rounded-xl overflow-hidden border border-slate-200 w-full max-w-xs shadow-sm">
              <div className="bg-[#2563eb] px-4 py-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 1.5L18.5 9H13zM8.5 17l2-3-2-3h1.6l1.2 2 1.2-2H14l-2 3 2 3h-1.6l-1.2-2-1.2 2z" />
                </svg>
                <span className="text-white text-xs font-semibold">expression_data.xlsx</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left bg-[#dbeafe] border-r border-slate-200 border-b border-slate-200">
                      <span className="text-[#2563eb] font-bold">Cell Line</span>
                      <span className="ml-2 text-[9px] bg-[#2563eb] text-white px-1.5 py-0.5 rounded-full font-bold">X</span>
                    </th>
                    <th className="px-4 py-2 text-right bg-emerald-50 border-b border-slate-200">
                      <span className="text-emerald-700 font-bold">Expression</span>
                      <span className="ml-2 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">Y</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_DATA.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-1.5 text-slate-600 border-r border-slate-100 bg-[#dbeafe]/20 font-semibold">{row.sample}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-slate-700 bg-emerald-50/20">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleGenerate}
              className="px-8 py-3 rounded-full text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
              style={{ background: '#2563eb' }}
            >
              Generate figure →
            </button>
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-slate-100 border-t-slate-800 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Generating your figure...</p>
          </div>
        )}

        {phase === 'chart' && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Publication-ready figure</span>
            </div>
            <div className="w-full bg-white rounded-xl border border-slate-100 p-3">
              <PublicationChart animate={animate} />
            </div>
            <a
              href="/app"
              className="px-8 py-3 rounded-full text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
              style={{ background: '#2563eb' }}
              onClick={() => trackUploadCtaClick('demo')}
            >
              Try with your own Excel file →
            </a>
            <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Reset demo
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
