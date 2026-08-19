'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { trackSampleSelected } from '@/lib/analytics'

export type SampleId = 'xrd' | 'ftir' | 'doseresponse' | 'uvvis' | 'fluorescence'

interface Props {
  onFile?: (file: File) => void
  onSampleSelect?: (id: SampleId) => void
  onTemplatesClick?: () => void
}

// ── Tiny SVG thumbnails — schematic, not screenshots ──────────────────────────

const XrdThumb = () => (
  <svg viewBox="0 0 80 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <line x1="4" y1="38" x2="76" y2="38" stroke="#cbd5e1" strokeWidth="0.5"/>
    {/* Pattern 1 — black, baseline 38 */}
    <polyline points="4,38 16,38 17,34 18.5,20 20,34 21,38 37,38 38,34 39,28 40,34 41,38 57,38 58,35 59,31 60,35 61,38 76,38"
      stroke="#111827" strokeWidth="1.1" strokeLinejoin="round"/>
    {/* Pattern 2 — navy, baseline 28 */}
    <polyline points="4,28 11,28 12,24 13.5,11 15,24 16,28 30,28 31,25 32,19 33,25 34,28 35,24 36,17 37,24 38,28 54,28 55,25 56,20 57,25 58,28 76,28"
      stroke="#1d4ed8" strokeWidth="1.1" strokeLinejoin="round"/>
    {/* Pattern 3 — crimson, baseline 18 */}
    <polyline points="4,18 8,18 9,14 10.5,5 12,14 13,18 23,18 24,14 25,6 26,14 27,18 47,18 48,14 49,8 50,14 51,18 62,18 63,14 64,8 65,14 66,18 76,18"
      stroke="#b91c1c" strokeWidth="1.1" strokeLinejoin="round"/>
  </svg>
)

const FtirThumb = () => (
  <svg viewBox="0 0 80 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* 3 stacked spectra — broad OH left, flat middle, fingerprint right */}
    <polyline points="4,37 10,33 16,30 22,29 28,31 34,37 44,37 50,37 54,35 57,25 60,32 64,28 68,31 72,29 76,37"
      stroke="#111827" strokeWidth="1.1" strokeLinejoin="round"/>
    <polyline points="4,27 10,23 16,20 22,19 28,21 34,27 44,27 50,27 54,25 57,15 60,22 64,18 68,21 72,19 76,27"
      stroke="#1d4ed8" strokeWidth="1.1" strokeLinejoin="round"/>
    <polyline points="4,17 10,13 16,10 22,9 28,11 34,17 44,17 50,17 54,15 57,5 60,12 64,8 68,11 72,9 76,17"
      stroke="#b91c1c" strokeWidth="1.1" strokeLinejoin="round"/>
  </svg>
)

const DrThumb = () => (
  <svg viewBox="0 0 80 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* S-curve blue */}
    <polyline points="4,38 12,38 18,37 24,36 30,33 36,27 42,19 48,12 54,8 62,5 72,4 76,4"
      stroke="#2166ac" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* S-curve red dashed */}
    <polyline points="4,38 14,38 22,37 30,36 38,31 44,24 50,15 56,9 64,6 72,5 76,5"
      stroke="#ca0020" strokeWidth="1.3" strokeLinejoin="round" strokeDasharray="3,2"/>
    {/* Data points */}
    <circle cx="18" cy="37" r="2" fill="#2166ac"/>
    <circle cx="30" cy="33" r="2" fill="#2166ac"/>
    <circle cx="42" cy="19" r="2" fill="#2166ac"/>
    <circle cx="54" cy="8" r="2" fill="#2166ac"/>
    <circle cx="22" cy="37" r="2" fill="#ca0020"/>
    <circle cx="38" cy="31" r="2" fill="#ca0020"/>
    <circle cx="50" cy="15" r="2" fill="#ca0020"/>
    <circle cx="64" cy="6" r="2" fill="#ca0020"/>
  </svg>
)

const UvVisThumb = () => (
  <svg viewBox="0 0 80 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <line x1="4" y1="38" x2="76" y2="38" stroke="#cbd5e1" strokeWidth="0.5"/>
    {/* Sharp UV peak ~x=22 */}
    <polyline points="4,38 14,38 18,35 20,28 22,10 24,28 26,35 30,38 76,38"
      stroke="#2166ac" strokeWidth="1.4" strokeLinejoin="round"/>
    {/* Broader visible peak ~x=52 */}
    <polyline points="4,38 34,38 40,36 46,30 52,18 58,30 64,36 70,38 76,38"
      stroke="#15803d" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
)

const PlThumb = () => (
  <svg viewBox="0 0 80 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <line x1="4" y1="38" x2="76" y2="38" stroke="#cbd5e1" strokeWidth="0.5"/>
    {/* Blue emission ~x=22 */}
    <polyline points="4,38 14,38 18,35 20,28 22,8 24,28 26,35 30,38 76,38"
      stroke="#2563eb" strokeWidth="1.3" strokeLinejoin="round"/>
    {/* Green emission ~x=40 */}
    <polyline points="4,38 30,38 36,35 38,25 40,6 42,25 44,35 50,38 76,38"
      stroke="#15803d" strokeWidth="1.3" strokeLinejoin="round"/>
    {/* Red emission ~x=60 */}
    <polyline points="4,38 50,38 56,35 58,27 60,9 62,27 64,35 70,38 76,38"
      stroke="#ca0020" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
)

