'use client'

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import ChartPreview from './ChartPreview'
import type { CanvasItem, PanelLayout } from '@/lib/panels'
import type { StyleName, StyleOverrides } from '@/lib/chartStyles'
import { useProjectStore, type PanelSlot, loadDataForFigure } from '@/lib/projectStore'

// ── Constants ─────────────────────────────────────────────────────────────────

const CANVAS_W = 860
const CANVAS_H = 540
// Handle bar sits INSIDE the item at the top — chart fills the rest.
const HANDLE_H = 24
const CORNER = 9
const LAYOUT_COLS: Record<PanelLayout, number> = { '1': 1, '2h': 2, '2v': 1, '4': 2, '3h': 3 }

function defaultFigPos(idx: number, layout: PanelLayout): Pick<CanvasItem, 'x' | 'y' | 'width' | 'height'> {
  const cols = LAYOUT_COLS[layout] ?? 2
  const w = Math.round((CANVAS_W - 40 - (cols - 1) * 20) / cols)
  // Include HANDLE_H in total height so chart area = h - HANDLE_H (square-ish)
  const chartH = Math.round(w * 0.62)
  const h = chartH + HANDLE_H
  return {
    x: 20 + (idx % cols) * (w + 20),
    y: 20 + Math.floor(idx / cols) * (h + 20),
    width: w,
    height: h,
  }
}

type Dir = 'nw' | 'ne' | 'se' | 'sw'
const DIRS: Dir[] = ['nw', 'ne', 'se', 'sw']

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  slots: PanelSlot[]
  layout: PanelLayout
  items: CanvasItem[]
  styleName: StyleName
  figureStyleOverrides: StyleOverrides
  onUpdateItem: (id: string, patch: Partial<CanvasItem>) => void
  onAddText: () => void
  onRemoveItem: (id: string) => void
}

export interface FreeCanvasHandle {
  exportPNG: (dpi?: number) => Promise<void>
}

// ── FreeCanvas ────────────────────────────────────────────────────────────────

const FreeCanvas = forwardRef<FreeCanvasHandle, Props>(function FreeCanvas(
  { slots, layout, items, styleName, figureStyleOverrides, onUpdateItem, onAddText, onRemoveItem },
  ref,
) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const storeFigures = useProjectStore(s => s.figures)
  const updateFigure = useProjectStore(s => s.updateFigure)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleExport = async (dpi = 300) => {
    if (!canvasRef.current) return
    try {
      const rect = canvasRef.current.getBoundingClientRect()
      const pixelRatio = rect.width > 0 ? (180 / 25.4 * dpi) / rect.width : dpi / 96
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio,
        backgroundColor: 'white',
        style: { borderRadius: '0', boxShadow: 'none' },
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `figure-canvas-${dpi}dpi.png`
      a.click()
    } catch (e) {
      console.error('FreeCanvas export failed', e)
    }
  }

  useImperativeHandle(ref, () => ({ exportPNG: handleExport }))

  // Build full item list: figure items (defaults if not stored) + text items
  const allItems: CanvasItem[] = [
    ...slots.map((slot, i) =>
      items.find(it => it.id === slot.id && it.type === 'figure') ??
      ({ ...defaultFigPos(i, layout), id: slot.id, type: 'figure' as const })
    ),
    ...items.filter(it => it.type === 'text'),
  ]

  const deselect = () => { setSelectedId(null); setEditingId(null) }

  return (
    <div
      className="flex-1 overflow-auto bg-slate-100 p-6 lg:p-10"
      style={{ textAlign: 'center', minHeight: 0 }}
      onClick={deselect}
    >
      {/* White page canvas */}
      <div
        ref={canvasRef}
        style={{
          display: 'inline-block',
          position: 'relative',
          width: CANVAS_W,
          minHeight: CANVAS_H,
          background: 'white',
          textAlign: 'left',
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.10), 0 32px 80px rgba(0,0,0,0.08)',
        }}
      >
        {allItems.map(item => {
          const selected = selectedId === item.id
          const editing = editingId === item.id

          // Resolve figure content for figure-type items
          let figContent: React.ReactNode = null
          if (item.type === 'figure') {
            const slot = slots.find(s => s.id === item.id)
            const fig = slot?.figureId
              ? storeFigures.find(f => f.id === slot.figureId) ?? null
              : null
            if (fig) {
              const figData = fig.data.length > 0 ? fig.data : loadDataForFigure(fig.id)
              const effectiveStyle: StyleOverrides = { ...figureStyleOverrides, ...(fig.styleOverrides ?? {}) }
              const chartH = item.height - HANDLE_H
              figContent = figData.length > 0 && fig.yCols.length > 0 ? (
                <ChartPreview
                  compact
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
                  onAnnotationsChange={anns => updateFigure(fig.id, { annotations: anns })}
                  onStyleChange={patch => updateFigure(fig.id, { styleOverrides: { ...fig.styleOverrides, ...patch } })}
                  panelWidth={item.width}
                  panelHeight={chartH}
                />
              ) : (
                <div style={emptyFigStyle(item.width, chartH)}>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Arial, sans-serif' }}>No data</span>
                </div>
              )
            } else {
              figContent = (
                <div style={emptyFigStyle(item.width, item.height - HANDLE_H)}>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Arial, sans-serif' }}>Empty slot</span>
                </div>
              )
            }
          }

          return (
            <CanvasBox
              key={item.id}
              item={item}
              selected={selected}
              editing={editing}
              onSelect={() => { setSelectedId(item.id); setEditingId(null) }}
              onStartEdit={() => setEditingId(item.id)}
              onStopEdit={() => setEditingId(null)}
              onUpdate={patch => onUpdateItem(item.id, patch)}
              onRemove={() => { onRemoveItem(item.id); setSelectedId(null) }}
            >
              {figContent}
            </CanvasBox>
          )
        })}

        {/* Add text floating button */}
        <button
          onClick={e => { e.stopPropagation(); onAddText() }}
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 16px',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            color: '#64748b',
            cursor: 'pointer',
            boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1, color: '#3b82f6' }}>T</span>
          Ajouter du texte
        </button>
      </div>
    </div>
  )
})

