'use client'

import { useEffect, useRef, useState } from 'react'
import { parseMolecularFormula, type ParseSuccess } from '@/lib/molecularParser'
import {
  trackResearchToolViewed,
  trackResearchToolUsed,
  trackResearchToolToEditor,
} from '@/lib/analytics'

const TOOL_ID = 'molecular_weight_calculator'

const EXAMPLES = ['H2O', 'NaCl', 'Ca(OH)2', 'C6H12O6', 'CuSO4·5H2O', 'MgSO4.7H2O']

export default function MolecularWeightCalculator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParseSuccess | null>(null)
  const [error, setError] = useState<string | null>(null)
  const viewedRef = useRef(false)

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true
      trackResearchToolViewed(TOOL_ID)
    }
  }, [])

  function calculate(formula: string) {
    const f = formula.trim()
    if (!f) { setResult(null); setError(null); return }
    const r = parseMolecularFormula(f)
    if (r.ok) {
      setResult(r)
      setError(null)
      trackResearchToolUsed(TOOL_ID)
    } else {
      setResult(null)
      setError(r.error)
    }
  }

  function handleExample(ex: string) {
    setInput(ex)
    calculate(ex)
  }

  return (
    <div>
      {/* ── Input ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label htmlFor="formula-input" className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
            Chemical formula
          </label>
          <input
            id="formula-input"
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); setError(null) }}
            onKeyDown={e => { if (e.key === 'Enter') calculate(input) }}
            placeholder="e.g. C8H10N4O2"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base font-mono
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-slate-300 bg-white"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => calculate(input)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* ── Examples ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-slate-600">Examples:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => handleExample(ex)}
            className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200
                       text-slate-600 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="space-y-4">

          {/* Molar mass headline */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <span className="text-sm font-medium text-blue-700">Molar mass</span>
              <span className="text-2xl font-bold text-blue-900 font-mono tabular-nums">
                {result.molarMass.toFixed(3)}&thinsp;g/mol
              </span>
            </div>
            {result.elements.some(e => e.radioactive) && (
              <p className="mt-2 text-xs text-amber-700">
                Contains radioactive element(s) — mass based on most stable isotope.
              </p>
            )}
          </div>

          {/* Composition table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Element</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Atoms</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Atomic mass</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Contribution</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Mass %</th>
                </tr>
              </thead>
              <tbody>
                {result.elements.map(el => (
                  <tr key={el.symbol} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-slate-900">{el.symbol}</span>
                      <span className="ml-2 text-slate-400 text-xs">{el.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700">{el.count}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-500">{el.atomicMass}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700">{el.contribution.toFixed(3)}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-500">{el.massFraction.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="px-4 py-2.5 font-semibold text-slate-700" colSpan={3}>Total</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono tabular-nums text-slate-900">
                    {result.molarMass.toFixed(3)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-500">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── CTA to FigureReady ── */}
      <div className="mt-10 pt-8 border-t border-slate-100">
        <p className="text-sm font-semibold text-slate-800 mb-1">Working with experimental data?</p>
        <p className="text-sm text-slate-700 mb-3">
          Create publication-ready scientific figures from Excel or CSV with FigureReady.
        </p>
        <a
          href="/app"
          onClick={() => trackResearchToolToEditor(TOOL_ID)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Create a scientific figure
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}
