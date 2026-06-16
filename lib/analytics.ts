const STORAGE_KEY = 'figureready-analytics'

export interface AnalyticsData {
  uploads: number
  chartsCreated: number
  exports: number
  feedbackSubmissions: number
  lastUpdated: string
}

function empty(): AnalyticsData {
  return { uploads: 0, chartsCreated: 0, exports: 0, feedbackSubmissions: 0, lastUpdated: new Date().toISOString() }
}

function load(): AnalyticsData {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AnalyticsData) : empty()
  } catch {
    return empty()
  }
}

function save(data: AnalyticsData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }))
}

function inc(key: keyof Omit<AnalyticsData, 'lastUpdated'>) {
  const d = load();
  (d[key] as number)++
  save(d)
}

export const trackUpload = () => inc('uploads')
export const trackChartCreated = () => inc('chartsCreated')
export const trackExport = () => inc('exports')
export const trackFeedback = () => inc('feedbackSubmissions')
export const getAnalytics = (): AnalyticsData => load()
