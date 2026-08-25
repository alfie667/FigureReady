'use client'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import ChartPreview from './ChartPreview'
import type { PanelConfig, PanelLayout, PanelLabelConfig, ComposerConfig } from '@/lib/panels'
import { getLabelText, DEFAULT_LABEL_CONFIG, DEFAULT_COMPOSER_CONFIG } from '@/lib/panels'
import type { StyleName, StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'

// CSS column count per layout
const COLS: Record<PanelLayout, number> = { '1': 1, '2h': 2, '2v': 1, '4': 2, '3h': 3 }

// Default CSS panel widths (visual sizing only — real export resolution is driven by figureWidthMm + DPI)
const PANEL_W: Record<PanelLayout, number> = {
  '1': 700, '2h': 540, '2v': 700, '4': 540, '3h': 380,
}
const PANEL_H = 440

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
  panels: PanelConfig[]
  layout: PanelLayout
  activePanel: number
  styleName: StyleName
  figureStyleOverrides: StyleOverrides
  labelConfig?: PanelLabelConfig
  composerConfig?: ComposerConfig
  onAnnotationsChange: (idx: number, anns: ChartAnnotation[]) => void
  onStyleChange: (idx: number, patch: Partial<StyleOverrides>) => void
  onPanelClick: (idx: number) => void
  onSaveTemplate?: () => void
}

export interface MultiPanelPreviewHandle {
  exportPNG: (dpi?: number) => Promise<void>
}

// ── Component ─────────────────────────────────────────────────────────────────

const MultiPanelPreview = forwardRef<MultiPanelPreviewHandle, Props>(function MultiPanelPreview({
  panels, layout, activePanel, styleName,
  figureStyleOverrides,
  labelConfig  = DEFAULT_LABEL_CONFIG,
  composerConfig = DEFAULT_COMPOSER_CONFIG,
  onAnnotationsChange, onStyleChange, onPanelClick,
}: Props, ref) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null)

  const cols   = COLS[layout]
  const panelW = PANEL_W[layout]
  const { gapH, gapV, paddingH, paddingV, figureWidthMm } =
    { ...DEFAULT_COMPOSER_CONFIG, ...composerConfig }

  const handleExport = async (dpi = 300) => {
    if (!gridRef.current) return
    const el     = gridRef.current
    const parent = el.parentElement
    const prevOverflow = parent?.style.overflow ?? ''
    if (parent) parent.style.overflow = 'visible'
    await new Promise<void>(r => setTimeout(r, 100))
    try {
      const cssWidth = el.getBoundingClientRect().width
      // Real resolution: pixelWidth = figureWidthMm / 25.4 * dpi
      const targetPx   = (figureWidthMm / 25.4) * dpi
      const pixelRatio = cssWidth > 0 ? targetPx / cssWidth : dpi / 96
      const raw = await toPng(el, {
        pixelRatio,
        backgroundColor: 'white',
        style: { boxShadow: 'none', borderRadius: '0', border: 'none' },
      })
      const url = injectPngDpi(raw, dpi)
      const a = document.createElement('a')
      a.href = url
      a.download = `figure-multipanel-${dpi}dpi.png`
      a.click()
    } catch (e) {
      console.error('Multi-panel export failed', e)
    } finally {
      if (parent) parent.style.overflow = prevOverflow
    }
  }

  useImperativeHandle(ref, () => ({ exportPNG: handleExport }))

  return (
    <div className="flex-1 flex flex-col min-h-0">
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
            {panels.map((panel, i) => {
              const effectiveStyle: StyleOverrides = { ...figureStyleOverrides, ...panel.styleOverrides }
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

              return (
                <div
                  key={panel.id}
                  onClick={() => onPanelClick(i)}
                  onMouseEnter={() => setHoveredPanel(i)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    width: panelW,
                    cursor: 'pointer',
                    borderRadius: 8,
                    outline: i === activePanel
                      ? '1.5px solid #3b82f6'
                      : (i === hoveredPanel ? '1px solid rgba(0,0,0,0.12)' : 'none'),
                    outlineOffset: 3,
                    transition: 'outline-color 0.15s',
                  }}
                >
                  {isTop && labelEl}

                  {panel.data.length > 0 && panel.yCols.length > 0 ? (
                    <ChartPreview
                      data={panel.data}
                      xCol={panel.xCol}
                      yCols={panel.yCols}
                      seriesNames={panel.seriesNames}
                      errorCols={panel.errorCols}
                      xAxisLabel={panel.xAxisLabel}
                      yAxisLabel={panel.yAxisLabel}
                      chartType={panel.chartType}
                      styleName={styleName}
                      styleOverrides={effectiveStyle}
                      annotations={panel.annotations}
                      onAnnotationsChange={(anns) => onAnnotationsChange(i, anns)}
                      onStyleChange={(patch) => onStyleChange(i, patch)}
                      compact
                      panelWidth={panelW}
                      panelHeight={PANEL_H}
                    />
                  ) : (
                    <div style={{
                      width: panelW, height: PANEL_H,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f9fafb', borderRadius: 8,
                    }}>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Arial, sans-serif' }}>
                        + Add panel
                      </span>
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
