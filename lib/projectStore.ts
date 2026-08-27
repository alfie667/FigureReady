'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createFigure, type FigureDocument, type FigureEditorState } from './figureDocument'
import {
  type PanelLayout, type PanelLabelConfig, type ComposerConfig, type CanvasItem,
  DEFAULT_LABEL_CONFIG, DEFAULT_COMPOSER_CONFIG, getLayoutCount, PANEL_LABELS,
} from './panels'

// ── MultiPanelDocument ────────────────────────────────────────────────────────

export interface PanelSlot {
  id: string          // 'A' | 'B' | 'C' | 'D'
  figureId: string | null
}

export interface MultiPanelDocument {
  layout: PanelLayout
  slots: PanelSlot[]
  figureStyleOverrides: import('./chartStyles').StyleOverrides
  labelConfig: PanelLabelConfig
  composerConfig: ComposerConfig
  // UI state — not scientific, lives here for simplicity
  zoomLevel: number   // 0.25 | 0.5 | 0.75 | 1.0 | 'fit' resolved to number
  // Free canvas mode
  canvasMode: boolean
  canvasItems: CanvasItem[]
}

// ── Project store ─────────────────────────────────────────────────────────────

interface ProjectState {
  figures: FigureDocument[]
  activeFigureId: string | null
  multiPanel: MultiPanelDocument | null

  // ── Figure actions ──────────────────────────────────────────────────────────
  createFigure: (overrides?: Partial<FigureDocument>) => string   // returns new id
  updateFigure: (id: string, patch: Partial<FigureEditorState>) => void
  renameFigure: (id: string, name: string) => void
  deleteFigure: (id: string) => void
  setActiveFigure: (id: string) => void
  duplicateFigure: (id: string) => string   // returns new id

  // ── Multi-panel actions ─────────────────────────────────────────────────────
  enableMultiPanel: () => void
  disableMultiPanel: () => void
  setMultiPanelLayout: (layout: PanelLayout) => void
  assignFigureToSlot: (slotId: string, figureId: string | null) => void
  addFigureToNextEmptySlot: (figureId: string) => boolean   // returns false if no empty slot
  removeFromMultiPanel: (figureId: string) => void
  updateMultiPanelComposer: (patch: Partial<Pick<MultiPanelDocument, 'figureStyleOverrides' | 'labelConfig' | 'composerConfig' | 'zoomLevel'>>) => void
  setCanvasMode: (enabled: boolean) => void
  updateCanvasItem: (id: string, patch: Partial<CanvasItem>) => void
  addCanvasTextItem: () => void
  removeCanvasItem: (id: string) => void
}

// ── Data persistence (separate from config) ───────────────────────────────────
// data[] can be large — stored separately to avoid quota issues.
// These helpers are called by the autosave effect in page.tsx.

export function saveDataForFigure(id: string, data: Record<string, unknown>[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`fr_data_${id}`, JSON.stringify(data))
  } catch {
    // Quota exceeded — data won't survive reload but config is safe
  }
}

