'use client'

import { useState } from 'react'
import { gtagEvent } from '@/lib/ga'

// ── Chart math (computed once at module level) ───────────────────────────────

const W = 520, H = 340
const PAD = { top: 20, right: 24, bottom: 56, left: 66 }
const PW = W - PAD.left - PAD.right   // 430
const PH = H - PAD.top - PAD.bottom   // 264

const X_LOG_MIN = Math.log10(0.07)
const X_LOG_MAX = Math.log10(130)

function toX(x: number) {
  return PAD.left + (Math.log10(x) - X_LOG_MIN) / (X_LOG_MAX - X_LOG_MIN) * PW
}
function toY(y: number) {
  return PAD.top + PH * (1 - y)
}
function hill(x: number) { return x / (3 + x) }

const CURVE_PATH = Array.from({ length: 80 }, (_, i) => {
  const logX = X_LOG_MIN + (X_LOG_MAX - X_LOG_MIN) * i / 79
  const x = Math.pow(10, logX)
  return `${i === 0 ? 'M' : 'L'}${toX(x).toFixed(1)},${toY(hill(x)).toFixed(1)}`
}).join(' ')

const DATA = [
  { x: 0.1, y: 0.02 }, { x: 0.3, y: 0.07 }, { x: 1, y: 0.19 },
  { x: 3, y: 0.50 }, { x: 10, y: 0.82 }, { x: 30, y: 0.94 }, { x: 100, y: 0.99 },
]

const X_MAJOR = [0.1, 1, 10, 100]
const X_MINOR = [-1, 0, 1, 2].flatMap(d =>
  [2, 3, 4, 5, 6, 7, 8, 9].map(m => m * Math.pow(10, d))
).filter(v => v > 0.07 && v < 130 && !X_MAJOR.includes(v))

const Y_MAJOR = [0, 0.25, 0.50, 0.75, 1.00]

// ── Publication-quality SVG chart ────────────────────────────────────────────

function PublicationChart({ animate }: { animate: boolean }) {
  const cy = PAD.top + PH / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Smooth sigmoid curve — draws itself via strokeDashoffset animation */}
      <path
        d={CURVE_PATH}
        fill="none"
        stroke="#111111"
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={animate ? 0 : 1}
        style={{ transition: animate ? 'stroke-dashoffset 1.2s ease-out' : 'none' }}
      />

      {/* Data points — open circles, fade in after curve */}
      {DATA.map((d, i) => (
        <circle
          key={i}
          cx={toX(d.x)} cy={toY(d.y)} r={4.5}
          fill="white" stroke="#e02020" strokeWidth={2}
          style={{
            opacity: animate ? 1 : 0,
            transition: animate ? `opacity 0.2s ease ${0.85 + i * 0.07}s` : 'none',
          }}
        />
      ))}

      {/* L-shaped axes */}
      <line x1={PAD.left} y1={PAD.top + PH} x2={PAD.left + PW} y2={PAD.top + PH} stroke="#111" strokeWidth={1.5} />
      <line x1={PAD.left} y1={PAD.top}       x2={PAD.left}      y2={PAD.top + PH} stroke="#111" strokeWidth={1.5} />

      {/* X major ticks + labels */}
      {X_MAJOR.map(x => (
        <g key={x}>
          <line x1={toX(x)} y1={PAD.top + PH} x2={toX(x)} y2={PAD.top + PH + 6} stroke="#111" strokeWidth={1.3} />
          <text x={toX(x)} y={PAD.top + PH + 17} textAnchor="middle" fontSize={9} fill="#444">{x}</text>
        </g>
      ))}

      {/* X minor ticks (log scale) */}
      {X_MINOR.map((x, i) => (
        <line key={i}
          x1={toX(x)} y1={PAD.top + PH}
          x2={toX(x)} y2={PAD.top + PH + 3}
          stroke="#666" strokeWidth={0.8}
        />
      ))}

      {/* Y major ticks + labels */}
      {Y_MAJOR.map(y => (
        <g key={y}>
          <line x1={PAD.left - 6} y1={toY(y)} x2={PAD.left} y2={toY(y)} stroke="#111" strokeWidth={1.3} />
          <text x={PAD.left - 10} y={toY(y) + 3.5} textAnchor="end" fontSize={9} fill="#444">
            {y.toFixed(2)}
          </text>
        </g>
      ))}

      {/* Axis labels — italic, like Nature/ACS */}
      <text x={PAD.left + PW / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="#333" fontStyle="normal">
        Concentration (µM)
      </text>
      <text
        x={13} y={cy}
        textAnchor="middle" fontSize={11} fill="#333" fontStyle="normal"
        transform={`rotate(-90, 13, ${cy})`}
      >
        Absorbance (AU)
      </text>
    </svg>
  )
}

// ── Demo component ───────────────────────────────────────────────────────────

const TABLE_DATA = [
  { x: 0.1, y: '0.02' }, { x: 0.3, y: '0.07' }, { x: 1, y: '0.19' },
  { x: 3, y: '0.50' }, { x: 10, y: '0.82' }, { x: 30, y: '0.94' }, { x: 100, y: '0.99' },
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
              <div className="bg-[#1D6F42] px-4 py-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 1.5L18.5 9H13zM8.5 17l2-3-2-3h1.6l1.2 2 1.2-2H14l-2 3 2 3h-1.6l-1.2-2-1.2 2z" />
                </svg>
                <span className="text-white text-xs font-semibold">experiment.xlsx</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left bg-[#e8f5ee] border-r border-slate-200 border-b border-slate-200">
                      <span className="text-[#1D6F42] font-bold">Conc. (µM)</span>
                      <span className="ml-2 text-[9px] bg-[#1D6F42] text-white px-1.5 py-0.5 rounded-full font-bold">X</span>
                    </th>
                    <th className="px-4 py-2 text-right bg-emerald-50 border-b border-slate-200">
                      <span className="text-emerald-700 font-bold">Absorbance</span>
                      <span className="ml-2 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">Y</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_DATA.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-1.5 text-slate-500 border-r border-slate-100 bg-[#e8f5ee]/20">{row.x}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-slate-700 bg-emerald-50/20">{row.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleGenerate}
              className="px-8 py-3 rounded-full text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
              style={{ background: '#1D6F42' }}
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
              style={{ background: '#1D6F42' }}
              onClick={() => gtagEvent('cta_click', { location: 'demo' })}
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
