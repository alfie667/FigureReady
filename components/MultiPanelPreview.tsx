'use client'
import { useRef } from 'react'
import { toPng } from 'html-to-image'
import ChartPreview from './ChartPreview'
import type { PanelConfig, PanelLayout } from '@/lib/panels'
import { PANEL_LABELS } from '@/lib/panels'
import type { StyleName, StyleOverrides } from '@/lib/chartStyles'
import type { ChartAnnotation } from '@/lib/annotations'

const PANEL_W: Record<PanelLayout, number> = {
  '1':  700,
  '2h': 560,
  '2v': 700,
  '4':  560,
}
const COLS: Record<PanelLayout, number> = { '1': 1, '2h': 2, '2v': 1, '4': 2 }
const PANEL_H = 440
const GAP = 20

interface Props {
  panels: PanelConfig[]
  layout: PanelLayout
  activePanel: number
  styleName: StyleName
  panelAnnotations: ChartAnnotation[][]
  onAnnotationsChange: (idx: number, anns: ChartAnnotation[]) => void
  onStyleChange: (idx: number, patch: Partial<StyleOverrides>) => void
  onPanelClick: (idx: number) => void
  onSaveTemplate?: () => void
}

export default function MultiPanelPreview({
  panels, layout, activePanel, styleName,
  panelAnnotations, onAnnotationsChange, onStyleChange, onPanelClick,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const cols = COLS[layout]
  const panelW = PANEL_W[layout]

  const handleExport = async () => {
    if (!gridRef.current) return
    try {
      const url = await toPng(gridRef.current, { pixelRatio: 300 / 96, backgroundColor: 'white' })
      const a = document.createElement('a')
      a.href = url
      a.download = 'figure-multipanel.png'
      a.click()
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border-b border-slate-200 shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <p className="text-xs text-slate-500 font-medium">
          Multi-panel — click a panel to edit it
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#5b21b6] transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PNG · 300 DPI
        </button>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-auto bg-[#f5f3ff] flex items-start justify-center p-6 lg:p-10">
        <div
          ref={gridRef}
          style={{
            background: 'white',
            padding: 24,
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 20px 80px rgba(0,0,0,0.16)',
            display: 'inline-block',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, ${panelW}px)`,
              gap: GAP,
            }}
          >
            {panels.map((panel, i) => (
              <div
                key={panel.id}
                onClick={() => onPanelClick(i)}
                style={{
                  position: 'relative',
                  width: panelW,
                  cursor: 'pointer',
                  borderRadius: 8,
                  outline: i === activePanel ? '2px solid #7c3aed' : '2px solid transparent',
                  outlineOffset: 3,
                  transition: 'outline-color 0.15s',
                }}
              >
                {/* Panel label */}
                <div style={{
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontWeight: 700, fontSize: 13,
                  color: '#1a1a1a', marginBottom: 4,
                  lineHeight: 1, userSelect: 'none',
                }}>
                  {PANEL_LABELS[i]}
                </div>

                {/* Chart or placeholder */}
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
                    styleOverrides={panel.styleOverrides}
                    annotations={panelAnnotations[i] ?? []}
                    onAnnotationsChange={(anns) => onAnnotationsChange(i, anns)}
                    onStyleChange={(patch) => onStyleChange(i, patch)}
                    compact
                  />
                ) : (
                  <div style={{
                    width: panelW, height: PANEL_H,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 8, background: '#f8f7ff', borderRadius: 8,
                    border: '2px dashed #c4b5fd',
                  }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#c4b5fd" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>
                      Panel {panel.id} — no data
                    </p>
                    <p style={{ fontSize: 11, color: '#c4b5fd', fontFamily: 'Arial, sans-serif' }}>
                      Select this panel and upload a file
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