export function loadDataForFigure(id: string): Record<string, unknown>[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`fr_data_${id}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function deleteDataForFigure(id: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(`fr_data_${id}`) } catch { /* ignore */ }
}

// ── Build initial slots for a layout ─────────────────────────────────────────

function makeSlots(layout: PanelLayout, figureId?: string): PanelSlot[] {
  const count = getLayoutCount(layout)
  return Array.from({ length: count }, (_, i) => ({
    id: PANEL_LABELS[i] ?? `P${i + 1}`,
    figureId: i === 0 ? (figureId ?? null) : null,
  }))
}

// ── Store ─────────────────────────────────────────────────────────────────────

const INITIAL_FIGURE = createFigure({ name: 'Untitled figure' })

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      figures: [INITIAL_FIGURE],
      activeFigureId: INITIAL_FIGURE.id,
      multiPanel: null,

      // ── Figure actions ────────────────────────────────────────────────────

      createFigure: (overrides = {}) => {
        const fig = createFigure(overrides)
        set(s => ({ figures: [...s.figures, fig], activeFigureId: fig.id }))
        return fig.id
      },

      updateFigure: (id, patch) => {
        set(s => ({
          figures: s.figures.map(f =>
            f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f
          ),
        }))
      },

      renameFigure: (id, name) => {
        set(s => ({
          figures: s.figures.map(f =>
            f.id === id ? { ...f, name, updatedAt: Date.now() } : f
          ),
        }))
      },

      deleteFigure: (id) => {
        const { figures, activeFigureId, multiPanel } = get()
        if (figures.length <= 1) return   // always keep at least one figure

        const remaining = figures.filter(f => f.id !== id)
        const newActiveId = activeFigureId === id
          ? (remaining[0]?.id ?? null)
          : activeFigureId

        // Orphan any panel slots that referenced this figure
        const newMultiPanel = multiPanel ? {
          ...multiPanel,
          slots: multiPanel.slots.map(s =>
            s.figureId === id ? { ...s, figureId: null } : s
          ),
        } : null

        deleteDataForFigure(id)
        set({ figures: remaining, activeFigureId: newActiveId, multiPanel: newMultiPanel })
      },

      setActiveFigure: (id) => {
        set({ activeFigureId: id })
      },

      duplicateFigure: (id) => {
        const src = get().figures.find(f => f.id === id)
        if (!src) return id
        const copy = createFigure({
          ...src,
          name: `${src.name} (copy)`,
          annotations: src.annotations.map(a => ({ ...a })),
        })
        // Copy data too
        const data = loadDataForFigure(id)
        if (data.length > 0) saveDataForFigure(copy.id, data)
        set(s => ({ figures: [...s.figures, copy], activeFigureId: copy.id }))
        return copy.id
      },

      // ── Multi-panel actions ───────────────────────────────────────────────

      enableMultiPanel: () => {
        const { multiPanel, activeFigureId } = get()
        if (multiPanel) return   // already enabled
        set({
          multiPanel: {
            layout: '2h',
            slots: makeSlots('2h', activeFigureId ?? undefined),
            figureStyleOverrides: {},
            labelConfig: DEFAULT_LABEL_CONFIG,
            composerConfig: DEFAULT_COMPOSER_CONFIG,
            zoomLevel: 1,
            canvasMode: false,
            canvasItems: [],
          },
        })
      },

      disableMultiPanel: () => {
        set({ multiPanel: null })
      },

      setMultiPanelLayout: (layout) => {
        set(s => {
          if (!s.multiPanel) return s
          const newCount = getLayoutCount(layout)
          const oldSlots = s.multiPanel.slots
          let slots: PanelSlot[]
          if (newCount > oldSlots.length) {
            const extra = Array.from({ length: newCount - oldSlots.length }, (_, i) => ({
              id: PANEL_LABELS[oldSlots.length + i] ?? `P${oldSlots.length + i + 1}`,
              figureId: null,
            }))
            slots = [...oldSlots, ...extra]
          } else {
            slots = oldSlots.slice(0, newCount)
          }
          return { multiPanel: { ...s.multiPanel, layout, slots } }
        })
      },

      assignFigureToSlot: (slotId, figureId) => {
        set(s => {
          if (!s.multiPanel) return s
          return {
            multiPanel: {
              ...s.multiPanel,
              slots: s.multiPanel.slots.map(sl =>
                sl.id === slotId ? { ...sl, figureId } : sl
              ),
            },
          }
        })
      },

      addFigureToNextEmptySlot: (figureId) => {
        const { multiPanel } = get()
        if (!multiPanel) return false
        const emptySlot = multiPanel.slots.find(s => s.figureId === null)
        if (!emptySlot) return false
        get().assignFigureToSlot(emptySlot.id, figureId)
        return true
      },

      removeFromMultiPanel: (figureId) => {
        set(s => {
          if (!s.multiPanel) return s
          return {
            multiPanel: {
              ...s.multiPanel,
              slots: s.multiPanel.slots.map(sl =>
                sl.figureId === figureId ? { ...sl, figureId: null } : sl
              ),
            },
          }
        })
      },

      updateMultiPanelComposer: (patch) => {
        set(s => {
          if (!s.multiPanel) return s
          return { multiPanel: { ...s.multiPanel, ...patch } }
        })
      },

      setCanvasMode: (enabled) => {
        set(s => {
          if (!s.multiPanel) return s
          return { multiPanel: { ...s.multiPanel, canvasMode: enabled } }
        })
      },

      updateCanvasItem: (id, patch) => {
        set(s => {
          if (!s.multiPanel) return s
          const existing = s.multiPanel.canvasItems.find(it => it.id === id)
          const canvasItems = existing
            ? s.multiPanel.canvasItems.map(it => it.id === id ? { ...it, ...patch } : it)
            : [...s.multiPanel.canvasItems, { id, type: 'figure' as const, x: 0, y: 0, width: 200, height: 200, ...patch }]
          return { multiPanel: { ...s.multiPanel, canvasItems } }
        })
      },

      addCanvasTextItem: () => {
        set(s => {
          if (!s.multiPanel) return s
          const id = `txt_${Date.now()}`
          const newItem: CanvasItem = { id, type: 'text', x: 280, y: 300, width: 300, height: 60, text: '', fontSize: 14 }
          return { multiPanel: { ...s.multiPanel, canvasItems: [...s.multiPanel.canvasItems, newItem] } }
        })
      },

      removeCanvasItem: (id) => {
        set(s => {
          if (!s.multiPanel) return s
          return { multiPanel: { ...s.multiPanel, canvasItems: s.multiPanel.canvasItems.filter(it => it.id !== id) } }
        })
      },
    }),

    {
      name: 'fr_project',
      storage: createJSONStorage(() => localStorage),
      // Exclude data[] from persistence — stored separately via saveDataForFigure
      partialize: (state) => ({
        ...state,
        figures: state.figures.map(f => ({ ...f, data: [] })),
      }),
      version: 1,
    }
  )
)

// ── Convenience selectors ─────────────────────────────────────────────────────

export const selectActiveFigure = (s: ProjectState): FigureDocument | null =>
  s.figures.find(f => f.id === s.activeFigureId) ?? null

export const selectFigureById = (id: string) => (s: ProjectState): FigureDocument | null =>
  s.figures.find(f => f.id === id) ?? null
