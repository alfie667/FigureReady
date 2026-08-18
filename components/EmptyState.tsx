'use client'
import { useRef } from 'react'

interface Props {
  onFile?: (file: File) => void
  onSampleClick?: () => void
  onTemplatesClick?: () => void
}

// Subtle watermark — a thin UV-Vis / PL spectrum at ~6 % opacity.
// Drawn in pure SVG so it scales perfectly and adds zero weight.
const SpectrumWatermark = () => (
  <svg
    viewBox="0 0 700 260"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0.065,
      pointerEvents: 'none',
    }}
  >
    {/* Axis lines */}
    <line x1="60" y1="20" x2="60" y2="210" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="60" y1="210" x2="640" y2="210" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" />

    {/* Curve 1 — broad blue-shifted band (C-dots / OLED) */}
    <path
      d="M 80 208
         C 110 207, 145 200, 175 175
         C 205 150, 215 110, 220 85
         C 225 60, 230 45, 235 42
         C 240 39, 245 44, 250 58
         C 260 85, 270 140, 290 185
         C 310 205, 340 208, 640 208"
      fill="none"
      stroke="#1e3a5f"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Curve 2 — narrow green band (perovskite-like) */}
    <path
      d="M 80 208
         C 200 208, 290 207, 330 200
         C 355 194, 368 170, 374 140
         C 378 118, 380 88, 382 72
         C 384 56, 387 48, 390 46
         C 393 44, 396 51, 399 68
         C 404 90, 408 130, 415 165
         C 425 190, 445 205, 640 208"
      fill="none"
      stroke="#1e3a5f"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Curve 3 — red-shifted broad band */}
    <path
      d="M 80 208
         C 280 208, 420 207, 470 200
         C 500 195, 516 178, 522 155
         C 528 132, 530 100, 532 80
         C 534 62, 537 50, 540 48
         C 543 46, 546 54, 550 72
         C 558 102, 565 155, 578 185
         C 592 203, 615 208, 640 208"
      fill="none"
      stroke="#1e3a5f"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Tick marks — X axis */}
    {[145, 235, 325, 415, 505, 595].map(x => (
      <line key={x} x1={x} y1="210" x2={x} y2="216" stroke="#1e3a5f" strokeWidth="1" />
    ))}
    {/* Tick marks — Y axis */}
    {[50, 90, 130, 170].map(y => (
      <line key={y} x1="54" y1={y} x2="60" y2={y} stroke="#1e3a5f" strokeWidth="1" />
    ))}

    {/* Data points on curve 1 */}
    {[
      [175, 175], [220, 85], [235, 42], [250, 58], [290, 185],
    ].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#1e3a5f" />
    ))}
  </svg>
)

export default function EmptyState({ onFile, onSampleClick, onTemplatesClick }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile?.(file)
    e.target.value = ''
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: 360 }}
    >
      <SpectrumWatermark />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-sm">

        {/* Heading */}
        <div className="flex flex-col gap-2.5">
          <h2
            style={{
              fontSize: 30,
              fontWeight: 650,
              color: '#0f172a',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Create your first figure
          </h2>
          <p
            style={{
              fontSize: 15,
              color: '#475569',
              lineHeight: 1.6,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Upload an Excel or CSV file to start creating a publication-ready scientific figure.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[14px] font-semibold transition-colors"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.1px' }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Choose a file
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="sr-only"
            onChange={handleFileChange}
          />

          {/* Secondary actions */}
          <div className="flex items-center gap-4">
            {onTemplatesClick && (
              <button
                onClick={onTemplatesClick}
                className="text-[13px] text-[#64748b] hover:text-[#2563eb] transition-colors"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Browse templates
              </button>
            )}
            {onTemplatesClick && onSampleClick && (
              <span className="text-[#cbd5e1] text-[13px] select-none">·</span>
            )}
            {onSampleClick && (
              <button
                onClick={onSampleClick}
                className="text-[13px] text-[#64748b] hover:text-[#2563eb] transition-colors"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Try demo data
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
