const STORAGE_KEY = 'figureready-emails'
const SESSION_KEY = 'figureready-email-captured'

export interface EmailEntry {
  email: string
  capturedAt: string
}

export function saveEmail(email: string): void {
  if (typeof window === 'undefined') return
  const entries = getEmailEntries()
  const alreadyExists = entries.some(e => e.email.toLowerCase() === email.toLowerCase())
  if (!alreadyExists) {
    entries.push({ email, capturedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }
  sessionStorage.setItem(SESSION_KEY, email)
}

export function getCapturedEmail(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(SESSION_KEY)
}

export function getEmailEntries(): EmailEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as EmailEntry[]) : []
  } catch {
    return []
  }
}
