'use client'
import { useState, useEffect, useRef } from 'react'
import type {
  ChartAnnotation, TextAnnotation, ArrowAnnotation,
  LineAnnotation, RectAnnotation, EllipseAnnotation, PeakLabelAnnotation,
} from '@/lib/annotations'

export type AnnotationTool = 'select' | 'text' | 'peak' | 'arrow' | 'line' | 'dashed' | 'rect' | 'ellipse' | 'zoom'

type DragState =
  | { kind: 'draw'; tool: AnnotationTool; ghostId: string; startXPct: number; startYPct: number }
  | { kind: 'move-text'; id: string; offsetXPct: number; offsetYPct: number }
  | { kind: 'move-line'; id: string; dx1: number; dy1: number; dx2: number; dy2: number }
  | { kind: 'move-box'; id: string; offsetXPct: number; offsetYPct: number }
  | { kind: 'move-peak'; id: string; offsetXPct: number; offsetYPct: number; anchorXPct: number; anchorYPct: number }
  | { kind: 'resize-endpoint'; id: string; endpoint: 1 | 2 }
  | { kind: 'resize-corner'; id: string; anchorXPct: number; anchorYPct: number }
  | { kind: 'pending'; inner: DragState; x0: number; y0: number }

export interface UseAnnotationInteractionOptions {
  annotations: ChartAnnotation[]
  onAnnotationsChange: (anns: ChartAnnotation[]) => void
  chartRef: React.RefObject<HTMLDivElement | null>
  plotAreaRef: React.RefObject<{ left: number; top: number; width: number; height: number }>
  isTouch: boolean
}

export interface UseAnnotationInteractionResult {
  activeTool: AnnotationTool
  selectedId: string | null
  editingId: string | null
  isDragging: boolean
  drawGhost: ChartAnnotation | null
  activeSnapGuides: { x: number | null; y: number | null }
  setActiveTool: (tool: AnnotationTool) => void
  setSelectedId: (id: string | null) => void
  setEditingId: (id: string | null) => void
  updateAnnotation: (id: string, changes: Record<string, unknown>) => void
  removeAnnotation: (id: string) => void
  insertSymbol: (sym: string) => void
  // DOM ref registration (called from JSX ref callbacks)
  registerTextEl: (id: string, el: HTMLDivElement | null) => void
  registerLineHitbox: (id: string, el: SVGLineElement | null) => void
  registerLineVisual: (id: string, el: SVGLineElement | null) => void
  registerLineEp: (id: string, ep: 1 | 2, el: SVGCircleElement | null) => void
  registerBoxEl: (id: string, el: HTMLDivElement | null) => void
  registerPeakLabel: (id: string, el: SVGTextElement | null) => void
  registerPeakLeader: (id: string, el: SVGLineElement | null) => void
  registerPeakHitbox: (id: string, el: SVGRectElement | null) => void
  // Event handlers
  handleContainerPointerMove: (e: React.PointerEvent) => void
  handleContainerPointerUp: (e: React.PointerEvent) => void
  handleContainerClick: () => void
  handleDrawPointerDown: (e: React.PointerEvent) => void
  // Drag starters for existing annotations (select mode)
  startMoveText: (e: React.PointerEvent, ann: TextAnnotation) => void
  startMoveLine: (e: React.PointerEvent, ann: ArrowAnnotation | LineAnnotation) => void
  startMoveBox: (e: React.PointerEvent, ann: RectAnnotation | EllipseAnnotation) => void
  startMovePeak: (e: React.PointerEvent, ann: PeakLabelAnnotation, anchorXPct: number, anchorYPct: number) => void
  startResizeLineEndpoint: (e: React.PointerEvent, ann: ArrowAnnotation | LineAnnotation, ep: 1 | 2) => void
  startResizeBoxCorner: (e: React.PointerEvent, ann: RectAnnotation | EllipseAnnotation, corner: 'nw' | 'ne' | 'sw' | 'se') => void
}

const MAX_HISTORY = 50

