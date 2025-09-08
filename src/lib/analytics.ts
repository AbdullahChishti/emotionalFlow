'use client'

type AnalyticsEvent =
  | 'signin_view'
  | 'signin_submit'
  | 'signin_error'
  | 'sso_click'
  | 'signin_success'
  | 'hero_view'
  | 'cta_click'
  | 'assessment_start'
  | 'chat_open'
  | 'tools_toggle'
  | 'session_end_click'
  | 'tool_open'
  | 'voice_stop'
  | 'voice_start'

type Device = 'mobile' | 'desktop'

export interface EventProps {
  [key: string]: unknown
}

function getDevice(): Device {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth || 1024
  return w < 768 ? 'mobile' : 'desktop'
}

export function getOrAssignABBuck(): string {
  if (typeof window === 'undefined') return 'B'
  const key = 'hero_ab_bucket'
  let v = window.localStorage.getItem(key)
  if (!v) {
    v = Math.random() < 0.5 ? 'A' : 'B'
    window.localStorage.setItem(key, v)
  }
  return v
}

export function track(event: AnalyticsEvent, props: EventProps = {}): void {
  if (typeof window === 'undefined') return
  const payload = {
    ts: Date.now(),
    device: getDevice(),
    ...props,
  }

  // Console log for dev visibility
   
  console.log(`[analytics] ${event}`, payload)

  // Dispatch a CustomEvent for any listeners
  try {
    window.dispatchEvent(new CustomEvent('analytics', { detail: { event, ...payload } }))
  } catch {}

  // Optional integrations if present
  // Google Analytics gtag
  try {
    // @ts-ignore
    if (window.gtag) window.gtag('event', event, payload)
  } catch {}
  // Plausible
  try {
    // @ts-ignore
    if (window.plausible) window.plausible(event, { props: payload })
  } catch {}
  // Mixpanel
  try {
    // @ts-ignore
    if (window.mixpanel) window.mixpanel.track(event, payload)
  } catch {}
}
