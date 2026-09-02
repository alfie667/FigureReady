'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  calcMolarity,
  AMOUNT_UNITS, MASS_UNITS, VOLUME_UNITS,
  type AmountUnit, type MassUnit, type VolumeUnit, type MolarityResult,
} from '@/lib/molarityCalc'
import { trackResearchToolViewed, trackResearchToolUsed, trackResearchToolToEditor } from '@/lib/analytics'

const TOOL_ID = 'molarity_calculator'

type Mode = 'moles' | 'mass'

export default function MolarityCalculator() {
  const viewedRef = useRef(false)
  const [mode, setMode] = useState<Mode>('moles')

  // Moles mode
  const [amount, setAmount]         = useState('')
  const [amountUnit, setAmountUnit] = useState<AmountUnit>('mmol')

  // Mass mode
  const [mass, setMass]             = useState('')
  const [massUnit, setMassUnit]     = useState<MassUnit>('g')
  const [molarMass, setMolarMass]   = useState('')

  // Shared
  const [volume, setVolume]         = useState('')
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('mL')

  const [result, setResult] = useState<MolarityResult | null>(null)

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true
      trackResearchToolViewed(TOOL_ID)
    }
  }, [])

  function calculate() {
    const v = parseFloat(volume)
    let r: MolarityResult

    if (mode === 'moles') {
      r = calcMolarity({ mode: 'moles', amount: parseFloat(amount), amountUnit, volume: v, volumeUnit })
    } else {
      r = calcMolarity({ mode: 'mass', mass: parseFloat(mass), massUnit, molarMass: parseFloat(molarMass), volume: v, volumeUnit })
    }
    setResult(r)
    if (r.ok) trackResearchToolUsed(TOOL_ID)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setResult(null)
  }

  function clear() { setResult(null) }

  return (
    <div>
      {/* ── Mode selector ── */}
      <div className="flex gap-2 mb-7">
        {(['moles', 'mass'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {m === 'moles' ? 'Moles' : 'Mass'}
          </button>
        ))}
      </div>

      {/* ── Fields ── */}
      <form
        onSubmit={e => { e.preventDefault(); calculate() }}
        className="space-y-4 mb-5"
      >
        {mode === 'moles' ? (
          <FieldRow
            label="Amount of substance"
            value={amount}
            onChange={v => { setAmount(v); clear() }}
            placeholder="e.g. 100"
            unit={amountUnit}
            units={AMOUNT_UNITS}
            onUnitChange={u => { setAmountUnit(u as AmountUnit); clear() }}
          />
        ) : (
          <>
            <FieldRow
              label="Mass"
              value={mass}
              onChange={v => { setMass(v); clear() }}
              placeholder="e.g. 5.844"
              unit={massUnit}
              units={MASS_UNITS}
              onUnitChange={u => { setMassUnit(u as MassUnit); clear() }}
            />

            {/* Molar mass — with link to MW calculator */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
                Molar mass
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={molarMass}
                  onChange={e => { setMolarMass(e.target.value); clear() }}
                  placeholder="e.g. 58.44"
                  min="0"
                  step="any"
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-base font-mono
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder:text-slate-300 bg-white"
                />
                <span className="text-sm text-slate-600 px-2 whitespace-nowrap">g/mol</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                Don&apos;t know the molar mass?{' '}
                <Link
                  href="/tools/molecular-weight-calculator"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Calculate it →
                </Link>
              </p>
            </div>
          </>
        )}

        <FieldRow
          label="Solution volume"
          value={volume}
          onChange={v => { setVolume(v); clear() }}
          placeholder="e.g. 500"
          unit={volumeUnit}
          units={VOLUME_UNITS}
          onUnitChange={u => { setVolumeUnit(u as VolumeUnit); clear() }}
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
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <span className="text-sm font-medium text-blue-700">Molarity</span>
            <span className="text-2xl font-bold text-blue-900 font-mono tabular-nums">
              {result.display}
            </span>
          </div>
          {result.secondary && (
            <p className="mt-1 text-xs text-blue-600">{result.secondary}</p>
          )}
        </div>
      )}

      {/* ── CTA ── */}
      <div className="mt-10 pt-8 border-t border-slate-100">
        <p className="text-xs text-slate-600 mb-5">
          Need to dilute this solution?{' '}
          <Link href="/tools/dilution-calculator" className="text-blue-600 hover:text-blue-700 underline">
            Dilution Calculator →
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

// ── FieldRow ──────────────────────────────────────────────────────────────────

interface FieldRowProps {
  label:        string
  value:        string
  onChange:     (v: string) => void
  placeholder:  string
  unit:         string
  units:        readonly string[]
  onUnitChange: (u: string) => void
}

function FieldRow({ label, value, onChange, placeholder, unit, units, onUnitChange }: FieldRowProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min="0"
          step="any"
          className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-base font-mono
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-slate-300 bg-white"
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
