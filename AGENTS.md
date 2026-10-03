# AGENTS.md

Guidance for coding agents (and humans) working in this repository.

## Overview

spoorly is a vendor-neutral browser autocapture library. It captures clicks, scroll, page views, sessions, web vitals and errors, emits them to in-page listeners and, when `endpoint` is configured, delivers them in batches to that URL.

**Core principle:** client-only first. Standalone (no `endpoint`) makes no network requests; delivery is opt-in.

**No internal task or audit references.** Code comments, test and `describe` names, and docs describe *behavior*, never the task, ticket, plan step or audit that produced the change. Cite external RFCs as "section N".

Product docs: [README.md](./README.md), [API_REFERENCE.md](./API_REFERENCE.md), [SECURITY.md](./SECURITY.md), [TESTING.md](./TESTING.md), [CONTRIBUTING.md](./CONTRIBUTING.md), and the READMEs in `src/handlers` and `src/managers`.

## Commands

```bash
npm run build:all          # ESM + CJS (tsup) + browser IIFE/ESM bundles (Vite)
npm run check              # ESLint + Prettier check
npm run fix                # auto-fix lint and format
npm run type-check         # tsc --noEmit (strict)
npm test                   # unit + integration (Vitest)
npm run test:unit -- <file>
npm run test:integration -- <file>
npm run test:coverage      # unit coverage, 70% threshold
npm run test:e2e           # Playwright; starts the playground (:3000) and the receiver (:8787)
npm run size               # gzip budget of dist/browser/spoorly.js
npm run docs:dev           # playground with a dev build
node examples/receiver/server.mjs   # reference receiver
```

Before committing: `npm run check && npm run type-check && npm test && npm run build:all && npm run size`, all green.

## Architecture

```text
User interaction → handler → EventManager.track()
  → validation, deduplication, rate limits, sampling, session caps
  → queue → batch every sendIntervalMs (10 s) or at 50 events
  → emit 'event' to local listeners
  → [endpoint configured] SenderManager → fetch / sendBeacon → receiver
```

```text
App (orchestrator, one instance per page; src/app.ts)
├── Managers (src/managers)
│   ├── StateManager     shared global state, base class of everything
│   ├── StorageManager   localStorage/sessionStorage with in-memory fallback
│   ├── EventManager     queue, dedup, limits, batching, emitting
│   ├── SenderManager    transport, retries, persistence, 429 cooldown, circuit breaker
│   ├── SessionManager   lifecycle, BroadcastChannel sync, recovery
│   ├── UserManager      visitor UUID
│   └── TimeManager      monotonic timestamps
└── Handlers (src/handlers, extend StateManager)
    ├── SessionHandler, PageViewHandler, ClickHandler
    ├── ScrollHandler, PerformanceHandler (web-vitals), ErrorHandler
```

Entry points: `src/public-api.ts` (exports `spoorly`, `PII_PATTERNS` and the documented types), `src/api.ts` (public functions), `src/app.ts`. Build configs: `tsup.config.ts`, `vite.config.mjs` (the IIFE footer implements the `data-endpoint` autoinit). Storage keys and constants: `src/constants/`.

State access in every component: `this.get('sessionId')`, `this.set('config', config)`, `this.getState()`.

## Critical patterns

### Initialization order

```ts
spoorly.on('event', handler);                 // 1. listeners before init
spoorly.identify('cust_123', { plan: 'pro' }); // 2. optional, before or after init
const { sessionId } = await spoorly.init({ endpoint: 'https://api.example.com/collect' }); // 3.
spoorly.event('button_click', { id: 'cta' });  // 4. custom events after init
```

`session_start` and `page_view` fire during `init()`, so later listeners miss them. Pre-init identity is stored and applied on `init()`. A second `init()` returns the current session and ignores its config (with a dev warning if the config differs).

### Modes

- **Standalone** (`init()` with no `endpoint`): no `SenderManager`, no requests; batches are only emitted on `'queue'`.
- **Endpoint** (`init({ endpoint })`): `https:`, or `http:` for `localhost`/`127.0.0.1`/`[::1]` only. One immutable URL per `SenderManager`. Requests use `credentials: 'omit'` and `Content-Type: text/plain;charset=UTF-8` (beacons: a `text/plain` Blob), so receivers need no preflight and only `Access-Control-Allow-Origin: *`.
- **Autoinit**: only the IIFE bundle, only when the script tag has `data-endpoint`.

### Queue and delivery

Optimistic removal with `localStorage` persistence on failure. Don't change it to pessimistic removal: that duplicates events and grows the queue without bound.

