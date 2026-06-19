interface Props {
  onUploadClick?: () => void
}

// Pixel-space data points for the demo figure
// Plot area: x ∈ [70, 520], y ∈ [30, 320]  (450 × 290 px)
// X axis: 0–60 min  → x_px = 70 + t * 7.5
// Y axis: 0–1.00    → y_px = 320 - val * 290
const s1 = [
  { x: 70,  y: 308, ey: 9  },
  { x: 145, y: 268, ey: 12 },
  { x: 220, y: 210, ey: 15 },
  { x: 295, y: 140, ey: 15 },
  { x: 370, y: 88,  ey: 12 },
  { x: 445, y: 59,  ey: 9  },
  { x: 520, y: 45,  ey: 6  },
]

const s2 = [
  { x: 70,  y: 317, ey: 6  },
  { x: 145, y: 297, ey: 9  },
  { x: 220, y: 262, ey: 12 },
  { x: 295, y: 210, ey: 15 },
  { x: 370, y: 152, ey: 12 },
  { x: 445, y: 105, ey: 12 },
  { x: 520, y: 68,  ey: 9  },
]

const toPoints = (arr: typeof s1) => arr.map(p => `${p.x},${p.y}`).join(' ')

export default function EmptyState({ onUploadClick }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5">

      {/* Demo publication-ready figure */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <svg
          viewBox="0 0 560 385"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
        >
          {/* ── Plot box (OriginLab / ACS full-frame style) ── */}
          <rect x="70" y="30" width="450" height="290" fill="none" stroke="#111" strokeWidth="1.5" />

          {/* ── Tick marks ── */}
          {/* X bottom (inward) + X top (mirror) */}
          {[0,1,2,3,4,5,6].map(i => (
            <g key={i}>
              <line x1={70 + i * 75} y1={320} x2={70 + i * 75} y2={313} stroke="#111" strokeWidth="1.5" />
              <line x1={70 + i * 75} y1={30}  x2={70 + i * 75} y2={37}  stroke="#111" strokeWidth="1.5" />
            </g>
          ))}
          {/* Y left (inward) + Y right (mirror) */}
          {[0,1,2,3,4,5].map(i => (
            <g key={i}>
              <line x1={70}  y1={320 - i * 58} x2={77}  y2={320 - i * 58} stroke="#111" strokeWidth="1.5" />
              <line x1={520} y1={320 - i * 58} x2={513} y2={320 - i * 58} stroke="#111" strokeWidth="1.5" />
            </g>
          ))}

          {/* ── Axis tick labels ── */}
          {[0,10,20,30,40,50,60].map((v, i) => (
            <text key={v} x={70 + i * 75} y={340} textAnchor="middle" fontSize="12" fill="#1a1a1a">{v}</text>
          ))}
          {[0, 0.20, 0.40, 0.60, 0.80, 1.00].map((v, i) => (
            <text key={v} x={62} y={320 - i * 58 + 4} textAnchor="end" fontSize="12" fill="#1a1a1a">
              {v.toFixed(2)}
            </text>
          ))}

          {/* ── Axis titles ── */}
          <text x={295} y={365} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
            Time (min)
          </text>
          <text
            x={16} y={175}
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            fill="#0f172a"
            transform="rotate(-90 16 175)"
          >
            Absorbance (a.u.)
          </text>

          {/* ── Series 1 error bars ── */}
          {s1.map((p, i) => (
            <g key={i} stroke="#1a1a1a" strokeWidth="1.2">
              <line x1={p.x} y1={p.y - p.ey} x2={p.x} y2={p.y + p.ey} />
              <line x1={p.x - 4} y1={p.y - p.ey} x2={p.x + 4} y2={p.y - p.ey} />
              <line x1={p.x - 4} y1={p.y + p.ey} x2={p.x + 4} y2={p.y + p.ey} />
            </g>
          ))}

          {/* ── Series 2 error bars ── */}
          {s2.map((p, i) => (
            <g key={i} stroke="#c0392b" strokeWidth="1.2">
              <line x1={p.x} y1={p.y - p.ey} x2={p.x} y2={p.y + p.ey} />
              <line x1={p.x - 4} y1={p.y - p.ey} x2={p.x + 4} y2={p.y - p.ey} />
              <line x1={p.x - 4} y1={p.y + p.ey} x2={p.x + 4} y2={p.y + p.ey} />
            </g>
          ))}

          {/* ── Series lines ── */}
          <polyline
            points={toPoints(s1)}
            fill="none" stroke="#1a1a1a" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <polyline
            points={toPoints(s2)}
            fill="none" stroke="#c0392b" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"
          />

          {/* ── Series 1 markers: filled circles ── */}
          {s1.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="5" fill="#1a1a1a" />
          ))}

          {/* ── Series 2 markers: filled squares ── */}
          {s2.map((p, i) => (
            <rect key={i} x={p.x - 4.5} y={p.y - 4.5} width="9" height="9" fill="#c0392b" />
          ))}

          {/* ── Legend (upper left, no overlap with data) ── */}
          <rect x={84} y={42} width={152} height={56} fill="white" stroke="#d1d5db" strokeWidth="0.8" rx="2" />
          {/* Series 1 */}
          <line x1={93} y1={62} x2={117} y2={62} stroke="#1a1a1a" strokeWidth="1.8" />
          <circle cx={105} cy={62} r="4.5" fill="#1a1a1a" />
          <text x={123} y={66} fontSize="12" fill="#1a1a1a">Control</text>
          {/* Series 2 */}
          <line x1={93} y1={84} x2={117} y2={84} stroke="#c0392b" strokeWidth="1.8" />
          <rect x={100.5} y={79.5} width="9" height="9" fill="#c0392b" />
          <text x={123} y={88} fontSize="12" fill="#1a1a1a">Treatment</text>

          {/* ── Caption ── */}
          <text x={295} y={16} textAnchor="middle" fontSize="10" fill="#94a3b8" letterSpacing="0.04em">
            EXAMPLE FIGURE — UPLOAD YOUR DATA TO GET STARTED
          </text>
        </svg>
      </div>

      {/* Upload button */}
      {onUploadClick && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Excel file
          </button>
          <p className="text-xs text-slate-400">Supports .xlsx files</p>
        </div>
      )}
    </div>
  )
}
