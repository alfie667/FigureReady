import { trackEvent } from '@/lib/analytics'

export function gtagEvent(name: string, params?: Record<string, unknown>) {
  trackEvent(name, params)
}