| Response | Retries | Persistence |
| --- | --- | --- |
| 2xx | None | Cleared |
| 4xx except 408, 429 | None | Discarded |
| 408, 5xx, network error, 15 s timeout | Up to 2 (200–300 ms, 400–500 ms) | After the last attempt |
| 429 | None; 60 s cooldown in `localStorage`, shared across tabs | Immediate |
| `sendBeacon` rejected, unavailable or over 64 KB | None | Immediate |

- Persisted batches (`spoorly:{userId}:queue`) carry `_metadata.idempotency_token` (FNV-1a of the sorted event ids, salted with `user_id` and `session_id`) and are recovered on `init()` and on a bfcache `pageshow`. A batch older than 2 hours, or one that failed recovery 3 times, is dropped. Another tab's persistence within 1 s is not overwritten.
- Circuit breaker: 3 consecutive sends without an HTTP response open it for 2 minutes, then one probe batch.
- Flush triggers besides the interval: `pagehide`/`beforeunload` (always, `sendBeacon`), page hidden (`flushOnPageHidden`, default on, `sendBeacon`), SPA navigation (`flushOnSpaNavigation`, default off), and `event(name, meta, { critical: true })`. A sync flush requested while a `fetch` is in flight is deferred and re-run in that send's `finally`.
- Delivery is at-least-once and unordered: receivers dedupe by `event.id` and sort by `timestamp`.

### Sessions

Cross-tab sync over BroadcastChannel; recovery from `localStorage` on reload, with a `sessionStorage` mirror for when `localStorage` is empty (external redirects); no duplicate `session_start` on recovery; default timeout 15 minutes. Session key `spoorly:session`, channel `spoorly:broadcast`.

### Limits

Deduplication drops an identical event within 1 s (clicks compared at 10 px). 50 events per second, `maxSameEventPerMinute` per custom name, per-session caps (1000 total, 500 clicks, 100 page views, 500 custom, 120 scroll). Event ids are `{timestamp}-{sequence}-{random}`.

## Testing

Full guide: [TESTING.md](./TESTING.md).

- Unit (`tests/unit/`), integration (`tests/integration/`) and e2e (`tests/e2e/`) suites. Coverage threshold 70%; never lower it.
- **The library never adapts to tests.** `src/test-bridge.ts` (dev builds only, `window.__spoorlyBridge`) exposes internals for integration and e2e tests. Production code gets no test hooks.
- Integration tests use `tests/helpers/bridge.helper.ts` (`initTestBridge`, `destroyTestBridge`) with `setupTestEnvironment()`/`cleanupTestEnvironment()`, never `window.__spoorlyBridge` directly. Omit `endpoint` for standalone; mock `fetch`/`sendBeacon` from `tests/helpers/mocks.helper.ts` to test delivery.
- E2E: open `/?auto-init=false`, poll for the bridge inside `page.evaluate()` (never `page.waitForFunction()`, which CSP can block), call `destroy(true)` before `init()`, wait at least 200 ms after acting.
- Never `vi.runAllTimersAsync()` (the send loop never ends); use `vi.advanceTimersByTimeAsync()` + `vi.runOnlyPendingTimersAsync()`.
- Event types are lowercase in filters: `'click'`, not `'CLICK'`.
- Tests pass consistently (no flakes), and stay fast.

## Critical don'ts

**Code**

- No runtime dependencies besides `web-vitals`.
- Don't mutate global state directly; use `StateManager.set()`.
- Don't create more than one `App` instance.
- Everything must be SSR-safe: guard `window`/`document` access.
- Don't switch optimistic removal to pessimistic.
- Don't commit without `npm run check` passing.

**Performance**

- Always clean up listeners and timers in `stopTracking()`/`destroy()`.
- Use passive listeners; never block the main thread.
- Throttle or debounce high-frequency events.

## Logging policy

Production is silent; development is verbose.

| Visibility | Production | Development | Use |
| --- | --- | --- | --- |
| `'critical'` | Always | Always | Failures that must reach error monitoring |
| `'qa'` | QA mode only | Always | Custom event verification |
| none | Never | Always | Everything else |

- `debug` for internal operations and graceful degradation.
- `warn` only for problems the integrating developer can fix (invalid config, limits hit).
- `error` for real failures.
- If the developer can't act on it, it's `debug`. Visitors of a site running spoorly never see logs unless they enable QA mode (`?spoorly_mode=qa`, off with `qa_off`).
- Every message is prefixed `[spoorly]`.

## Comment policy

Use comments for JSDoc on public APIs, section separators in constants files, non-obvious algorithms, design rationale (the *why*), edge cases and magic numbers.

Don't use them to restate the code, state the obvious, describe types TypeScript already shows, or narrate history ("changed from…", "added for…").

## Browser support

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+. Degrades gracefully without BroadcastChannel, `sendBeacon` or storage. All public methods no-op without `window`.
