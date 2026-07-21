// Server component — pure SVG, no state needed

const W = 270, H = 195

// ── BEFORE chart (Excel-style, linear X scale) ───────────────────────────────

const B = { t: 36, r: 70, b: 32, l: 42 }
const BPW = W - B.l - B.r   // 158
const BPH = H - B.t - B.b   // 127

function bx(v: number) { return B.l + (v / 110) * BPW }
function by(v: number) { return B.t + BPH * (1 - v / 1.1) }

const B_XS = [0.1, 0.3, 1, 3, 10, 30, 100]
const B_YS = [0.02, 0.07, 0.19, 0.50, 0.82, 0.94, 0.99]
const B_LINE = B_XS.map((x, i) => `${i === 0 ? 'M' : 'L'}${bx(x).toFixed(1)},${by(B_YS[i]).toFixed(1)}`).join(' ')
const B_Y_GRID = [0.2, 0.4, 0.6, 0.8, 1.0]
const B_X_GRID = [20, 40, 60, 80, 100]
const B_Y_LABELS = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
const B_X_LABELS = [0, 20, 40, 60, 80, 100]

// ── AFTER chart (publication-style, log X scale) ─────────────────────────────

const A = { t: 14, r: 12, b: 36, l: 44 }
const APW = W - A.l - A.r   // 214
const APH = H - A.t - A.b   // 145

const AXL = Math.log10(0.07)
const AXR = Math.log10(130)
function ax(x: number) { return A.l + (Math.log10(x) - AXL) / (AXR - AXL) * APW }
function ay(y: number) { return A.t + APH * (1 - y) }
function hill(x: number) { return x / (3 + x) }

const A_CURVE = Array.from({ length: 60 }, (_, i) => {
  const lx = AXL + (AXR - AXL) * i / 59
  const x = Math.pow(10, lx)
  return `${i === 0 ? 'M' : 'L'}${ax(x).toFixed(1)},${ay(hill(x)).toFixed(1)}`
}).join(' ')

const A_DATA = B_XS.map((x, i) => ({ sx: ax(x), sy: ay(B_YS[i]) }))
const A_X_MAJOR = [0.1, 1, 10, 100]
const A_X_MINOR = [-1, 0, 1, 2].flatMap(d =>
  [2, 3, 4, 5, 6, 7, 8, 9].map(m => m * Math.pow(10, d))
).filter(v => v > 0.07 && v < 130 && !A_X_MAJOR.includes(v))
const A_Y_TICKS = [0, 0.25, 0.5, 0.75, 1.0]

// ── Component ────────────────────────────────────────────────────────────────

