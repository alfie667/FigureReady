'use client'
import { journalStyles, type StyleName } from '@/lib/chartStyles'

// Plot area coordinates for the mini SVG (viewBox 0 0 110 80)
const P = { x1: 16, y1: 8, x2: 100, y2: 62 }
// Sample curve: 5 data points
const PTS = [[16,58],[37,42],[58,22],[79,32],[100,14]] as [number,number][]
const CURVE = `M ${PTS[0][0]},${PTS[0][1]} C 26,58 27,34 ${PTS[1][0]},${PTS[1][1]} C 47,50 47,16 ${PTS[2][0]},${PTS[2][1]} C 69,28 69,26 ${PTS[3][0]},${PTS[3][1]} C 89,38 89,10 ${PTS[4][0]},${PTS[4][1]}`
const GRID_Y = [22, 36, 50]
const X_TICKS = [37, 58, 79]
const Y_TICKS = [22, 36, 50]

interface MiniChartProps {
  curveColor: string
  frameColor: string
  frameWidth: number
  showBox: boolean
  showGrid: boolean
}

function MiniChart({ curveColor, frameColor, frameWidth, showBox, showGrid }: MiniChartProps) {
  return (
    <svg viewBox="0 0 110 80" width="100%" height="100%" style={{ display: 'block' }}>
      {/* Grid */}
      {showGrid && GRID_Y.map(y => (
        <line key={y} x1={P.x1} y1={y} x2={P.x2} y2={y} stroke="#e0e0e0" strokeWidth={0.8} />
      ))}

      {/* Left axis */}
      <line x1={P.x1} y1={P.y1} x2={P.x1} y2={P.y2} stroke={frameColor} strokeWidth={frameWidth} />
      {/* Bottom axis */}
      <line x1={P.x1} y1={P.y2} x2={P.x2} y2={P.y2} stroke={frameColor} strokeWidth={frameWidth} />
      {/* Top axis (box only) */}
      {showBox && <line x1={P.x1} y1={P.y1} x2={P.x2} y2={P.y1} stroke={frameColor} strokeWidth={frameWidth} />}
      {/* Right axis (box only) */}
      {showBox && <line x1={P.x2} y1={P.y1} x2={P.x2} y2={P.y2} stroke={frameColor} strokeWidth={frameWidth} />}

      {/* X tick marks */}
      {X_TICKS.map(x => (
        <line key={x} x1={x} y1={P.y2} x2={x} y2={P.y2 + 3} stroke={frameColor} strokeWidth={frameWidth * 0.8} />
      ))}
      {/* Y tick marks */}
      {Y_TICKS.map(y => (
        <line key={y} x1={P.x1 - 3} y1={y} x2={P.x1} y2={y} stroke={frameColor} strokeWidth={frameWidth * 0.8} />
      ))}

      {/* Curve */}
      <path d={CURVE} fill="none" stroke={curveColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {PTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill={curveColor} />
      ))}
    </svg>
  )
}

const MINI_CONFIG: Record<StyleName, MiniChartProps> = {
  ACS: {
    curveColor: '#000000',
    frameColor: '#000000',
    frameWidth: 1.5,
    showBox: true,
    showGrid: false,
  },
  Nature: {
    curveColor: '#0072B2',
    frameColor: '#000000',
    frameWidth: 1,
    showBox: false,
    showGrid: false,
  },
  Elsevier: {
    curveColor: '#1F77B4',
    frameColor: '#333333',
    frameWidth: 1,
    showBox: false,
    showGrid: true,
  },
}

interface Props {
  value: StyleName
  onChange: (name: StyleName) => void
}

export default function JournalStyleSelector({ value, onChange }: Props) {
  return (
    <div className="px-4 py-3 border-b border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Journal Style</p>
      <div className="flex gap-2">
        {journalStyles.map(js => {
          const isActive = value === js.name
          return (
            <button
              key={js.name}
              onClick={() => onChange(js.name)}
              className={`flex-1 rounded-xl border-2 transition-all overflow-hidden ${
                isActive
                  ? 'border-blue-500 shadow-sm shadow-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Mini chart preview */}
              <div className={`w-full aspect-[5/3] p-1.5 ${isActive ? 'bg-blue-50' : 'bg-slate-50'}`}>
                <MiniChart {...MINI_CONFIG[js.name]} />
              </div>
              {/* Label */}
              <div className={`py-1.5 text-[11px] font-semibold text-center border-t ${
                isActive
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-600 border-slate-100'
              }`}>
                {js.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
