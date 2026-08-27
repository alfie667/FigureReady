'use client'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import ChartPreview from './ChartPreview'
import type { PanelLayout, PanelLabelConfig, ComposerConfig } from '@/lib/panels'
import { getLabelText, DEFAULT_LABEL_CONFIG, DEFAULT_COMPOSER_CONFIG } from '@/lib/panels'
import type { StyleName, StyleOverrides } from '@/lib/chartStyles'
import { useProjectStore, type PanelSlot } from '@/lib/projectStore'
import { loadDataForFigure } from '@/lib/projectStore'

// CSS column count per layout
const COLS: Record<PanelLayout, number> = { '1': 1, '2h': 2, '2v': 1, '4': 2, '3h': 3 }

// Default CSS panel widths (visual sizing only — real export resolution is driven by figureWidthMm + DPI)
// Each panel renders at the same size as the standalone full-screen view so figures look identical.
// The artboard scrolls horizontally when the composite is wider than the viewport.
const PANEL_W: Record<PanelLayout, number> = {
  '1': 700, '2h': 700, '2v': 700, '4': 620, '3h': 560,
}
// Responsive height: maintains ~440/700 aspect ratio from the ACS base style, min 280px.
const panelHeight = (w: number) => Math.max(Math.round(w * (440 / 700)), 280)

// ── PNG DPI injection ─────────────────────────────────────────────────────────

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function injectPngDpi(dataUrl: string, dpi: number): string {
  const binary = atob(dataUrl.split(',')[1])
  const src = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) src[i] = binary.charCodeAt(i)
  const ppm = Math.round(dpi / 0.0254)
  const chunk = new Uint8Array(21)
  chunk[3] = 9
  chunk[4] = 0x70; chunk[5] = 0x48; chunk[6] = 0x59; chunk[7] = 0x73 // "pHYs"
  chunk[8]  = (ppm >>> 24) & 0xff; chunk[9]  = (ppm >>> 16) & 0xff
  chunk[10] = (ppm >>>  8) & 0xff; chunk[11] = ppm & 0xff
  chunk[12] = chunk[8]; chunk[13] = chunk[9]; chunk[14] = chunk[10]; chunk[15] = chunk[11]
  chunk[16] = 1 // unit = metre
  const crc = crc32(chunk.slice(4, 17))
  chunk[17] = (crc >>> 24) & 0xff; chunk[18] = (crc >>> 16) & 0xff
  chunk[19] = (crc >>>  8) & 0xff; chunk[20] = crc & 0xff
  const out = new Uint8Array(src.length + 21)
  out.set(src.slice(0, 33)); out.set(chunk, 33); out.set(src.slice(33), 54)
  let str = ''
  out.forEach(b => { str += String.fromCharCode(b) })
  return 'data:image/png;base64,' + btoa(str)
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  slots: PanelSlot[]
  layout: PanelLayout
  activePanel: number
  styleName: StyleName
  figureStyleOverrides: StyleOverrides
  labelConfig?: PanelLabelConfig
  composerConfig?: ComposerConfig
  onPanelClick: (idx: number, figureId: string | null) => void
  onSaveTemplate?: () => void
}

export interface MultiPanelPreviewHandle {
  exportPNG: (dpi?: number) => Promise<void>
}

// ── Component ─────────────────────────────────────────────────────────────────

