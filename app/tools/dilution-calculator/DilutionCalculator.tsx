'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  calcDilution,
  ALL_CONC_UNITS, VOL_UNITS,
  type ConcUnit, type VolUnit, type SolveFor, type DilutionResult,
} from '@/lib/dilutionCalc'
import { trackResearchToolViewed, trackResearchToolUsed, trackResearchToolToEditor } from '@/lib/analytics'

const TOOL_ID = 'dilution_calculator'

const SOLVE_BUTTONS: { id: SolveFor; label: string }[] = [
  { id: 'C1', label: 'C1 — Stock conc.' },
  { id: 'V1', label: 'V1 — Stock vol.' },
  { id: 'C2', label: 'C2 — Final conc.' },
  { id: 'V2', label: 'V2 — Final vol.' },
]

const ROW_LABELS: Record<SolveFor, string> = {
  C1: 'Stock concentration (C1)',
  V1: 'Stock volume (V1)',
  C2: 'Final concentration (C2)',
  V2: 'Final volume (V2)',
}

export default function DilutionCalculator() {
  const viewedRef = useRef(false)
  const [solveFor, setSolveFor] = useState<SolveFor>('V1')

  const [C1, setC1]         = useState('')
  const [C1Unit, setC1Unit] = useState<ConcUnit>('M')
  const [V1, setV1]         = useState('')
  const [V1Unit, setV1Unit] = useState<VolUnit>('mL')
  const [C2, setC2]         = useState('')
  const [C2Unit, setC2Unit] = useState<ConcUnit>('mM')
  const [V2, setV2]         = useState('')
  const [V2Unit, setV2Unit] = useState<VolUnit>('mL')

  const [result, setResult] = useState<DilutionResult | null>(null)

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true
      trackResearchToolViewed(TOOL_ID)
    }
  }, [])

  function calculate() {
    const r = calcDilution({
      solveFor,
      C1: parseFloat(C1), C1Unit,
      V1: parseFloat(V1), V1Unit,
      C2: parseFloat(C2), C2Unit,
      V2: parseFloat(V2), V2Unit,
    })
    setResult(r)
    if (r.ok) trackResearchToolUsed(TOOL_ID)
  }

  function clear() { setResult(null) }

  function switchSolveFor(s: SolveFor) {
    setSolveFor(s)
    clear()
  }

  return (
    <div>
      {/* ── Solve for ── */}
      <div className="mb-7">
        <p className="text-xs font-medium text-slate-700 uppercase tracking-wide mb-2.5">Solve for</p>
        <div className="flex flex-wrap gap-2">
          {SOLVE_BUTTONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => switchSolveFor(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                solveFor === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Rows ── */}
      <form onSubmit={e => { e.preventDefault(); calculate() }} className="space-y-4 mb-5">

        <InputRow
          label={ROW_LABELS.C1}
          value={C1} onChange={v => { setC1(v); clear() }}
          unit={C1Unit} units={ALL_CONC_UNITS} onUnitChange={u => { setC1Unit(u as ConcUnit); clear() }}
          disabled={solveFor === 'C1'}
        />

        <InputRow
          label={ROW_LABELS.V1}
          value={V1} onChange={v => { setV1(v); clear() }}
          unit={V1Unit} units={VOL_UNITS} onUnitChange={u => { setV1Unit(u as VolUnit); clear() }}
          disabled={solveFor === 'V1'}
        />

        <InputRow
          label={ROW_LABELS.C2}
          value={C2} onChange={v => { setC2(v); clear() }}
          unit={C2Unit} units={ALL_CONC_UNITS} onUnitChange={u => { setC2Unit(u as ConcUnit); clear() }}
          disabled={solveFor === 'C2'}
        />

        <InputRow
          label={ROW_LABELS.V2}
          value={V2} onChange={v => { setV2(v); clear() }}
          unit={V2Unit} units={VOL_UNITS} onUnitChange={u => { setV2Unit(u as VolUnit); clear() }}
          disabled={solveFor === 'V2'}
        />

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Calculate
        </button>
      </form>

      {/* ── Error ── */}
      {result && !result.ok && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          {result.error}
        </div>
      )}

      {/* ── Result ── */}
      {result && result.ok && (
        <div className="space-y-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <span className="text-sm font-medium text-blue-700">{ROW_LABELS[solveFor]}</span>
              <span className="text-2xl font-bold text-blue-900 font-mono tabular-nums">
                {result.display}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 leading-relaxed">
            {result.instruction}
          </p>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="mt-10 pt-8 border-t border-slate-100">
        <p className="text-xs text-slate-600 mb-5">
          Need to calculate your stock concentration first?{' '}
          <Link href="/tools/molarity-calculator" className="text-blue-600 hover:text-blue-700 underline">
            Molarity Calculator →
          </Link>
        </p>
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

// ── InputRow ──────────────────────────────────────────────────────────────────

interface InputRowProps {
  label:        string
  value:        string
  onChange:     (v: string) => void
  unit:         string
  units:        readonly string[]
  onUnitChange: (u: string) => void
  disabled:     boolean
}

function InputRow({ label, value, onChange, unit, units, onUnitChange, disabled }: InputRowProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
        {label}
        {disabled && (
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            solving
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={disabled ? '' : value}
          onChange={disabled ? undefined : e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? '?' : ''}
          min="0"
          step="any"
          className={`flex-1 border rounded-lg px-4 py-3 text-base font-mono
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${disabled
                        ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed placeholder:text-slate-300'
                        : 'bg-white border-slate-300 placeholder:text-slate-300'
                      }`}
        />
        <select
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-3 text-sm font-semibold bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-slate-700 cursor-pointer"
        >
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  )
}
