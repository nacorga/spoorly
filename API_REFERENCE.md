# API reference

```ts
import { spoorly } from 'spoorly';
```

With the IIFE bundle the same object is `window.spoorly`. Every method is a safe no-op during server-side rendering (no `window`).

- [Initialization order](#initialization-order)
- [Methods](#methods): `init`, `event`, `on`, `off`, `identify`, `resetIdentity`, `destroy`, `isInitialized`, `getSessionId`, `getUserId`
- [Configuration](#configuration)
- [Event types](#event-types)
- [Delivery: critical events, SPAs and mobile](#delivery-critical-events-spas-and-mobile)
- [QA mode](#qa-mode)
- [Types](#types)

## Initialization order

```ts
// 1. Listeners first: init() fires session_start and page_view immediately.
spoorly.on('event', (event) => console.log(event.type));

// 2. Identity (optional, before or after init).
spoorly.identify('cust_123', { plan: 'pro' });

// 3. Initialize.
const { sessionId } = await spoorly.init({ endpoint: 'https://api.example.com/collect' });

// 4. Custom events, only after init.
spoorly.event('app_ready');
```

Listeners registered before `init()` are buffered and attached during `init()`. A listener added after `init()` misses the initial `session_start` and `page_view`. Call `init()` from browser-only code, such as `useEffect` in React, `onMounted` in Vue or `ngOnInit` behind a `typeof window` check in Angular.

## Methods

### `init(config?: Config): Promise<InitResult>`

Validates the config, starts every handler and resolves with `{ sessionId }`.

- Rejects when the config is invalid (for example an `endpoint` that isn't `https:` or local `http:`) or when initialization takes longer than 10 s.
- Resolves with `{ sessionId: '' }` without doing anything when there is no `window` or when `window.__spoorlyDisabled === true`.
- A second call while initialized resolves with the current `sessionId` and ignores its config. If that config differs from the active one, a development-only warning tells you to call `destroy()` first.
- Recovers batches persisted by a previous page load and resends them.
- On a prerendered page (`document.prerendering`), resolves with a real `sessionId` but emits nothing until the page is activated. A prerender that is never shown emits nothing.

### `event(name, metadata?, options?): void`

```ts
event(
  name: string,
  metadata?: Record<string, MetadataType> | Record<string, MetadataType>[],
  options?: EventOptions,
): void
```

Tracks a `custom` event.

```ts
spoorly.event('product_viewed', { productId: 'abc-123', price: 299.99 });
spoorly.event('cart_updated', [{ sku: 'a', qty: 2 }, { sku: 'b', qty: 1 }]);
spoorly.event('purchase_completed', { orderId: 'ord-789' }, { critical: true });
```

- Throws if called before `init()` or during `destroy()`.
- Invalid events (name over 120 characters, more than 100 keys, arrays over 500 items, strings over 1000 characters (500 inside arrays), a serialized size over 48 KB, unsupported value types) are dropped with a development warning. In [QA mode](#qa-mode) they throw instead.
- String values are stripped of script-injection patterns.
- At most `maxSameEventPerMinute` events with the same name per minute (default 60), to stop runaway loops.
- `options.critical`: see [critical events](#critical-events).

Clicking an element with `data-spoorly-name="signup_cta"` (and optional `data-spoorly-value="pro"`) also tracks a `custom` event named `signup_cta` with metadata `{ value: 'pro' }`, in addition to the `click`.

### `on(event, callback)` / `off(event, callback)`

```ts
on<K extends keyof EmitterMap>(event: K, callback: EmitterCallback<EmitterMap[K]>): void
off<K extends keyof EmitterMap>(event: K, callback: EmitterCallback<EmitterMap[K]>): void
```

| Channel | Payload | Fires |
| --- | --- | --- |
| `'event'` | `EventData` | Once for every tracked event, in standalone and endpoint mode |
| `'queue'` | `EventsQueue` | Once per batch. With an endpoint, after a `fetch` gets a 2xx or the browser accepts the `sendBeacon` call (accepted, not necessarily delivered), and for batches recovered from `localStorage`. Standalone, on every flush, and each event appears in only one batch |

Use `'event'` to forward events elsewhere. `off()` needs the same function reference that was passed to `on()` and also removes listeners still waiting for `init()`. Unsubscribe when a component unmounts.

### `identify(userId: string, traits?: Record<string, string>): void`

Associates the visitor with your own user id. The identity is sent with every batch as `identify: { userId, traits }`.

- `userId` is trimmed and must be 1 to 256 characters; otherwise the call is ignored with a development warning.
- Only string trait values are kept.
- Before `init()`, the identity is stored in `localStorage` and applied when `init()` runs. Later calls overwrite earlier ones.

### `resetIdentity(): Promise<void>`

For logout. Sends what is queued under the current identity, clears the identity, generates a new visitor id and starts a new session (a new `session_start`). Before `init()` it only clears a pending identity. Throws during `destroy()`.

### `destroy(): void`

Stops every handler, sends what is queued with `sendBeacon`, removes all listeners and resets state. Call `init()` again to resume. Persisted batches stay in `localStorage` for the next `init()`. Throws if a `destroy()` is already in progress.

### `isInitialized(): boolean`

`true` after `init()` has resolved and until `destroy()`.

### `getSessionId(): string | null`

Current session id, or `null` before `init()`. Format: `{timestamp}-{9 base-36 characters}`.

### `getUserId(): string | null`

The random visitor UUID (stored in `localStorage` as `spoorly:uid`), or `null` before `init()`. Use it to join spoorly events with events from other tools.

## Configuration

Every option is optional.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | none | Receiver URL. `https:`, or `http:` only for `localhost`, `127.0.0.1` and `[::1]`. Omit it for standalone mode: no network requests |
| `sessionTimeout` | `number` (ms) | `900000` (15 min) | Inactivity before a new session starts. 30 s to 24 h |
| `globalMetadata` | `Record<string, MetadataType>` | `{}` | Sent with every batch as `global_metadata`. Fixed for the life of the instance; `destroy()` and `init()` again to change it |
| `sensitiveQueryParams` | `string[]` | `[]` | Query parameters to strip, added to the built-in list (see [README](./README.md#privacy)) |
| `samplingRate` | `number` (0 to 1) | `1` | Fraction of events kept, decided per event. `web_vitals` and `session_start` are never sampled out |
| `errorSampling` | `number` (0 to 1) | `1` | Fraction of `error` events kept |
| `pageViewThrottleMs` | `number` (ms) | `1000` | Minimum time between `page_view` events |
| `clickThrottleMs` | `number` (ms) | `300` | Minimum time between clicks on the same element |
| `maxSameEventPerMinute` | `number` | `60` | Custom events with the same name allowed per minute |
| `sendIntervalMs` | `number` (ms) | `10000` | Batch interval, 1 s to 60 s. A batch also goes out as soon as 50 events are queued. After failed sends the interval backs off, up to 2 minutes |
| `flushOnSpaNavigation` | `boolean` | `false` | Flush the queue after every `pushState`, `replaceState`, `popstate` and `hashchange` |
| `flushOnPageHidden` | `boolean` | `true` | Flush with `sendBeacon` when `document.hidden` becomes `true` |
| `webVitalsMode` | `'all' \| 'needs-improvement' \| 'poor'` | `'all'` | Which measured values are kept. `'all'` keeps every value |
| `webVitalsThresholds` | `Partial<Record<'LCP' \| 'CLS' \| 'INP' \| 'FCP' \| 'TTFB', number>>` | none | Overrides the thresholds of the selected mode |

`webVitalsMode` thresholds (a value at or below the threshold is dropped):

| Mode | LCP | FCP | CLS | INP | TTFB |
| --- | --- | --- | --- | --- | --- |
| `'needs-improvement'` | 2500 | 1800 | 0.1 | 200 | 800 |
| `'poor'` | 4000 | 3000 | 0.25 | 500 | 1800 |

## Event types

Every event has:

```ts
interface EventData {
  id: string;            // `{timestamp}-{sequence}-{random}`, unique per event
  type: EventType;       // see below
  page_url: string;      // current URL, sensitive query parameters removed
  timestamp: number;     // Unix ms
  referrer?: string;     // external referrer the session started with, or 'Direct'
  from_page_url?: string; // previous URL, on SPA page views
  utm?: UTM;             // utm_source/medium/campaign/term/content of the landing URL
  click_ids?: ClickIds;  // gclid, gbraid, wbraid, fbclid, ttclid of the landing URL
  // plus exactly one of the type-specific blocks below
}
```

`referrer`, `utm` and `click_ids` are captured when the session starts and repeated on every event of that session.

| `type` | Block | Captured |
| --- | --- | --- |
| `session_start` | none | When a new session starts. Not repeated when a session is recovered after a reload. There is no session end event: infer it from the last event |
| `page_view` | `page_view?: { referrer?, title? }` | On load and on every SPA navigation (`pushState`, `replaceState`, `popstate`, `hashchange`), throttled by `pageViewThrottleMs` |
| `click` | `click_data: { x, y, tag?, id?, class?, text?, href? }` | User clicks. `x`/`y` are viewport pixels; the element is the nearest interactive ancestor (button, link, form control, ARIA role, `.btn`…). Clicks on form controls carry no `text`, and form controls inside the element are left out of it. Synthetic `element.click()` calls at (0, 0) are skipped |
| `scroll` | `scroll_data: { depth, direction, container_selector }` | Scroll depth 0 to 100 and `'up'`/`'down'`, for the window and up to 10 auto-detected scroll containers. Debounced 250 ms; at most 120 per session |
| `custom` | `custom_event: { name, metadata? }` | `spoorly.event()` and `data-spoorly-name` clicks |
| `web_vitals` | `web_vitals: { schema: 'consolidated', metrics: { type, value }[] }` | One event per navigation with every metric measured (LCP, CLS, INP, FCP, TTFB), sent when the page is hidden or the SPA route changes. `metrics` is sorted by type and can be partial, for example no INP without interaction |
| `error` | `error_data: { type, message, name?, filename?, line?, column?, stack? }` | Uncaught errors (`'js_error'`) and unhandled rejections (`'promise_rejection'`). Message capped at 500 characters, stack at 2000, both PII-scrubbed. Identical errors within 5 s are dropped, the same error is kept at most 3 times per page view, and a burst of more than 10 distinct errors in a second pauses capture for 5 s |

Per-session caps: 1000 events in total, 500 clicks, 100 page views, 500 custom events and 120 scroll events. Overall, at most 50 events per second are accepted. Near-identical events within one second (clicks compared at 10 px precision) are dropped as duplicates.

## Delivery: critical events, SPAs and mobile

### Critical events

```ts
spoorly.event('purchase_completed', { orderId: 'ord-789' }, { critical: true });
window.location.href = '/thanks';
```

`critical: true` sends the queue with `sendBeacon` right after the event is tracked. The browser keeps a beacon alive even if the page unloads immediately, which a `fetch` does not guarantee. If a `fetch` is in flight at that moment, the beacon is sent as soon as it finishes. `critical` only changes how the event is delivered: sampling, rate limits, session caps and duplicate detection still apply, and an event they drop is not sent. `sendBeacon` caps a request at 64 KB; a larger batch is persisted and resent on the next `init()`. Without an endpoint, `critical` changes nothing.

Use it only for events that come right before a navigation. Everything else is covered by the batch interval and the automatic flushes.

### SPAs

`page_view` follows `pushState`, `replaceState`, `popstate` and `hashchange` on its own. Batches still leave on the interval; set `flushOnSpaNavigation: true` if you need delivery on every route change, at the cost of more requests.

### Mobile and page lifecycle

The queue is flushed with `sendBeacon` on `pagehide`, `beforeunload` and, unless `flushOnPageHidden: false`, when the page becomes hidden. The last one matters on iOS Safari, which often backgrounds or kills a tab without firing `pagehide`. A beacon is sent once; if the browser refuses it, the batch is persisted for the next `init()`. Keep custom metadata small so the queue fits in 64 KB.

## QA mode

Open any page with `?spoorly_mode=qa` to turn it on for the tab (stored in `sessionStorage`); `?spoorly_mode=qa_off` turns it off. In QA mode custom events are logged to the console and emitted to `on('event')` listeners but not queued or sent, and invalid custom events throw instead of being dropped. Outside QA mode a production page logs nothing except critical failures.

## Types

Every type is exported from the package:

```ts
import type {
  Config, WebVitalsMode, InitResult, EventOptions, MetadataType,
  EventData, EventType, ClickData, ScrollData, CustomEventData, PageViewData, ErrorData,
  WebVitalsConsolidatedData, WebVitalMetric, UTM, ClickIds,
  EventsQueue, IdentifyData, DeviceInfo,
  EmitterEvent, EmitterMap, EmitterCallback,
} from 'spoorly';
```

`MetadataType` is a string, number, boolean, string array, flat object or array of flat objects.
