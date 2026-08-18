'use client'
import { useEffect, useRef, useState } from 'react'
import type { AnnotationTool } from '@/hooks/useAnnotationInteraction'
import { isProUser } from '@/lib/usageLimit'
import { LogoFull } from '@/components/Logo'

// ── Icons 18–20px viewport ────────────────────────────────────────────────────
const IcSelect  = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 2l12 7-7 2-2 7L3 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
const IcText    = () => <svg width="17" height="18" viewBox="0 0 18 18"><text x="9" y="15" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor" fontFamily="Georgia,serif">T</text></svg>
const IcPeak    = () => <svg width="20" height="17" viewBox="0 0 22 18" fill="none"><circle cx="7" cy="13" r="2" fill="currentColor"/><line x1="7" y1="13" x2="15" y2="5" stroke="currentColor" strokeWidth="1.4"/><text x="16" y="8" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="Arial,sans-serif">pk</text></svg>
const IcArrow   = () => <svg width="20" height="14" viewBox="0 0 22 14" fill="none"><line x1="2" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.8"/><polygon points="13,3.5 21,7 13,10.5" fill="currentColor"/></svg>
const IcLine    = () => <svg width="20" height="14" viewBox="0 0 22 14" fill="none"><line x1="2" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
const IcDashed  = () => <svg width="20" height="14" viewBox="0 0 22 14" fill="none"><line x1="2" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4.5 3" strokeLinecap="round"/></svg>
const IcRect    = () => <svg width="18" height="15" viewBox="0 0 22 16" fill="none"><rect x="2" y="2" width="18" height="12" stroke="currentColor" strokeWidth="1.8" rx="1"/></svg>
const IcEllipse = () => <svg width="20" height="14" viewBox="0 0 22 16" fill="none"><ellipse cx="11" cy="8" rx="9" ry="6" stroke="currentColor" strokeWidth="1.8"/></svg>
const IcZoom    = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.7"/><line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><line x1="5.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="7.5" y1="5.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const IcInset   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
const IcUndo    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/></svg>
const IcRedo    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 000 11H13"/></svg>
const IcExport  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>

const SYMBOLS = [
  'α','β','γ','δ','ε','ζ','η','θ','λ','μ',
  'ν','π','ρ','σ','τ','φ','χ','ψ','ω',
  'Γ','Δ','Σ','Φ','Ω',
  '±','×','÷','∞','≤','≥','≈','≠',
  '°','·','→','←','↑','↓',
  '¹','²','³','⁻¹','⁻²','½','√','∂',
]

interface Props {
  docName?: string
  activeTool: AnnotationTool
  onToolChange: (t: AnnotationTool) => void
  drawInsetActive: boolean
  onDrawInsetToggle: () => void
  onInsertSymbol: (sym: string) => void
  onUndo: () => void
  onRedo: () => void
  onExportPNG: () => void
  onExportSVG: () => void
  onExportPDF: () => void
  onShareLink: () => void
}