const MultiPanelPreview = forwardRef<MultiPanelPreviewHandle, Props>(function MultiPanelPreview({
  slots, layout, activePanel, styleName,
  figureStyleOverrides,
  labelConfig  = DEFAULT_LABEL_CONFIG,
  composerConfig = DEFAULT_COMPOSER_CONFIG,
  onPanelClick,
}: Props, ref) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)

  // Resolve figures from the store
  const storeFigures   = useProjectStore(s => s.figures)
  const updateFigure   = useProjectStore(s => s.updateFigure)

  const cols   = COLS[layout]
  const panelW = PANEL_W[layout]
  const panelH = panelHeight(panelW)
  const { gapH, gapV, paddingH, paddingV, figureWidthMm } =
    { ...DEFAULT_COMPOSER_CONFIG, ...composerConfig }

  const handleExport = async (dpi = 300) => {
    if (!gridRef.current || exporting) return
    setExporting(true)
    const el     = gridRef.current
    const parent = el.parentElement
    const prevOverflow = parent?.style.overflow ?? ''
    if (parent) parent.style.overflow = 'visible'
    // Let the browser repaint before capture
    await new Promise<void>(r => setTimeout(r, 150))
    try {
      const cssWidth = el.scrollWidth || el.getBoundingClientRect().width
      const targetPx   = (figureWidthMm / 25.4) * dpi
      const pixelRatio = cssWidth > 0 ? targetPx / cssWidth : dpi / 96
      const raw = await toPng(el, {
        pixelRatio,
        backgroundColor: 'white',
        width: el.scrollWidth,
        height: el.scrollHeight,
        style: { boxShadow: 'none', borderRadius: '0', border: 'none' },
      })
      const url = injectPngDpi(raw, dpi)
      const a = document.createElement('a')
      a.href = url
      a.download = `figure-multipanel-${dpi}dpi.png`
      a.click()
    } catch (e) {
      console.error('Multi-panel export failed', e)
      alert('Export failed — see browser console for details.')
    } finally {
      if (parent) parent.style.overflow = prevOverflow
      setExporting(false)
    }
  }

  useImperativeHandle(ref, () => ({ exportPNG: handleExport }))

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Export loading overlay */}
      {exporting && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, border: '3px solid #e2e8f0',
            borderTop: '3px solid #2563eb', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', fontFamily: 'Arial, sans-serif' }}>
            Generating PNG…
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {/* Workspace — text-align:center so inline-block artboard centers when it fits,
           and overflows to the RIGHT (not left) when wider than the viewport.
           flex justify-center caused left-side clipping on 1280–1440px screens. */}
      <div className="flex-1 overflow-auto bg-slate-100 p-6 lg:p-10" style={{ textAlign: 'center' }}>
        <div
          ref={gridRef}
          style={{
            background: 'white',
            padding: `${paddingV}px ${paddingH}px`,
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 20px 80px rgba(0,0,0,0.16)',
            display: 'inline-block',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, ${panelW}px)`,
              columnGap: gapH,
              rowGap: gapV,
            }}
          >
            {slots.map((slot, i) => {
              // Resolve the figure from the store
              const fig = slot.figureId
                ? storeFigures.find(f => f.id === slot.figureId) ?? null
                : null

              // Merge data from separate storage if the store copy is empty
              const figData = fig
                ? (fig.data.length > 0 ? fig.data : loadDataForFigure(fig.id))
                : []

              const effectiveStyle: StyleOverrides = { ...figureStyleOverrides, ...(fig?.styleOverrides ?? {}) }
              const labelText = getLabelText(i, labelConfig)
              const labelFont = effectiveStyle.fontFamily ?? 'Arial, Helvetica, sans-serif'
              const isTop   = labelConfig.position.startsWith('top')
              const isRight = labelConfig.position.endsWith('right')

              const labelEl = labelText ? (
                <div style={{
                  fontFamily: labelFont,
                  fontWeight: 700,
                  fontSize: labelConfig.fontSize,
                  color: '#1a1a1a',
                  lineHeight: 1,
                  userSelect: 'none',
                  textAlign: isRight ? 'right' : 'left',
                }}>
                  {labelText}
                </div>
              ) : null

              const hasFigure = fig && figData.length > 0 && fig.yCols.length > 0

              return (
                <div
                  key={slot.id}
                  onClick={() => onPanelClick(i, slot.figureId)}
                  onMouseEnter={() => setHoveredPanel(i)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    width: panelW,
                    cursor: 'pointer',
                    borderRadius: 8,
                    outline: exporting ? 'none' : i === activePanel
                      ? '1.5px solid #3b82f6'
                      : (i === hoveredPanel ? '1px solid rgba(0,0,0,0.12)' : 'none'),
                    outlineOffset: 3,
                    transition: 'outline-color 0.15s',
                  }}
                >
                  {isTop && labelEl}

                  {hasFigure ? (
                    <ChartPreview
                      data={figData}
                      xCol={fig.xCol}
                      yCols={fig.yCols}
                      seriesNames={fig.seriesNames}
                      errorCols={fig.errorCols}
                      xAxisLabel={fig.xAxisLabel}
                      yAxisLabel={fig.yAxisLabel}
                      chartType={fig.chartType}
                      styleName={styleName}
                      styleOverrides={effectiveStyle}
                      annotations={fig.annotations}
                      onAnnotationsChange={(anns) =>
                        updateFigure(fig.id, { annotations: anns })
                      }
                      onStyleChange={(patch) =>
                        updateFigure(fig.id, {
                          styleOverrides: { ...fig.styleOverrides, ...patch },
                        })
                      }
                      compact
                      panelWidth={panelW}
                      panelHeight={panelH}
                    />
                  ) : slot.figureId ? (
                    // Figure assigned but no data yet
                    <div style={{
                      width: panelW, height: panelH,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f9fafb', borderRadius: 8,
                    }}>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Arial, sans-serif' }}>
                        No data yet — open the Data panel
                      </span>
                    </div>
                  ) : (
                    // Empty slot — invite user to click
                    <div style={{
                      width: panelW, height: panelH,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 10,
                      background: i === hoveredPanel ? '#eff6ff' : '#f8fafc',
                      borderRadius: 8,
                      border: `2px dashed ${i === hoveredPanel ? '#3b82f6' : '#cbd5e1'}`,
                      transition: 'background 0.15s, border-color 0.15s',
                      cursor: 'pointer',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: i === hoveredPanel ? '#dbeafe' : '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, color: i === hoveredPanel ? '#3b82f6' : '#94a3b8',
                        fontWeight: 300, lineHeight: 1,
                        transition: 'background 0.15s, color 0.15s',
                      }}>+</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: i === hoveredPanel ? '#3b82f6' : '#64748b', fontFamily: 'Arial, sans-serif' }}>
                          Add a figure
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>
                          Click to upload Excel or use demo data
                        </div>
                      </div>
                    </div>
                  )}

                  {!isTop && labelEl}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})

export default MultiPanelPreview