export default function BeforeAfter() {
  return (
    <section className="py-20 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1D6F42' }}>The difference</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Stop submitting this.
            <span className="block sm:inline"> Start submitting </span>
            <span style={{ color: '#1D6F42' }}>this.</span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">

          {/* ── BEFORE ── */}
          <div className="w-full max-w-[300px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-400 block shrink-0" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Excel chart</span>
            </div>
            <div className="rounded-xl border-2 border-red-100 overflow-hidden shadow-sm bg-white">
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', fontFamily: 'Arial, sans-serif' }}>

                {/* Gray plot background */}
                <rect x={B.l} y={B.t} width={BPW} height={BPH} fill="#f2f2f2" />

                {/* Gridlines */}
                {B_Y_GRID.map(y => (
                  <line key={y} x1={B.l} y1={by(y)} x2={B.l + BPW} y2={by(y)} stroke="#c0c0c0" strokeWidth={0.8} />
                ))}
                {B_X_GRID.map(x => (
                  <line key={x} x1={bx(x)} y1={B.t} x2={bx(x)} y2={B.t + BPH} stroke="#c0c0c0" strokeWidth={0.8} />
                ))}

                {/* Excel blue line */}
                <path d={B_LINE} fill="none" stroke="#4472C4" strokeWidth={2.5} />

                {/* Filled square markers */}
                {B_XS.map((x, i) => (
                  <rect key={i}
                    x={bx(x) - 4} y={by(B_YS[i]) - 4}
                    width={8} height={8}
                    fill="#4472C4"
                  />
                ))}

                {/* Border around plot area */}
                <rect x={B.l} y={B.t} width={BPW} height={BPH} fill="none" stroke="#bfbfbf" strokeWidth={0.8} />

                {/* Chart Title */}
                <text x={(B.l + B.l + BPW) / 2} y={16} textAnchor="middle" fontSize={10} fill="#404040" fontWeight="bold">
                  Chart Title
                </text>

                {/* Legend box */}
                <rect x={B.l + BPW + 5} y={B.t + 6} width={60} height={20} fill="white" stroke="#bfbfbf" strokeWidth={0.7} />
                <rect x={B.l + BPW + 9} y={B.t + 13} width={10} height={3} fill="#4472C4" />
                <rect x={B.l + BPW + 11} y={B.t + 10} width={6} height={8} fill="#4472C4" />
                <text x={B.l + BPW + 22} y={B.t + 18} fontSize={8} fill="#595959">Series1</text>

                {/* X labels */}
                {B_X_LABELS.map(x => (
                  <text key={x} x={bx(x)} y={B.t + BPH + 12} textAnchor="middle" fontSize={8} fill="#595959">{x}</text>
                ))}

                {/* Y labels */}
                {B_Y_LABELS.map(y => (
                  <text key={y} x={B.l - 4} y={by(y) + 3} textAnchor="end" fontSize={8} fill="#595959">{y.toFixed(1)}</text>
                ))}
              </svg>
            </div>
          </div>

          {/* Arrow */}
          <div className="shrink-0 rotate-90 sm:rotate-0">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#1D6F42" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* ── AFTER ── */}
          <div className="w-full max-w-[300px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 block shrink-0" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Publication-ready</span>
            </div>
            <div className="rounded-xl border-2 overflow-hidden shadow-sm bg-white" style={{ borderColor: '#d1fae5' }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', fontFamily: 'Arial, sans-serif' }}>

                {/* Smooth sigmoid curve */}
                <path d={A_CURVE} fill="none" stroke="#111" strokeWidth={2} strokeLinecap="round" />

                {/* Open red circle markers */}
                {A_DATA.map((d, i) => (
                  <circle key={i} cx={d.sx} cy={d.sy} r={3.5} fill="white" stroke="#e02020" strokeWidth={1.8} />
                ))}

                {/* L-shaped axes */}
                <line x1={A.l} y1={A.t} x2={A.l} y2={A.t + APH} stroke="#111" strokeWidth={1.5} />
                <line x1={A.l} y1={A.t + APH} x2={A.l + APW} y2={A.t + APH} stroke="#111" strokeWidth={1.5} />

                {/* X major ticks */}
                {A_X_MAJOR.map(x => (
                  <g key={x}>
                    <line x1={ax(x)} y1={A.t + APH} x2={ax(x)} y2={A.t + APH + 5} stroke="#111" strokeWidth={1.2} />
                    <text x={ax(x)} y={A.t + APH + 14} textAnchor="middle" fontSize={8} fill="#444">{x}</text>
                  </g>
                ))}

                {/* X minor ticks */}
                {A_X_MINOR.map((x, i) => (
                  <line key={i} x1={ax(x)} y1={A.t + APH} x2={ax(x)} y2={A.t + APH + 2.5} stroke="#666" strokeWidth={0.7} />
                ))}

                {/* Y ticks */}
                {A_Y_TICKS.map(y => (
                  <g key={y}>
                    <line x1={A.l - 5} y1={ay(y)} x2={A.l} y2={ay(y)} stroke="#111" strokeWidth={1.2} />
                    <text x={A.l - 8} y={ay(y) + 3} textAnchor="end" fontSize={8} fill="#444">{y.toFixed(2)}</text>
                  </g>
                ))}

                {/* Axis labels */}
                <text x={A.l + APW / 2} y={H - 3} textAnchor="middle" fontSize={9} fill="#333">
                  Concentration (µM)
                </text>
                <text
                  x={11} y={A.t + APH / 2}
                  textAnchor="middle" fontSize={9} fill="#333"
                  transform={`rotate(-90, 11, ${A.t + APH / 2})`}
                >
                  Absorbance (AU)
                </text>
              </svg>
            </div>
          </div>

        </div>

        {/* Journal names */}
        <p className="text-center text-xs text-slate-400 mt-10 tracking-wide">
          Journal-ready format for&nbsp;
          <span className="text-slate-500 font-medium">Nature</span> ·&nbsp;
          <span className="text-slate-500 font-medium">Cell</span> ·&nbsp;
          <span className="text-slate-500 font-medium">Science</span> ·&nbsp;
          <span className="text-slate-500 font-medium">ACS</span> ·&nbsp;
          <span className="text-slate-500 font-medium">PLOS ONE</span> ·&nbsp;
          <span className="text-slate-500 font-medium">Scientific Reports</span>
        </p>

      </div>
    </section>
  )
}
