'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const slideLeft = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

// ── Mini XRD chart (pure SVG, no lib) ────────────────────────────────────────
function XrdChart() {
  // Simplified XRD-like peaks
  const peaks = [
    { x: 60,  h: 28 },
    { x: 110, h: 110 },
    { x: 155, h: 42 },
    { x: 210, h: 68 },
    { x: 255, h: 38 },
    { x: 305, h: 90 },
    { x: 345, h: 30 },
  ]
  const W = 400
  const H = 140
  const baseline = H - 18

  // Build a smooth baseline with peaks
  const points = [`M 20,${baseline}`]
  let prev = 20
  for (const p of peaks) {
    const base = baseline - 6
    points.push(`L ${p.x - 18},${base}`)
    points.push(`Q ${p.x},${baseline - p.h} ${p.x + 18},${base}`)
    prev = p.x + 18
  }
  points.push(`L ${W - 20},${baseline}`)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1="20" y1={baseline - f * 110} x2={W - 20} y2={baseline - f * 110}
          stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
      ))}
      {/* Axis */}
      <line x1="20" y1={baseline} x2={W - 20} y2={baseline} stroke="#cbd5e1" strokeWidth="1.2" />
      {/* Curve — blue series */}
      <motion.path
        d={points.join(' ')}
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.8 }}
      />
      {/* X-axis labels */}
      {[20, 40, 60, 80].map((v, i) => (
        <text key={v} x={20 + i * ((W - 40) / 3)} y={H - 3}
          fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="Inter,sans-serif">
          {v}°
        </text>
      ))}
      {/* Y-axis label */}
      <text x="8" y={baseline - 55} fontSize="8" fill="#94a3b8" textAnchor="middle"
        transform={`rotate(-90,8,${baseline - 55})`} fontFamily="Inter,sans-serif">
        Intensity
      </text>
    </svg>
  )
}

// ── Excel rows ────────────────────────────────────────────────────────────────
const ROWS = [
  { x: '10.2', y1: '312', y2: '—' },
  { x: '15.8', y1: '1840', y2: '—' },
  { x: '20.4', y1: '520', y2: '—' },
  { x: '26.1', y1: '980', y2: '—' },
  { x: '31.5', y1: '415', y2: '—' },
]

// ── Style row ────────────────────────────────────────────────────────────────
function StyleRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className={`text-[10px] font-medium ${accent ? 'text-blue-600' : 'text-slate-600'}`}>
        {value}
      </span>
    </div>
  )
}

// ── Color swatch row ─────────────────────────────────────────────────────────
const SWATCH_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed']

// ── Main component ────────────────────────────────────────────────────────────
export default function DemoMockup() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="relative mx-auto max-w-[960px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10 bg-white select-none"
    >
      {/* ── Browser chrome ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-4 h-9 bg-slate-100 border-b border-slate-200 shrink-0">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="mx-auto text-xs text-slate-400 font-medium">figureready.com/app</span>
        {/* Export badge */}
        <motion.span
          variants={fadeIn}
          className="flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600 px-2 py-0.5 rounded-md"
        >
          ↓ Export PNG
        </motion.span>
      </div>

      {/* ── App layout ─────────────────────────────────────────────────── */}
      <div className="flex h-[420px] md:h-[460px]">

        {/* LEFT — Data panel */}
        <motion.div
          variants={slideRight}
          className="w-[160px] shrink-0 border-r border-slate-100 bg-[#f8fafc] flex flex-col"
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Data</p>
          </div>
          <div className="px-2 py-2 flex-1 overflow-hidden">
            {/* Column header */}
            <div className="flex gap-1 mb-1">
              {['2θ (°)', 'Intensity', 'Bg'].map(h => (
                <div key={h} className="flex-1 text-[8px] font-semibold text-slate-400 bg-slate-100 rounded px-1 py-0.5 text-center truncate">
                  {h}
                </div>
              ))}
            </div>
            {/* Rows */}
            {ROWS.map((row, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                custom={i}
                className="flex gap-1 mb-0.5"
              >
                {[row.x, row.y1, row.y2].map((v, j) => (
                  <div key={j} className={`flex-1 text-[8px] rounded px-1 py-0.5 text-center ${
                    j === 0 ? 'text-blue-700 bg-blue-50 font-medium' : 'text-slate-500 bg-white border border-slate-100'
                  }`}>
                    {v}
                  </div>
                ))}
              </motion.div>
            ))}
            {/* Selected columns badge */}
            <motion.div variants={slideUp} className="mt-3 space-y-1.5">
              <div className="text-[9px] text-slate-400 font-medium">X axis</div>
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[9px] font-medium text-blue-700 truncate">2θ (°)</span>
              </div>
              <div className="text-[9px] text-slate-400 font-medium">Y axis</div>
              <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-md px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-[9px] font-medium text-green-700 truncate">Intensity</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* CENTER — Chart canvas */}
        <motion.div
          variants={slideUp}
          className="flex-1 flex flex-col bg-white"
        >
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-[#fafafa]">
            {['XRD Pattern', 'FTIR', 'UV-Vis', 'PL'].map((t, i) => (
              <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-md cursor-pointer ${
                i === 0
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}>
                {t}
              </span>
            ))}
          </div>

          {/* Chart */}
          <div className="flex-1 flex flex-col items-stretch px-6 pt-4 pb-2">
            {/* Axis title */}
            <motion.p variants={fadeIn} className="text-[10px] font-semibold text-slate-600 text-center mb-1">
              XRD Pattern — Sample A
            </motion.p>
            <div className="flex-1">
              <XrdChart />
            </div>
            {/* X axis label */}
            <motion.p variants={fadeIn} className="text-[9px] text-slate-400 text-center mt-1">
              2θ (degrees)
            </motion.p>
          </div>

          {/* Bottom bar — export formats */}
          <motion.div
            variants={slideUp}
            className="flex items-center justify-end gap-2 px-4 py-2 border-t border-slate-100 bg-[#fafafa]"
          >
            {['SVG', 'PDF', 'PNG 300 dpi'].map((fmt, i) => (
              <span key={fmt} className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                i === 2
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-slate-500 border-slate-200 bg-white'
              }`}>
                {fmt}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Style panel */}
        <motion.div
          variants={slideLeft}
          className="w-[148px] shrink-0 border-l border-slate-100 bg-[#f8fafc] flex flex-col"
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Style</p>
          </div>
          <div className="px-3 py-2 flex-1 overflow-hidden space-y-3">

            {/* Color palette */}
            <motion.div variants={slideUp}>
              <p className="text-[9px] text-slate-400 font-medium mb-1.5">Color palette</p>
              <div className="flex gap-1">
                {SWATCH_COLORS.map((c, i) => (
                  <span key={c} className={`w-4 h-4 rounded-sm shrink-0 ${i === 0 ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </motion.div>

            {/* Style props */}
            <motion.div variants={slideUp} className="space-y-0.5">
              <p className="text-[9px] text-slate-400 font-medium mb-1">Axes</p>
              <StyleRow label="Font" value="Arial 9pt" />
              <StyleRow label="Line width" value="1.5 px" />
              <StyleRow label="Grid" value="Dashed" />
            </motion.div>

            <motion.div variants={slideUp} className="space-y-0.5">
              <p className="text-[9px] text-slate-400 font-medium mb-1">Export</p>
              <StyleRow label="DPI" value="300" accent />
              <StyleRow label="Format" value="PNG" accent />
              <StyleRow label="Size" value="3.5 × 2.6″" />
            </motion.div>

            {/* Publication badge */}
            <motion.div
              variants={slideUp}
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