function makeId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `ann-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useAnnotationInteraction({
  annotations,
  onAnnotationsChange,
  chartRef,
  plotAreaRef,
  isTouch,
}: UseAnnotationInteractionOptions): UseAnnotationInteractionResult {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTool, _setActiveTool] = useState<AnnotationTool>('select')
  const [selectedId, _setSelectedId] = useState<string | null>(null)
  const [editingId, _setEditingId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [drawGhost, setDrawGhost] = useState<ChartAnnotation | null>(null)
  const [activeSnapGuides, setActiveSnapGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null })

  // Stable refs (avoid stale closures in event handlers)
  const activeToolRef = useRef<AnnotationTool>('select')
  const selectedIdRef = useRef<string | null>(null)
  const editingIdRef = useRef<string | null>(null)
  const annotationsRef = useRef(annotations)
  const onAnnotationsChangeRef = useRef(onAnnotationsChange)
  const snapGuidesRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })
  const undoStackRef = useRef<ChartAnnotation[][]>([])
  const redoStackRef = useRef<ChartAnnotation[][]>([])
  const preDragSnapshotRef = useRef<ChartAnnotation[] | null>(null)
  const clipboardRef = useRef<ChartAnnotation | null>(null)

  useEffect(() => { annotationsRef.current = annotations }, [annotations])
  useEffect(() => { onAnnotationsChangeRef.current = onAnnotationsChange }, [onAnnotationsChange])

  const setActiveTool = (tool: AnnotationTool) => { activeToolRef.current = tool; _setActiveTool(tool) }
  const setSelectedId = (id: string | null) => { selectedIdRef.current = id; _setSelectedId(id) }
  const setEditingId = (id: string | null) => { editingIdRef.current = id; _setEditingId(id) }

  const _apply = (anns: ChartAnnotation[]) => onAnnotationsChangeRef.current(anns)
  const pushToHistory = (snapshot: ChartAnnotation[]) => {
    undoStackRef.current = [...undoStackRef.current, snapshot].slice(-MAX_HISTORY)
    redoStackRef.current = []
  }

  // ── DOM ref maps ───────────────────────────────────────────────────────────
  const textElsRef = useRef(new Map<string, HTMLDivElement>())
  const lineHitboxRefs = useRef(new Map<string, SVGLineElement>())
  const lineVisualRefs = useRef(new Map<string, SVGLineElement>())
  const lineEp1Refs = useRef(new Map<string, SVGCircleElement>())
  const lineEp2Refs = useRef(new Map<string, SVGCircleElement>())
  const boxElsRef = useRef(new Map<string, HTMLDivElement>())
  const peakLabelRefs = useRef(new Map<string, SVGTextElement>())
  const peakLeaderRefs = useRef(new Map<string, SVGLineElement>())
  const peakHitboxRefs = useRef(new Map<string, SVGRectElement>())

  // ── Drag state ─────────────────────────────────────────────────────────────
  const draggingRef = useRef<DragState | null>(null)
  // Tracks final position during DOM-direct drag; committed on pointerup
  const pendingPosRef = useRef<Record<string, number> | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getPct = (e: React.PointerEvent | PointerEvent) => {
    const rect = chartRef.current?.getBoundingClientRect()
    if (!rect) return { xPct: 0, yPct: 0 }
    return {
      xPct: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      yPct: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    }
  }

  const computeSnap = (rawX: number, rawY: number, altKey: boolean) => {
    if (altKey) return { x: rawX, y: rawY, guideX: null as number | null, guideY: null as number | null }
    const container = chartRef.current
    if (!container) return { x: rawX, y: rawY, guideX: null as number | null, guideY: null as number | null }
    const cW = container.offsetWidth, cH = container.offsetHeight
    const pa = plotAreaRef.current
    if (!pa) return { x: rawX, y: rawY, guideX: null as number | null, guideY: null as number | null }
    const snapXCandidates = [50, pa.left / cW * 100, (pa.left + pa.width) / cW * 100]
    const snapYCandidates = [50, pa.top / cH * 100, (pa.top + pa.height) / cH * 100]
    let x = rawX, y = rawY, guideX: number | null = null, guideY: number | null = null
    const T = 3
    for (const ax of snapXCandidates) { if (Math.abs(x - ax) < T) { x = ax; guideX = ax; break } }
    for (const ay of snapYCandidates) { if (Math.abs(y - ay) < T) { y = ay; guideY = ay; break } }
    return { x, y, guideX, guideY }
  }

  const setSnapGuides = (guideX: number | null, guideY: number | null) => {
    if (guideX !== snapGuidesRef.current.x || guideY !== snapGuidesRef.current.y) {
      snapGuidesRef.current = { x: guideX, y: guideY }
      setActiveSnapGuides({ x: guideX, y: guideY })
    }
  }

  const clearSnapGuides = () => {
    if (snapGuidesRef.current.x !== null || snapGuidesRef.current.y !== null) {
      snapGuidesRef.current = { x: null, y: null }
      setActiveSnapGuides({ x: null, y: null })
    }
  }

  // ── Annotation ops ─────────────────────────────────────────────────────────
  const updateAnnotation = (id: string, changes: Record<string, unknown>) => {
    pushToHistory(annotationsRef.current)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _apply(annotationsRef.current.map(a => a.id === id ? { ...(a as any), ...changes } as ChartAnnotation : a))
  }

  const removeAnnotation = (id: string) => {
    pushToHistory(annotationsRef.current)
    _apply(annotationsRef.current.filter(a => a.id !== id))
    if (selectedIdRef.current === id) setSelectedId(null)
    if (editingIdRef.current === id) setEditingId(null)
  }

  const insertSymbol = (sym: string) => {
    const id = makeId()
    pushToHistory(annotationsRef.current)
    _apply([...annotationsRef.current, { id, type: 'text', text: sym, xPct: 50, yPct: 50 } as TextAnnotation])
    setSelectedId(id)
    setEditingId(id)
  }

  const undo = () => {
    if (undoStackRef.current.length === 0) return
    const prev = undoStackRef.current[undoStackRef.current.length - 1]
    undoStackRef.current = undoStackRef.current.slice(0, -1)
    redoStackRef.current = [...redoStackRef.current, annotationsRef.current].slice(-MAX_HISTORY)
    _apply(prev)
    const selId = selectedIdRef.current
    if (selId && !prev.find(a => a.id === selId)) { setSelectedId(null); setEditingId(null) }
  }

  const redo = () => {
    if (redoStackRef.current.length === 0) return
    const next = redoStackRef.current[redoStackRef.current.length - 1]
    redoStackRef.current = redoStackRef.current.slice(0, -1)
    undoStackRef.current = [...undoStackRef.current, annotationsRef.current].slice(-MAX_HISTORY)
    _apply(next)
    const selId = selectedIdRef.current
    if (selId && !next.find(a => a.id === selId)) { setSelectedId(null); setEditingId(null) }
  }

  const copySelected = () => {
    if (!selectedIdRef.current) return
    const ann = annotationsRef.current.find(a => a.id === selectedIdRef.current)
    if (ann) clipboardRef.current = ann
  }

  const pasteAnnotation = () => {
    const ann = clipboardRef.current
    if (!ann) return
    const id = makeId()
    const OFFSET = 3
    let newAnn: ChartAnnotation
    if (ann.type === 'text') {
      const t = ann as TextAnnotation
      newAnn = { ...t, id, xPct: t.xPct + OFFSET, yPct: t.yPct + OFFSET }
    } else if (ann.type === 'peak-label') {
      const pl = ann as PeakLabelAnnotation
      newAnn = { ...pl, id, offsetXPct: pl.offsetXPct + OFFSET, offsetYPct: pl.offsetYPct + OFFSET }
    } else if (ann.type === 'rect' || ann.type === 'ellipse') {
      const ba = ann as RectAnnotation | EllipseAnnotation
      newAnn = { ...ba, id, xPct: ba.xPct + OFFSET, yPct: ba.yPct + OFFSET }
    } else {
      const la = ann as ArrowAnnotation | LineAnnotation
      newAnn = { ...la, id, x1Pct: la.x1Pct + OFFSET, y1Pct: la.y1Pct + OFFSET, x2Pct: la.x2Pct + OFFSET, y2Pct: la.y2Pct + OFFSET }
    }
    pushToHistory(annotationsRef.current)
    _apply([...annotationsRef.current, newAnn])
    setSelectedId(id)
  }

  const duplicateSelected = () => {
    if (!selectedIdRef.current) return
    copySelected()
    pasteAnnotation()
  }

  // ── DOM registration ───────────────────────────────────────────────────────
  const registerTextEl = (id: string, el: HTMLDivElement | null) => {
    if (el) textElsRef.current.set(id, el); else textElsRef.current.delete(id)
  }
  const registerLineHitbox = (id: string, el: SVGLineElement | null) => {
    if (el) lineHitboxRefs.current.set(id, el); else lineHitboxRefs.current.delete(id)
  }
  const registerLineVisual = (id: string, el: SVGLineElement | null) => {
    if (el) lineVisualRefs.current.set(id, el); else lineVisualRefs.current.delete(id)
  }
  const registerLineEp = (id: string, ep: 1 | 2, el: SVGCircleElement | null) => {
    const map = ep === 1 ? lineEp1Refs : lineEp2Refs
    if (el) map.current.set(id, el); else map.current.delete(id)
  }
  const registerBoxEl = (id: string, el: HTMLDivElement | null) => {
    if (el) boxElsRef.current.set(id, el); else boxElsRef.current.delete(id)
  }
  const registerPeakLabel = (id: string, el: SVGTextElement | null) => {
    if (el) peakLabelRefs.current.set(id, el); else peakLabelRefs.current.delete(id)
  }
  const registerPeakLeader = (id: string, el: SVGLineElement | null) => {
    if (el) peakLeaderRefs.current.set(id, el); else peakLeaderRefs.current.delete(id)
  }
  const registerPeakHitbox = (id: string, el: SVGRectElement | null) => {
    if (el) peakHitboxRefs.current.set(id, el); else peakHitboxRefs.current.delete(id)
  }

  // ── DOM-direct update helpers ──────────────────────────────────────────────
  const domUpdateLine = (id: string, x1: number, y1: number, x2: number, y2: number) => {
    const h = lineHitboxRefs.current.get(id)
    const v = lineVisualRefs.current.get(id)
    const e1 = lineEp1Refs.current.get(id)
    const e2 = lineEp2Refs.current.get(id)
    if (h) { h.setAttribute('x1', `${x1}%`); h.setAttribute('y1', `${y1}%`); h.setAttribute('x2', `${x2}%`); h.setAttribute('y2', `${y2}%`) }
    if (v) { v.setAttribute('x1', `${x1}%`); v.setAttribute('y1', `${y1}%`); v.setAttribute('x2', `${x2}%`); v.setAttribute('y2', `${y2}%`) }
    if (e1) { e1.setAttribute('cx', `${x1}%`); e1.setAttribute('cy', `${y1}%`) }
    if (e2) { e2.setAttribute('cx', `${x2}%`); e2.setAttribute('cy', `${y2}%`) }
  }

  const domUpdateBox = (id: string, x: number, y: number, w: number, h: number) => {
    const el = boxElsRef.current.get(id)
    if (el) { el.style.left = `${x}%`; el.style.top = `${y}%`; el.style.width = `${w}%`; el.style.height = `${h}%` }
  }

  const domUpdateText = (id: string, x: number, y: number) => {
    const el = textElsRef.current.get(id)
    if (el) { el.style.left = `${x}%`; el.style.top = `${y}%` }
  }

  const domUpdatePeak = (id: string, labelSvgX: number, labelSvgY: number) => {
    const lbl = peakLabelRefs.current.get(id)
    const hit = peakHitboxRefs.current.get(id)
    const ldr = peakLeaderRefs.current.get(id)
    if (lbl) { lbl.setAttribute('x', String(labelSvgX)); lbl.setAttribute('y', String(labelSvgY)) }
    if (hit) { hit.setAttribute('x', String(labelSvgX - 50)); hit.setAttribute('y', String(labelSvgY - 14)) }
    if (ldr) { ldr.setAttribute('x1', String(labelSvgX)); ldr.setAttribute('y1', String(labelSvgY)) }
  }

  // ── Container pointer move ─────────────────────────────────────────────────
  const handleContainerPointerMove = (e: React.PointerEvent) => {
    let drag = draggingRef.current
    // Resolve pending drag (touch: wait until >6px movement)
    if (drag?.kind === 'pending') {
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0
      if (Math.sqrt(dx * dx + dy * dy) > 6) {
        draggingRef.current = drag.inner
        drag = drag.inner
        setIsDragging(true)
      } else {
        return
      }
    }
    if (!drag) return
    e.preventDefault()
    const { xPct, yPct } = getPct(e)

    if (drag.kind === 'move-text') {
      const { x, y, guideX, guideY } = computeSnap(xPct - drag.offsetXPct, yPct - drag.offsetYPct, e.altKey)
      pendingPosRef.current = { xPct: x, yPct: y }
      domUpdateText(drag.id, x, y)
      setSnapGuides(guideX, guideY)

    } else if (drag.kind === 'move-line') {
      const x1 = xPct - drag.dx1, y1 = yPct - drag.dy1
      const x2 = xPct - drag.dx2, y2 = yPct - drag.dy2
      pendingPosRef.current = { x1Pct: x1, y1Pct: y1, x2Pct: x2, y2Pct: y2 }
      domUpdateLine(drag.id, x1, y1, x2, y2)

    } else if (drag.kind === 'resize-endpoint') {
      const { x, y, guideX, guideY } = computeSnap(xPct, yPct, e.altKey)
      if (drag.endpoint === 1) {
        const cur = annotationsRef.current.find(a => a.id === drag.id) as LineAnnotation | ArrowAnnotation | undefined
        const x2 = cur?.x2Pct ?? xPct, y2 = cur?.y2Pct ?? yPct
        pendingPosRef.current = { x1Pct: x, y1Pct: y }
        domUpdateLine(drag.id, x, y, x2, y2)
      } else {
        const cur = annotationsRef.current.find(a => a.id === drag.id) as LineAnnotation | ArrowAnnotation | undefined
        const x1 = cur?.x1Pct ?? xPct, y1 = cur?.y1Pct ?? yPct
        pendingPosRef.current = { x2Pct: x, y2Pct: y }
        domUpdateLine(drag.id, x1, y1, x, y)
      }
      setSnapGuides(guideX, guideY)

    } else if (drag.kind === 'move-box') {
      const { x, y, guideX, guideY } = computeSnap(xPct - drag.offsetXPct, yPct - drag.offsetYPct, e.altKey)
      const cur = annotationsRef.current.find(a => a.id === drag.id) as RectAnnotation | EllipseAnnotation | undefined
      const w = cur?.widthPct ?? 20, h = cur?.heightPct ?? 15
      pendingPosRef.current = { xPct: x, yPct: y }
      domUpdateBox(drag.id, x, y, w, h)
      setSnapGuides(guideX, guideY)

    } else if (drag.kind === 'resize-corner') {
      const newX = Math.min(xPct, drag.anchorXPct)
      const newY = Math.min(yPct, drag.anchorYPct)
      const w = Math.abs(xPct - drag.anchorXPct)
      const h = Math.abs(yPct - drag.anchorYPct)
      pendingPosRef.current = { xPct: newX, yPct: newY, widthPct: w, heightPct: h }
      domUpdateBox(drag.id, newX, newY, w, h)

    } else if (drag.kind === 'move-peak') {
      const container = chartRef.current
      if (!container) return
      const cW = container.offsetWidth, cH = container.offsetHeight
      const newLabelXPct = xPct - drag.offsetXPct
      const newLabelYPct = yPct - drag.offsetYPct
      pendingPosRef.current = {
        offsetXPct: newLabelXPct - drag.anchorXPct,
        offsetYPct: newLabelYPct - drag.anchorYPct,
      }
      const labelSvgX = newLabelXPct / 100 * cW
      const labelSvgY = newLabelYPct / 100 * cH
      domUpdatePeak(drag.id, labelSvgX, labelSvgY)

    } else if (drag.kind === 'draw') {
      const { tool, ghostId, startXPct, startYPct } = drag
      if (tool === 'line' || tool === 'arrow' || tool === 'dashed') {
        const { x, y, guideX, guideY } = computeSnap(xPct, yPct, e.altKey)
        pendingPosRef.current = { x1Pct: startXPct, y1Pct: startYPct, x2Pct: x, y2Pct: y }
        domUpdateLine(ghostId, startXPct, startYPct, x, y)
        setSnapGuides(guideX, guideY)
      } else if (tool === 'rect' || tool === 'ellipse') {
        const x = Math.min(xPct, startXPct), y = Math.min(yPct, startYPct)
        const w = Math.abs(xPct - startXPct), h = Math.abs(yPct - startYPct)
        pendingPosRef.current = { xPct: x, yPct: y, widthPct: w, heightPct: h }
        domUpdateBox(ghostId, x, y, w, h)
      }
    }
  }

  // ── Container pointer up ───────────────────────────────────────────────────
  const handleContainerPointerUp = (_e: React.PointerEvent) => {
    const drag = draggingRef.current
    const pos = pendingPosRef.current

    if (drag && drag.kind !== 'pending' && pos) {
      if (drag.kind === 'move-text' || drag.kind === 'move-line' || drag.kind === 'resize-endpoint' ||
          drag.kind === 'move-box' || drag.kind === 'resize-corner' || drag.kind === 'move-peak') {
        pushToHistory(preDragSnapshotRef.current ?? annotationsRef.current)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _apply(annotationsRef.current.map(a => a.id === drag.id ? { ...(a as any), ...pos } as ChartAnnotation : a))
      } else if (drag.kind === 'draw') {
        const { tool, ghostId } = drag
        const MIN_SIZE = 3
        if (tool === 'line' || tool === 'arrow' || tool === 'dashed') {
          const dx = (pos.x2Pct ?? 0) - (pos.x1Pct ?? 0)
          const dy = (pos.y2Pct ?? 0) - (pos.y1Pct ?? 0)
          if (Math.sqrt(dx * dx + dy * dy) >= MIN_SIZE) {
            const newAnn: LineAnnotation = {
              id: ghostId, type: 'line',
              dash: tool === 'dashed',
              headStart: false,
              headEnd: tool === 'arrow',
              x1Pct: pos.x1Pct ?? 0, y1Pct: pos.y1Pct ?? 0,
              x2Pct: pos.x2Pct ?? 0, y2Pct: pos.y2Pct ?? 0,
            }
            pushToHistory(preDragSnapshotRef.current ?? annotationsRef.current)
            _apply([...annotationsRef.current.filter(a => a.id !== ghostId), newAnn])
            setSelectedId(ghostId)
            setActiveTool('select')
          } else {
            _apply(annotationsRef.current.filter(a => a.id !== ghostId))
          }
        } else if (tool === 'rect' || tool === 'ellipse') {
          const w = pos.widthPct ?? 0, h = pos.heightPct ?? 0
          if (w >= MIN_SIZE && h >= MIN_SIZE) {
            const newAnn: RectAnnotation | EllipseAnnotation = {
              id: ghostId, type: tool,
              xPct: pos.xPct ?? 0, yPct: pos.yPct ?? 0,
              widthPct: w, heightPct: h,
            }
            pushToHistory(preDragSnapshotRef.current ?? annotationsRef.current)
            _apply([...annotationsRef.current.filter(a => a.id !== ghostId), newAnn])
            setSelectedId(ghostId)
            setActiveTool('select')
          } else {
            _apply(annotationsRef.current.filter(a => a.id !== ghostId))
          }
        }
        setDrawGhost(null)
      }
    }

    pendingPosRef.current = null
    preDragSnapshotRef.current = null
    draggingRef.current = null
    setIsDragging(false)
    clearSnapGuides()
  }

  const handleContainerClick = () => {
    setSelectedId(null)
    if (editingIdRef.current) setEditingId(null)
  }

  // ── Draw overlay pointer down ──────────────────────────────────────────────
  const handleDrawPointerDown = (e: React.PointerEvent) => {
    const tool = activeToolRef.current
    const { xPct, yPct } = getPct(e)

    if (tool === 'text') {
      const id = makeId()
      pushToHistory(annotationsRef.current)
      _apply([...annotationsRef.current, { id, type: 'text', text: 'Text', xPct, yPct } as TextAnnotation])
      setActiveTool('select')
      setSelectedId(id)
      setEditingId(id)
      return
    }
    // 'peak' and 'select' are handled by ChartPreview overlays, not here
    if (tool === 'peak' || tool === 'select') return

    // Draw-drag: create ghost annotation immediately for line/rect/ellipse tools
    const ghostId = makeId()
    const dragState: DragState = { kind: 'draw', tool, ghostId, startXPct: xPct, startYPct: yPct }

    preDragSnapshotRef.current = annotationsRef.current

    if (tool === 'line' || tool === 'arrow' || tool === 'dashed') {
      const ghost: LineAnnotation = {
        id: ghostId, type: 'line',
        dash: tool === 'dashed', headStart: false, headEnd: tool === 'arrow',
        x1Pct: xPct, y1Pct: yPct, x2Pct: xPct, y2Pct: yPct,
      }
      _apply([...annotationsRef.current, ghost])
      setDrawGhost(ghost)
    } else if (tool === 'rect' || tool === 'ellipse') {
      const ghost: RectAnnotation | EllipseAnnotation = {
        id: ghostId, type: tool, xPct, yPct, widthPct: 0, heightPct: 0,
      }
      _apply([...annotationsRef.current, ghost])
      setDrawGhost(ghost)
    }

    draggingRef.current = dragState
    pendingPosRef.current = null
    setIsDragging(true)
    // Capture so move/up reach this element even if pointer leaves
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  // ── Drag starters for existing annotations ─────────────────────────────────
  const startMoveText = (e: React.PointerEvent, ann: TextAnnotation) => {
    if (editingIdRef.current === ann.id) return
    e.stopPropagation()
    preDragSnapshotRef.current = annotationsRef.current
    setSelectedId(ann.id)
    const { xPct, yPct } = getPct(e)
    const inner: DragState = { kind: 'move-text', id: ann.id, offsetXPct: xPct - ann.xPct, offsetYPct: yPct - ann.yPct }
    if (isTouch) {
      draggingRef.current = { kind: 'pending', inner, x0: e.clientX, y0: e.clientY }
    } else {
      draggingRef.current = inner
      setIsDragging(true)
    }
    pendingPosRef.current = null
  }

  const startMoveLine = (e: React.PointerEvent, ann: ArrowAnnotation | LineAnnotation) => {
    e.stopPropagation()
    preDragSnapshotRef.current = annotationsRef.current
    setSelectedId(ann.id)
    const { xPct, yPct } = getPct(e)
    const inner: DragState = { kind: 'move-line', id: ann.id, dx1: xPct - ann.x1Pct, dy1: yPct - ann.y1Pct, dx2: xPct - ann.x2Pct, dy2: yPct - ann.y2Pct }
    if (isTouch) {
      draggingRef.current = { kind: 'pending', inner, x0: e.clientX, y0: e.clientY }
    } else {
      draggingRef.current = inner
      setIsDragging(true)
    }
    pendingPosRef.current = null
  }

  const startMoveBox = (e: React.PointerEvent, ann: RectAnnotation | EllipseAnnotation) => {
    e.stopPropagation()
    preDragSnapshotRef.current = annotationsRef.current
    setSelectedId(ann.id)
    const { xPct, yPct } = getPct(e)
    const inner: DragState = { kind: 'move-box', id: ann.id, offsetXPct: xPct - ann.xPct, offsetYPct: yPct - ann.yPct }
    if (isTouch) {
      draggingRef.current = { kind: 'pending', inner, x0: e.clientX, y0: e.clientY }
    } else {
      draggingRef.current = inner
      setIsDragging(true)
    }
    pendingPosRef.current = null
  }

  const startMovePeak = (e: React.PointerEvent, ann: PeakLabelAnnotation, anchorXPct: number, anchorYPct: number) => {
    if (editingIdRef.current === ann.id) return
    e.stopPropagation()
    preDragSnapshotRef.current = annotationsRef.current
    setSelectedId(ann.id)
    const { xPct, yPct } = getPct(e)
    const labelXPct = anchorXPct + ann.offsetXPct
    const labelYPct = anchorYPct + ann.offsetYPct
    const inner: DragState = { kind: 'move-peak', id: ann.id, offsetXPct: xPct - labelXPct, offsetYPct: yPct - labelYPct, anchorXPct, anchorYPct }
    if (isTouch) {
      draggingRef.current = { kind: 'pending', inner, x0: e.clientX, y0: e.clientY }
    } else {
      draggingRef.current = inner
      setIsDragging(true)
    }
    pendingPosRef.current = null
  }

  const startResizeLineEndpoint = (e: React.PointerEvent, ann: ArrowAnnotation | LineAnnotation, ep: 1 | 2) => {
    e.stopPropagation()
    preDragSnapshotRef.current = annotationsRef.current
    // Keep line data in annotationsRef for the other endpoint during resize
    const inner: DragState = { kind: 'resize-endpoint', id: ann.id, endpoint: ep }
    if (isTouch) {
      draggingRef.current = { kind: 'pending', inner, x0: e.clientX, y0: e.clientY }
    } else {
      draggingRef.current = inner
      setIsDragging(true)
    }
    pendingPosRef.current = null
  }

  const startResizeBoxCorner = (e: React.PointerEvent, ann: RectAnnotation | EllipseAnnotation, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation()
    preDragSnapshotRef.current = annotationsRef.current
    const anchor = {
      nw: { xPct: ann.xPct + ann.widthPct, yPct: ann.yPct + ann.heightPct },
      ne: { xPct: ann.xPct,                yPct: ann.yPct + ann.heightPct },
      sw: { xPct: ann.xPct + ann.widthPct, yPct: ann.yPct },
      se: { xPct: ann.xPct,                yPct: ann.yPct },
    }[corner]
    const inner: DragState = { kind: 'resize-corner', id: ann.id, anchorXPct: anchor.xPct, anchorYPct: anchor.yPct }
    if (isTouch) {
      draggingRef.current = { kind: 'pending', inner, x0: e.clientX, y0: e.clientY }
    } else {
      draggingRef.current = inner
      setIsDragging(true)
    }
    pendingPosRef.current = null
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  // Auto-focus and select-all when entering text edit mode
  useEffect(() => {
    if (!editingId) return
    const wrapper = textElsRef.current.get(editingId)
    if (!wrapper) return
    const editable = wrapper.children[0] as HTMLElement | undefined
    if (!editable) return
    editable.focus()
    const sel = window.getSelection()
    if (sel) {
      const range = document.createRange()
      range.selectNodeContents(editable)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }, [editingId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isContentEditable = e.target instanceof HTMLElement && (e.target as HTMLElement).isContentEditable
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // Escape in contentEditable: exit editing only (don't deselect)
      if (isContentEditable) {
        if (e.key === 'Escape' && editingIdRef.current) {
          e.preventDefault()
          setEditingId(null)
          const el = e.target as HTMLElement
          el.blur()
        }
        return
      }

      const selId = selectedIdRef.current
      const tool = activeToolRef.current

      // Ctrl/Cmd shortcuts
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault()
          if (e.shiftKey) { redo() } else { undo() }
          return
        }
        if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); redo(); return }
        if (e.key === 'c' || e.key === 'C') { e.preventDefault(); copySelected(); return }
        if (e.key === 'v' || e.key === 'V') { e.preventDefault(); pasteAnnotation(); return }
        if (e.key === 'd' || e.key === 'D') { e.preventDefault(); duplicateSelected(); return }
      }

      // Escape: return to select tool or deselect
      if (e.key === 'Escape') {
        if (tool !== 'select') { setActiveTool('select'); return }
        setSelectedId(null)
        setEditingId(null)
        return
      }

      // Arrow key nudging for selected annotation
      if (e.key.startsWith('Arrow') && selId && !editingIdRef.current) {
        const ann = annotationsRef.current.find(a => a.id === selId)
        if (!ann) return
        e.preventDefault()
        const container = chartRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const step = e.shiftKey ? 10 : 1
        const dxPct = (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0) / rect.width * 100
        const dyPct = (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0) / rect.height * 100

        pushToHistory(annotationsRef.current)
        if (ann.type === 'text') {
          _apply(annotationsRef.current.map(a =>
            a.id === selId ? { ...a, xPct: (a as TextAnnotation).xPct + dxPct, yPct: (a as TextAnnotation).yPct + dyPct } as ChartAnnotation : a
          ))
        } else if (ann.type === 'peak-label') {
          const pl = ann as PeakLabelAnnotation
          _apply(annotationsRef.current.map(a =>
            a.id === selId ? { ...pl, offsetXPct: pl.offsetXPct + dxPct, offsetYPct: pl.offsetYPct + dyPct } as ChartAnnotation : a
          ))
        } else if (ann.type === 'line' || ann.type === 'arrow') {
          const la = ann as LineAnnotation | ArrowAnnotation
          _apply(annotationsRef.current.map(a =>
            a.id === selId ? { ...la, x1Pct: la.x1Pct + dxPct, y1Pct: la.y1Pct + dyPct, x2Pct: la.x2Pct + dxPct, y2Pct: la.y2Pct + dyPct } as ChartAnnotation : a
          ))
        } else if (ann.type === 'rect' || ann.type === 'ellipse') {
          const ba = ann as RectAnnotation | EllipseAnnotation
          _apply(annotationsRef.current.map(a =>
            a.id === selId ? { ...ba, xPct: ba.xPct + dxPct, yPct: ba.yPct + dyPct } as ChartAnnotation : a
          ))
        }
        return
      }

      // Delete/Backspace: remove selected annotation
      if ((e.key === 'Delete' || e.key === 'Backspace') && selId && !editingIdRef.current) {
        pushToHistory(annotationsRef.current)
        _apply(annotationsRef.current.filter(a => a.id !== selId))
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    activeTool, selectedId, editingId, isDragging, drawGhost, activeSnapGuides,
    setActiveTool, setSelectedId, setEditingId,
    updateAnnotation, removeAnnotation, insertSymbol,
    registerTextEl, registerLineHitbox, registerLineVisual, registerLineEp,
    registerBoxEl, registerPeakLabel, registerPeakLeader, registerPeakHitbox,
    handleContainerPointerMove, handleContainerPointerUp, handleContainerClick,
    handleDrawPointerDown,
    startMoveText, startMoveLine, startMoveBox, startMovePeak,
    startResizeLineEndpoint, startResizeBoxCorner,
  }
}
