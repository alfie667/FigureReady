'use client'
import { motion, useInView, useAnimationControls } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

// ── Quartz SiO₂ peaks (2θ, relative intensity, half-width) ───────────────────
const PEAKS = [
  { pos: 20.9, h: 0.12, s: 0.28 },
  { pos: 26.6, h: 1.00, s: 0.26 }, // main (101) peak
  { pos: 36.5, h: 0.22, s: 0.28 },
  { pos: 39.5, h: 0.10, s: 0.26 },
  { pos: 42.5, h: 0.14, s: 0.28 },
  { pos: 45.8, h: 0.19, s: 0.28 },
  { pos: 50.1, h: 0.32, s: 0.28 }, // (112) peak
  { pos: 54.9, h: 0.09, s: 0.26 },
  { pos: 59.9, h: 0.24, s: 0.28 },
  { pos: 67.7, h: 0.17, s: 0.28 },
]

const SVG_W = 400
const SVG_H = 140
const X_MIN = 10
const X_MAX = 80
const BASELINE = SVG_H - 18
const PLOT_W = SVG_W - 40
const MAX_H = (SVG_H - 28) * 0.86

function intensity(deg: number) {
  return PEAKS.reduce((s, p) => s + p.h * Math.exp(-0.5 * ((deg - p.pos) / p.s) ** 2), 0)
}

function toPx(deg: number) {
  return 20 + ((deg - X_MIN) / (X_MAX - X_MIN)) * PLOT_W
}

// Pre-compute the SVG path (500 sample points)
const XRD_PTS = Array.from({ length: 501 }, (_, i) => {
  const deg = X_MIN + (i / 500) * (X_MAX - X_MIN)
  return `${toPx(deg).toFixed(1)},${(BASELINE - Math.max(0, intensity(deg)) * MAX_H).toFixed(1)}`
})
const XRD_LINE = `M ${XRD_PTS.join(' L ')}`
const XRD_FILL = `${XRD_LINE} L ${(20 + PLOT_W)},${BASELINE} L 20,${BASELINE} Z`

// Peak labels shown on the chart
const PEAK_LABELS = [
  { deg: 26.6, label: '(101)' },
  { deg: 50.1, label: '(112)' },
]

// ── Cursor SVG ────────────────────────────────────────────────────────────────
function CursorSVG() {
  return (
    <svg
      width="20" height="24" viewBox="0 0 20 24" fill="none"
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
    >
      <path
        d="M4 2 L4 19 L7.5 15 L10.5 22 L13 21 L10 14 L15 14 Z"
        fill="white" stroke="#0f172a"
        strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

// ── Click ripple ──────────────────────────────────────────────────────────────
function Ripple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: x - 12, top: y - 12,
        width: 24, height: 24, borderRadius: '50%',
        border: '1.5px solid #3b82f6', pointerEvents: 'none', zIndex: 19,
      }}
      initial={{ scale: 0.4, opacity: 0.8 }}
      animate={{ scale: 2.8, opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      onAnimationComplete={onDone}
    />
  )
}

// ── Framer Motion variants ────────────────────────────────────────────────────
const EASE = [0.25, 0.46, 0.45, 0.94] as const
const container  = { hidden: {}, visible: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } } }
const fromLeft   = { hidden: { opacity: 0, x: -22 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } } }
const fromBottom = { hidden: { opacity: 0, y: 22  }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }
const fromRight  = { hidden: { opacity: 0, x: 22  }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } } }
const appear     = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }

// ── Cursor waypoints ──────────────────────────────────────────────────────────
// Coordinates relative to the mockup top-left corner (px)
// chrome = 36px, left panel = 160px, right panel = 148px
const WAYPOINTS = [
  { x: 88,  y: 245, pause: 1300 },              // data table rows
  { x: 214, y: 57,  pause: 900, click: true },  // XRD Pattern tab
  { x: 484, y: 285, pause: 1600 },              // chart center
  { x: 872, y: 18,  pause: 900, click: true },  // Export PNG (chrome)
]

// ── Data rows ─────────────────────────────────────────────────────────────────
const ROWS = [
  { x: '10.2', y: '312' },
  { x: '15.8', y: '1840' },
  { x: '20.4', y: '520' },
  { x: '26.1', y: '980' },
  { x: '31.5', y: '415' },
]

function StyleRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className={`text-[10px] font-medium ${accent ? 'text-blue-600' : 'text-slate-600'}`}>{value}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DemoMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const cursorCtrl = useAnimationControls()
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  useEffect(() => {
    if (!inView) return
    let alive = true

    ;(async () => {
      // Wait for panel entry animations to finish
      await new Promise(r => setTimeout(r, 1800))

      while (alive) {
        for (const wp of WAYPOINTS) {
          if (!alive) break

          await cursorCtrl.start({
            x: wp.x, y: wp.y, opacity: 1,
            transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
          })

          if (wp.click && alive) {
            setRipples(prev => [...prev, { x: wp.x, y: wp.y, id: Date.now() }])
            await cursorCtrl.start({ scale: 0.78, transition: { duration: 0.07 } })
            await cursorCtrl.start({ scale: 1.0,  transition: { duration: 0.12 } })
          }

          await new Promise(r => setTimeout(r, wp.pause))
        }
      }
    })()

    return () => { alive = false }
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps

  const gridYs = [0.25, 0.5, 0.75].map(f => BASELINE - f * MAX_H)

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="relative mx-auto max-w-[960px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10 bg-white select-none"
    >
      {/* ── Animated cursor ────────────────────────────────────────────── */}
      <motion.div
        style={{ position: 'absolute', pointerEvents: 'none', zIndex: 30 }}
        initial={{ x: 88, y: 245, opacity: 0, scale: 1 }}
        animate={cursorCtrl}
      >
        <CursorSVG />
      </motion.div>

      {/* ── Click ripples ──────────────────────────────────────────────── */}
      {ripples.map(r => (
        <Ripple
          key={r.id} x={r.x} y={r.y}
          onDone={() => setRipples(prev => prev.filter(p => p.id !== r.id))}
        />
      ))}

      {/* ── Browser chrome ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-4 h-9 bg-slate-100 border-b border-slate-200 shrink-0">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="mx-auto text-xs text-slate-400 font-medium">figureready.com/app</span>
        <motion.span
          variants={appear}
          className="flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600 px-2 py-0.5 rounded-md"
        >
          ↓ Export PNG
        </motion.span>
      </div>

      {/* ── App layout ─────────────────────────────────────────────────── */}
      <div className="flex h-[420px] md:h-[460px]">

        {/* LEFT — Data panel */}
        <motion.div variants={fromLeft} className="w-[160px] shrink-0 border-r border-slate-100 bg-[#f8fafc] flex flex-col">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Data</p>
          </div>
          <div className="px-2 py-2 flex-1 overflow-hidden">
            <div className="flex gap-1 mb-1">
              {['2θ (°)', 'Intensity'].map(h => (
                <div key={h} className="flex-1 text-[8px] font-semibold text-slate-400 bg-slate-100 rounded px-1 py-0.5 text-center truncate">{h}</div>
              ))}
            </div>
            {ROWS.map((row, i) => (
              <motion.div key={i} variants={appear} className="flex gap-1 mb-0.5">
                <div className="flex-1 text-[8px] rounded px-1 py-0.5 text-center text-blue-700 bg-blue-50 font-medium">{row.x}</div>
                <div className="flex-1 text-[8px] rounded px-1 py-0.5 text-center text-slate-500 bg-white border border-slate-100">{row.y}</div>
              </motion.div>
            ))}
            <motion.div variants={fromBottom} className="mt-3 space-y-1.5">
              <p className="text-[9px] text-slate-400 font-medium">X axis</p>
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[9px] font-medium text-blue-700">2θ (°)</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium">Y axis</p>
              <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-md px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-[9px] font-medium text-green-700">Intensity</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* CENTER — Chart */}
        <motion.div variants={fromBottom} className="flex-1 flex flex-col bg-white min-w-0">
          {/* Template toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-[#fafafa]">
            {['XRD Pattern', 'FTIR', 'UV-Vis', 'PL'].map((t, i) => (
              <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-md cursor-pointer ${
                i === 0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}>{t}</span>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 flex flex-col px-3 pt-3 pb-1 min-w-0">
            <motion.p variants={appear} className="text-[10px] font-semibold text-slate-600 text-center mb-1">
              XRD Pattern — SiO₂ (Quartz)
            </motion.p>

            <div className="flex-1 min-h-0">
              <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="overflow-visible h-full w-full">

                {/* Grid */}
                {gridYs.map(y => (
                  <line key={y} x1="20" y1={y.toFixed(1)} x2={20 + PLOT_W} y2={y.toFixed(1)}
                    stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="4 3" />
                ))}

                {/* Axes */}
                <line x1="20" y1={BASELINE} x2={20 + PLOT_W} y2={BASELINE} stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="8" x2="20" y2={BASELINE} stroke="#cbd5e1" strokeWidth="1" />

                {/* Area fill */}
                <motion.path
                  d={XRD_FILL} fill="#3b82f6" fillOpacity="0.07"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                />

                {/* Curve — draws in */}
                <motion.path
                  d={XRD_LINE}
                  fill="none" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.6 }}
                />

                {/* Peak labels — appear after curve */}
                {PEAK_LABELS.map(({ deg, label }) => {
                  const xp = toPx(deg)
                  const yp = BASELINE - intensity(deg) * MAX_H
                  return (
                    <motion.g key={label}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 2.2, duration: 0.4 }}
                    >
                      <line x1={xp} y1={yp - 2} x2={xp} y2={yp - 11} stroke="#94a3b8" strokeWidth="0.7" />
                      <text x={xp} y={yp - 14} fontSize="7.5" fill="#64748b" textAnchor="middle" fontFamily="monospace">
                        {label}
                      </text>
                    </motion.g>
                  )
                })}

                {/* X axis ticks */}
                {[20, 40, 60, 80].map(deg => {
                  const xp = toPx(deg)
                  return (
                    <g key={deg}>
                      <line x1={xp} y1={BASELINE} x2={xp} y2={BASELINE + 3} stroke="#cbd5e1" strokeWidth="0.8" />
                      <text x={xp} y={BASELINE + 11} fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="Inter,sans-serif">
                        {deg}°
                      </text>
                    </g>
                  )
                })}

                {/* Y axis label */}
                <text
                  x="8" y={BASELINE / 2} fontSize="8" fill="#94a3b8"
                  textAnchor="middle" fontFamily="Inter,sans-serif"
                  transform={`rotate(-90,8,${BASELINE / 2})`}
                >
                  Intensity (a.u.)
                </text>

                {/* X axis title */}
                <text x={SVG_W / 2} y={SVG_H - 1} fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="Inter,sans-serif">
                  2θ (degrees)
                </text>
              </svg>
            </div>
          </div>

          {/* Export bar */}
          <motion.div variants={fromBottom} className="flex items-center justify-end gap-2 px-4 py-2 border-t border-slate-100 bg-[#fafafa]">
            {['SVG', 'PDF', 'PNG 300 dpi'].map((fmt, i) => (
              <span key={fmt} className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                i === 2 ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 border-slate-200 bg-white'
              }`}>{fmt}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Style panel */}
        <motion.div variants={fromRight} className="w-[148px] shrink-0 border-l border-slate-100 bg-[#f8fafc] flex flex-col">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Style</p>
          </div>
          <div className="px-3 py-2 flex-1 overflow-hidden space-y-3">
            <motion.div variants={fromBottom}>
              <p className="text-[9px] text-slate-400 font-medium mb-1.5">Color palette</p>
              <div className="flex gap-1">
                {['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed'].map((c,i) => (
                  <span key={c} className={`w-4 h-4 rounded-sm shrink-0 ${i===0?'ring-2 ring-blue-500 ring-offset-1':''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </motion.div>
            <motion.div variants={fromBottom} className="space-y-0.5">
              <p className="text-[9px] text-slate-400 font-medium mb-1">Axes</p>
              <StyleRow label="Font" value="Arial 9pt" />
              <StyleRow label="Line width" value="1.5 px" />
              <StyleRow label="Grid" value="Dashed" />
            </motion.div>
            <motion.div variants={fromBottom} className="space-y-0.5">
              <p className="text-[9px] text-slate-400 font-medium mb-1">Export</p>
              <StyleRow label="DPI"    value="300"       accent />
              <StyleRow label="Format" value="PNG"       accent />
              <StyleRow label="Size"   value='3.5×2.6"' />
            </motion.div>
            <motion.div variants={fromBottom}
              className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5"
            >
              <svg className="w-3 h-3 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[9px] font-semibold text-green-700">Publication-ready</span>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}
