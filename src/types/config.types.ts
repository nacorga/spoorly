import { MetadataType } from './common.types';
import { WebVitalType } from './event.types';

/**
 * Web Vitals filtering mode
 * - 'all': Track all Web Vitals metrics, including good ones (default — uncensored sample)
 * - 'needs-improvement': Track metrics that need improvement or are poor (censors good values)
 * - 'poor': Track only poor metrics (minimal data, most heavily censored)
 */
export type WebVitalsMode = 'all' | 'needs-improvement' | 'poor';

export interface Config {
  /**
   * Collect endpoint that receives event batches as a JSON body sent with
   * `Content-Type: text/plain` (no CORS preflight; `Access-Control-Allow-Origin: *` suffices).
   * Omit to run standalone: events are only emitted locally via `on('event')`.
   * Must be `https:`; `http:` is accepted only for localhost.
   */
  endpoint?: string;
  /** Session inactivity timeout in milliseconds. @default 900000 */
  sessionTimeout?: number;
  /** Metadata appended to every tracked event. */
  globalMetadata?: Record<string, MetadataType>;
  /** Query parameters to remove before tracking URLs. */
  sensitiveQueryParams?: string[];
  /** Error event sampling rate between 0 and 1. @default 1 */
  errorSampling?: number;
  /** Event sampling rate between 0 and 1. @default 1 */
  samplingRate?: number;
  /** Page view throttle duration in milliseconds to prevent rapid navigation spam. @default 1000 */
  pageViewThrottleMs?: number;
  /** Click throttle duration in milliseconds to prevent double-clicks and rapid spam. @default 300 */
  clickThrottleMs?: number;
  /** Maximum number of same custom event name allowed per minute to prevent infinite loops. @default 60 */
  maxSameEventPerMinute?: number;
  /**
   * Web Vitals filtering mode. @default 'all'
   * - 'all': Track all metrics (good, needs-improvement, poor) - uncensored sample
   * - 'needs-improvement': Track metrics that need improvement or are poor - censors good values
   * - 'poor': Track only poor metrics - minimal data, most heavily censored
   */
  webVitalsMode?: WebVitalsMode;
  /**
   * Custom Web Vitals thresholds in milliseconds (except CLS which is unitless).
   * Only applies when webVitalsMode is set. Overrides default thresholds for the selected mode.
   */
  webVitalsThresholds?: Partial<Record<WebVitalType, number>>;
  /** Interval in milliseconds between event batch sends. @default 10000 (10 seconds) */
  sendIntervalMs?: number;
  /**
   * Opt-in: when `true`, the event queue is flushed after every SPA navigation
   * (`pushState`, `replaceState`, `popstate`, `hashchange`). Defaults to `false`
   * because per-route flushing can multiply request volume on SPA-heavy apps.
   * @default false
   */
  flushOnSpaNavigation?: boolean;
  /**
   * If true, the event queue is flushed when `document.hidden` becomes `true`
   * (tab switch, lock screen, app backgrounding). Especially relevant on mobile Safari
   * where `pagehide`/`beforeunload` may not fire reliably.
   * @default true
   */
  flushOnPageHidden?: boolean;
}
