export type AnalyticsEvent =
  | 'signin_view'
  | 'signin_submit'
  | 'signin_error'
  | 'sso_click'
  | 'signin_success'

export interface AnalyticsProps {
  [key: string]: any
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  if (process.env.NODE_ENV !== 'test') {
    // Placeholder for real analytics integration
    console.log('analytics event', event, props)
  }
}