interface Sample {
  id: SampleId
  name: string
  desc: string
  img?: string       // PNG path in /public — takes priority over Thumb
  Thumb?: React.FC
}

const SAMPLES: Sample[] = [
  { id: 'ftir',         name: 'FTIR',          desc: 'Turn multiple spectra into a clean stacked figure.', img: '/templates/smart/ftir-stacked.png' },
  { id: 'doseresponse', name: 'Dose–Response', desc: 'Fit experimental data with a 4PL curve.',            img: '/templates/smart/dose-response.png' },
  { id: 'uvvis',        name: 'UV–Vis',        desc: 'Explore and refine absorption spectra.',             img: '/templates/smart/xrd-stacked.png' },
]

// ── Watermark ────────────────────────────────────────────────────────────────

const SpectrumWatermark = () => (
  <svg
    viewBox="0 0 700 260"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05, pointerEvents: 'none' }}
  >
    <line x1="60" y1="20" x2="60" y2="210" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="60" y1="210" x2="640" y2="210" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M 80 208 C 110 207,145 200,175 175 C 205 150,215 110,220 85 C 225 60,230 45,235 42 C 240 39,245 44,250 58 C 260 85,270 140,290 185 C 310 205,340 208,640 208"
      fill="none" stroke="#1e3a5f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 80 208 C 200 208,290 207,330 200 C 355 194,368 170,374 140 C 378 118,380 88,382 72 C 384 56,387 48,390 46 C 393 44,396 51,399 68 C 404 90,408 130,415 165 C 425 190,445 205,640 208"
      fill="none" stroke="#1e3a5f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 80 208 C 280 208,420 207,470 200 C 500 195,516 178,522 155 C 528 132,530 100,532 80 C 534 62,537 50,540 48 C 543 46,546 54,550 72 C 558 102,565 155,578 185 C 592 203,615 208,640 208"
      fill="none" stroke="#1e3a5f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    {[145,235,325,415,505,595].map(x => <line key={x} x1={x} y1="210" x2={x} y2="216" stroke="#1e3a5f" strokeWidth="1"/>)}
    {[50,90,130,170].map(y => <line key={y} x1="54" y1={y} x2="60" y2={y} stroke="#1e3a5f" strokeWidth="1"/>)}
  </svg>
)

// ── Component ────────────────────────────────────────────────────────────────

export default function EmptyState({ onFile, onSampleSelect, onTemplatesClick }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile?.(file)
    e.target.value = ''
  }

  return (
    <div className="relative w-full flex flex-col items-center gap-6 px-6 py-2 overflow-hidden" style={{ maxWidth: 680 }}>
      <SpectrumWatermark />

      {/* ── Upload section ──────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-xs text-center flex flex-col items-center gap-3">
        <div className="flex flex-col gap-1.5">
          <h2 style={{ fontSize: 26, fontWeight: 650, color: '#0f172a', letterSpacing: '-0.4px', lineHeight: 1.2, fontFamily: 'Inter, system-ui, sans-serif' }}>
            Create your first figure
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, fontFamily: 'Inter, system-ui, sans-serif' }}>
            Upload your Excel or CSV file
          </p>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[14px] font-semibold transition-colors"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Choose a file
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={handleFileChange} />
      </div>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center w-full gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter, system-ui, sans-serif' }}>or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── Sample gallery ───────────────────────────────────────────── */}
      <div className="relative z-10 w-full flex flex-col items-center gap-3">
        <div className="text-center">
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Try with sample data
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter, system-ui, sans-serif', marginTop: 2 }}>
            See what FigureReady can do with real scientific data.
          </p>
        </div>

        <div className="grid w-full gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {SAMPLES.map(({ id, name, desc, img, Thumb }) => (
            <button
              key={id}
              onClick={() => {
                trackSampleSelected({ sample_type: id, source: 'empty_state' })
                onSampleSelect?.(id)
              }}
              className="group flex flex-col rounded-xl border border-[#E6EBF2] bg-white overflow-hidden hover:border-[#93c5fd] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-150 text-left"
            >
              {/* Thumbnail */}
              <div className="relative w-full bg-[#F4F7FA]" style={{ aspectRatio: '16/9' }}>
                {img ? (
                  <Image src={img} alt={name} fill className="object-cover" unoptimized />
                ) : Thumb ? (
                  <div className="absolute inset-0 flex items-center justify-center p-2"><Thumb /></div>
                ) : null}
              </div>
              {/* Text */}
              <div className="px-2.5 py-2">
                <p style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.3 }}>
                  {name}
                </p>
                <p style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.4, marginTop: 2 }}
                  className="line-clamp-2">
                  {desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {onTemplatesClick && (
          <button
            onClick={onTemplatesClick}
            className="text-[11px] text-slate-400 hover:text-[#2563eb] transition-colors"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Browse all templates →
          </button>
        )}
      </div>
    </div>
  )
}
