'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const SAMPLE_DATA = [
  { conc: 0.1,  abs: 0.02 },
  { conc: 0.3,  abs: 0.07 },
  { conc: 1,    abs: 0.19 },
  { conc: 3,    abs: 0.50 },
  { conc: 10,   abs: 0.82 },
  { conc: 30,   abs: 0.94 },
  { conc: 100,  abs: 0.99 },
]

type Phase = 'table' | 'loading' | 'chart'

export default function InteractiveDemo() {
  const [phase, setPhase] = useState<Phase>('table')

  function handleGenerate() {
    setPhase('loading')
    setTimeout(() => setPhase('chart'), 900)
  }

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-2xl bg-white">

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

      {/* Content area */}
      <div className="px-6 py-8 min-h-[420px] flex items-center justify-center">

        {/* ── Step 1 : Table ── */}
        {phase === 'table' && (
          <div className="flex flex-col items-center gap-6 w-full">
            <p className="text-sm text-slate-500 font-medium text-center">
              Colonnes détectées — choisissez X et Y :
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
                    <th className="px-4 py-2 text-left bg-blue-50 border-r border-slate-200 border-b border-slate-200">
                      <span className="text-blue-600 font-bold">Conc. (µM)</span>
                      <span className="ml-2 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">X</span>
                    </th>
                    <th className="px-4 py-2 text-right bg-emerald-50 border-b border-slate-200">
                      <span className="text-emerald-700 font-bold">Absorbance</span>
                      <span className="ml-2 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">Y</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_DATA.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-1.5 text-slate-500 border-r border-slate-100 bg-blue-50/20">{row.conc}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-slate-700 bg-emerald-50/20">{row.abs.toFixed(2)}</td>
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

        {/* ── Step 2 : Loading ── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-slate-100 border-t-slate-800 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Generating your figure...</p>
          </div>
        )}

        {/* ── Step 3 : Chart ── */}
        {phase === 'chart' && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Publication-ready figure</span>
            </div>

            <div className="w-full bg-white rounded-xl border border-slate-100 p-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={SAMPLE_DATA} margin={{ top: 8, right: 16, left: 8, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="conc"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: 'Concentration (µM)', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#475569' }}
                  />
                  <YAxis
                    domain={[0, 1.05]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: 'Absorbance', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#475569' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="abs"
                    stroke="#1D6F42"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#1D6F42', strokeWidth: 0 }}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-3">
              <button
                className="px-5 py-2 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: '#1D6F42' }}
              >
                ⬇ PNG 300 DPI
              </button>
              <button className="px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:border-slate-300 transition-colors">
                ⬇ SVG
              </button>
            </div>

            <button
              onClick={() => setPhase('table')}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Reset demo
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
