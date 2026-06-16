const STORAGE_KEY = 'figureready-feedback'

export interface FeedbackEntry {
  id: string
  liked: string
  frustrated: string
  missing: string
  email: string
  createdAt: string
}

export function saveFeedback(entry: Omit<FeedbackEntry, 'id' | 'createdAt'>): void {
  if (typeof window === 'undefined') return
  const entries = getFeedbackEntries()
  entries.push({ ...entry, id: Math.random().toString(36).slice(2), createdAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function getFeedbackEntries(): FeedbackEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FeedbackEntry[]) : []
  } catch {
    return []
  }
}