export default FreeCanvas

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyFigStyle(w: number, h: number): React.CSSProperties {
  return { width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }
}

// ── Canvas item box ───────────────────────────────────────────────────────────

function CanvasBox({
  item, selected, editing,
  onSelect, onStartEdit, onStopEdit,
  onUpdate, onRemove, children,
}: {
  item: CanvasItem
  selected: boolean
  editing: boolean
  onSelect: () => void
  onStartEdit: () => void
  onStopEdit: () => void
  onUpdate: (p: Partial<CanvasItem>) => void
  onRemove: () => void
  children?: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const resRef = useRef<{ sx: number; sy: number; ox: number; oy: number; ow: number; oh: number; dir: Dir } | null>(null)
  const txtRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && txtRef.current) {
      txtRef.current.focus()
      const len = txtRef.current.value.length
      txtRef.current.setSelectionRange(len, len)
    }
  }, [editing])

  // ── Drag (pointer capture on handle bar) ─────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editing) return
    e.stopPropagation()
    onSelect()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: item.x, oy: item.y }
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    onUpdate({
      x: Math.max(0, dragRef.current.ox + e.clientX - dragRef.current.sx),
      y: Math.max(0, dragRef.current.oy + e.clientY - dragRef.current.sy),
    })
  }
  const handlePointerUp = () => { dragRef.current = null }

  // ── Resize (pointer capture on corner handles) ────────────────────────────────

  const cornerPointerDown = (e: React.PointerEvent<HTMLDivElement>, dir: Dir) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    resRef.current = { sx: e.clientX, sy: e.clientY, ox: item.x, oy: item.y, ow: item.width, oh: item.height, dir }
  }
  const cornerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resRef.current) return
    const { sx, sy, ox, oy, ow, oh, dir } = resRef.current
    const dx = e.clientX - sx, dy = e.clientY - sy
    const minW = item.type === 'figure' ? 160 : 80
    const minH = item.type === 'figure' ? HANDLE_H + 80 : 36
    let nx = ox, ny = oy, nw = ow, nh = oh
    if (dir.includes('e')) nw = Math.max(minW, ow + dx)
    if (dir.includes('s')) nh = Math.max(minH, oh + dy)
    if (dir.includes('w')) { nw = Math.max(minW, ow - dx); nx = ox + ow - nw }
    if (dir.includes('n')) { nh = Math.max(minH, oh - dy); ny = oy + oh - nh }
    onUpdate({ x: nx, y: ny, width: nw, height: nh })
  }
  const cornerPointerUp = () => { resRef.current = null }

  // ── Render ───────────────────────────────────────────────────────────────────

  const isActive = selected || hovered

  return (
    <div
      onClick={e => { e.stopPropagation(); onSelect() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        zIndex: selected ? 10 : 1,
        // Selection/hover border around the whole item
        outline: selected
          ? '2px solid #3b82f6'
          : hovered
          ? '1.5px dashed #94a3b8'
          : 'none',
        outlineOffset: 2,
        borderRadius: item.type === 'text' ? 4 : 6,
      }}
    >
      {/* ── Handle bar (inside item, at top, always takes space) ────────────── */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: HANDLE_H,
          // Always present so chart position never jumps. Subtle when inactive.
          background: selected ? '#3b82f6' : isActive ? '#f1f5f9' : 'transparent',
          borderRadius: '6px 6px 0 0',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          paddingRight: 6,
          gap: 5,
          userSelect: 'none',
          transition: 'background 0.15s',
          borderBottom: isActive ? '1px solid #e2e8f0' : 'none',
          zIndex: 4,
        }}
      >
        {/* Grip icon */}
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
          {[0, 4].map(cx => [1, 5, 9].map(cy => (
            <circle key={`${cx}-${cy}`} cx={cx + 1} cy={cy + 1} r={1.1} fill={selected ? 'white' : '#94a3b8'} />
          )))}
        </svg>
        <span style={{
          flex: 1,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: selected ? 'white' : '#64748b',
          fontFamily: 'Arial, sans-serif',
        }}>
          {item.type === 'figure' ? `Panel ${item.id}` : 'Texte'}
        </span>
        {/* Delete — text items only */}
        {selected && item.type === 'text' && (
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            style={{
              width: 16, height: 16, borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)', border: 'none',
              cursor: 'pointer', color: 'white', fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {/* ── Text format toolbar (text items, selected but not editing) ─────── */}
      {item.type === 'text' && selected && !editing && (
        <TextToolbar item={item} onUpdate={onUpdate} />
      )}

      {/* ── Figure content (compact ChartPreview, stable position) ────────── */}
      {item.type === 'figure' && (
        <div style={{
          position: 'absolute',
          top: HANDLE_H,     // always below the handle — never jumps
          left: 0,
          width: item.width,
          height: item.height - HANDLE_H,
          overflow: 'hidden',
          borderRadius: '0 0 6px 6px',
        }}>
          {children}
        </div>
      )}

      {/* ── Text content ───────────────────────────────────────────────────── */}
      {item.type === 'text' && (
        <div style={{
          position: 'absolute',
          top: HANDLE_H,
          left: 0,
          width: '100%',
          height: item.height - HANDLE_H,
        }}>
          {editing ? (
            <textarea
              ref={txtRef}
              defaultValue={item.text ?? ''}
              onBlur={e => { onUpdate({ text: e.target.value }); onStopEdit() }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', height: '100%',
                fontFamily: item.fontFamily ?? 'Arial, sans-serif',
                fontSize: item.fontSize ?? 14,
                fontWeight: item.bold ? 700 : 400,
                fontStyle: item.italic ? 'italic' : 'normal',
                color: item.color ?? '#1a1a1a',
                border: 'none', outline: 'none',
                resize: 'none', background: 'transparent',
                padding: '4px 10px',
                boxSizing: 'border-box',
                lineHeight: 1.45,
              }}
            />
          ) : (
            <div
              onDoubleClick={e => { e.stopPropagation(); onStartEdit() }}
              style={{
                width: '100%', height: '100%',
                padding: '4px 10px',
                fontFamily: item.fontFamily ?? 'Arial, sans-serif',
                fontSize: item.fontSize ?? 14,
                fontWeight: item.bold ? 700 : 400,
                fontStyle: item.italic ? 'italic' : 'normal',
                color: item.color ?? '#1a1a1a',
                lineHeight: 1.45,
                cursor: 'default',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                boxSizing: 'border-box',
              }}
            >
              {item.text || (
                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>
                  Double-cliquez pour éditer…
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Resize corners (when selected) ─────────────────────────────────── */}
      {selected && DIRS.map(dir => {
        const n = dir[0] === 'n', w = dir[1] === 'w'
        return (
          <div
            key={dir}
            onPointerDown={e => { e.stopPropagation(); cornerPointerDown(e, dir) }}
            onPointerMove={e => { e.stopPropagation(); cornerPointerMove(e) }}
            onPointerUp={e => { e.stopPropagation(); cornerPointerUp() }}
            style={{
              position: 'absolute',
              width: CORNER, height: CORNER,
              background: 'white',
              border: '2px solid #3b82f6',
              borderRadius: 2,
              cursor: `${dir}-resize`,
              zIndex: 20,
              ...(n ? { top: -CORNER / 2 } : { bottom: -CORNER / 2 }),
              ...(w ? { left: -CORNER / 2 } : { right: -CORNER / 2 }),
            }}
          />
        )
      })}
    </div>
  )
}

// ── Text format toolbar ───────────────────────────────────────────────────────

const FONT_SIZES = [9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48]

function TextToolbar({ item, onUpdate }: { item: CanvasItem; onUpdate: (p: Partial<CanvasItem>) => void }) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: -42,
        left: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '4px 8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        whiteSpace: 'nowrap',
      }}
    >
      <select
        value={item.fontSize ?? 14}
        onChange={e => onUpdate({ fontSize: Number(e.target.value) })}
        style={{ fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 4px', width: 48, cursor: 'pointer' }}
      >
        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 2px' }} />
      <button onClick={() => onUpdate({ bold: !item.bold })} style={toolBtnStyle(!!item.bold)} title="Gras">
        <strong>B</strong>
      </button>
      <button onClick={() => onUpdate({ italic: !item.italic })} style={toolBtnStyle(!!item.italic)} title="Italique">
        <em>I</em>
      </button>
      <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 2px' }} />
      <label title="Couleur" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
        <div style={{
          width: 20, height: 20, borderRadius: 4,
          background: item.color ?? '#1a1a1a',
          border: '2px solid #e2e8f0',
        }} />
        <input
          type="color"
          value={item.color ?? '#1a1a1a'}
          onChange={e => onUpdate({ color: e.target.value })}
          style={{ position: 'absolute', opacity: 0, width: 20, height: 20, cursor: 'pointer' }}
        />
      </label>
    </div>
  )
}

function toolBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 24, height: 24, borderRadius: 4,
    border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
    background: active ? '#eff6ff' : 'white',
    color: active ? '#3b82f6' : '#475569',
    cursor: 'pointer', fontSize: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
  }
}