// ── Tool button: 44×44 hit area, icon + label ────────────────────────────────
function TBtn({ title, label, icon, active, onClick }: {
  title: string; label: string; icon: React.ReactNode; active?: boolean; onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-[44px] h-[44px] flex flex-col items-center justify-center gap-[3px] rounded-lg transition-colors select-none ${
        active
          ? 'bg-[#EFF6FF] text-[#2563EB]'
          : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
      }`}
    >
      <div className="w-[20px] h-[20px] flex items-center justify-center shrink-0">{icon}</div>
      <span className={`text-[10px] font-medium leading-none tracking-tight ${active ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>
        {label}
      </span>
    </button>
  )
}

const Sep = () => <div className="w-px h-6 bg-[#E2E8F0] mx-1.5 shrink-0" />

export default function TopBar({
  docName, activeTool, onToolChange,
  drawInsetActive, onDrawInsetToggle, onInsertSymbol,
  onUndo, onRedo,
  onExportPNG, onExportSVG, onExportPDF, onShareLink,
}: Props) {
  const [exportOpen, setExportOpen] = useState(false)
  const [symOpen,    setSymOpen]    = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [isPro,      setIsPro]      = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const symRef    = useRef<HTMLDivElement>(null)

  useEffect(() => { setIsPro(isProUser()) }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false)
      if (!symRef.current?.contains(e.target as Node))    setSymOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleShare = () => {
    onShareLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="h-[64px] shrink-0 flex items-center gap-3 px-5 bg-white border-b border-[#E2E8F0] z-30 select-none">

      {/* ── Brand + doc name ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0" style={{ minWidth: 200 }}>
        <LogoFull size={30} textSize={17} />
        <div className="w-px h-5 bg-[#E2E8F0] shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-[#CBD5E1] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-[14px] font-medium text-[#0F172A] truncate max-w-[120px]">
            {docName || 'Untitled figure'}
          </span>
          <span className="hidden lg:flex items-center gap-1.5 text-[12px] text-emerald-500 font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Auto-saved
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0" />

      {/* ── Annotation toolbar center ─────────────────────────────────────── */}
      <div className="hidden md:flex items-center shrink-0">

        <TBtn title="Select  (V)" label="Select" icon={<IcSelect/>}
          active={activeTool==='select'} onClick={()=>onToolChange('select')}/>

        <Sep/>

        <TBtn title="Text  (T)"       label="Text"  icon={<IcText/>}
          active={activeTool==='text'} onClick={()=>onToolChange('text')}/>
        <TBtn title="Peak label  (P)" label="Peak"  icon={<IcPeak/>}
          active={activeTool==='peak'} onClick={()=>onToolChange('peak')}/>

        <Sep/>

        <TBtn title="Arrow"       label="Arrow"  icon={<IcArrow/>}
          active={activeTool==='arrow'}  onClick={()=>onToolChange('arrow')}/>
        <TBtn title="Line"        label="Line"   icon={<IcLine/>}
          active={activeTool==='line'}   onClick={()=>onToolChange('line')}/>
        <TBtn title="Dashed line" label="Dashed" icon={<IcDashed/>}
          active={activeTool==='dashed'} onClick={()=>onToolChange('dashed')}/>

        <Sep/>

        <TBtn title="Rectangle" label="Rect"    icon={<IcRect/>}
          active={activeTool==='rect'}    onClick={()=>onToolChange('rect')}/>
        <TBtn title="Ellipse"   label="Ellipse" icon={<IcEllipse/>}
          active={activeTool==='ellipse'} onClick={()=>onToolChange('ellipse')}/>

        <Sep/>

        <TBtn title="Zoom selection  (Z)" label="Zoom"  icon={<IcZoom/>}
          active={activeTool==='zoom'} onClick={()=>onToolChange('zoom')}/>
        <TBtn title="Add inset figure"    label="Inset" icon={<IcInset/>}
          active={drawInsetActive}      onClick={onDrawInsetToggle}/>

        <Sep/>

        {/* Symbols picker */}
        <div ref={symRef} className="relative">
          <button
            title="Insert scientific symbol"
            onClick={() => setSymOpen(v => !v)}
            className={`w-[44px] h-[44px] flex flex-col items-center justify-center gap-[3px] rounded-lg transition-colors select-none ${
              symOpen ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
            }`}
          >
            <span className="text-[18px] font-serif leading-none">Σ</span>
            <span className={`text-[10px] font-medium leading-none tracking-tight ${symOpen ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>
              Sym
            </span>
          </button>
          {symOpen && (
            <div className="absolute top-full mt-2 left-0 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-3 z-50" style={{ width: 232 }}>
              <p className="text-[11px] font-semibold text-[#64748B] mb-2.5">Scientific symbols</p>
              <div className="grid grid-cols-10 gap-1">
                {SYMBOLS.map(sym => (
                  <button key={sym} onClick={() => { onInsertSymbol(sym); setSymOpen(false) }}
                    className="w-[18px] h-[18px] text-[11px] text-[#64748B] flex items-center justify-center rounded hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors">
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0" />

      {/* ── Right actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onUndo} title="Undo  Ctrl+Z"
          className="w-[36px] h-[36px] hidden md:flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
          <IcUndo/>
        </button>
        <button onClick={onRedo} title="Redo  Ctrl+Shift+Z"
          className="w-[36px] h-[36px] hidden md:flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
          <IcRedo/>
        </button>

        <div className="hidden md:block w-px h-5 bg-[#E2E8F0] mx-1 shrink-0" />

        {/* Export dropdown */}
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setExportOpen(v => !v)}
            className="flex items-center gap-2 h-[36px] px-4 text-[13px] font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            <IcExport/>
            <span className="hidden sm:inline">Export</span>
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#E2E8F0] rounded-xl shadow-lg overflow-hidden z-50 min-w-[148px]">
              {([
                { label: 'PNG image',  action: onExportPNG },
                { label: 'SVG vector', action: onExportSVG },
                { label: 'PDF',        action: onExportPDF },
              ] as const).map(({ label, action }) => (
                <button key={label} onClick={() => { action(); setExportOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleShare}
          className="flex items-center gap-2 h-[36px] px-4 text-[13px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-colors shrink-0">
          {copied ? 'Copied!' : 'Share'}
        </button>

        <div className="w-[36px] h-[36px] rounded-full bg-[#F1F5F9] flex items-center justify-center text-[11px] font-bold text-[#64748B] shrink-0 border border-[#E2E8F0]">
          {isPro ? '★' : 'FR'}
        </div>
      </div>
    </header>
  )
}
