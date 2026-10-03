# Managers

Core components for event processing, state, sessions, transport and storage. All of them extend `StateManager`.

## EventManager

Validates, deduplicates, limits, queues and batches every event, then hands batches to the `SenderManager` (when an endpoint is configured) and emits them to local listeners.

- **Queue and batching** — batches leave every `sendIntervalMs` (default 10 s) and as soon as 50 events are queued. The queue holds at most 100 events; past that, the oldest event other than `SESSION_START` is dropped. Events are grouped by the session they were tracked in, so a session renewal never mixes sessions in one batch, and `SESSION_START` is always first.
- **Backoff** — after failed sends the interval doubles per consecutive failure, up to 2 minutes. After 5 consecutive failures the 50-event early send is suspended until a send succeeds.
- **Deduplication** — fingerprints of recent events (clicks rounded to 10 px); an identical event within 1 s is dropped. At most 1500 fingerprints are kept, pruned when older than 10 s.
- **Rate limits** — 50 events per second overall and `maxSameEventPerMinute` (default 60) per custom event name. `SESSION_START` is exempt from the global limit.
- **Per-session caps** — 1000 events in total, 500 clicks, 100 page views, 500 custom events, 120 scrolls. Counts are persisted in `localStorage` (`spoorly:{userId}:session_counts:{sessionId}`) so a reload doesn't reset them; stale counts are cleaned after 7 days.
- **Sampling** — `samplingRate` applies per event. `WEB_VITALS` and `SESSION_START` are exempt, so sampling never thins the Core Web Vitals sample.
- **Pending buffer** — up to 100 events tracked before the session exists are buffered and replayed once it starts.
- **Standalone mode** — with no endpoint there is no sender; batches are only emitted on `EmitterEvent.QUEUE`.
- **QA mode** — custom events are logged and emitted on `EmitterEvent.EVENT` but not queued.

**Sync flush deferral.** If a `fetch` send is in flight when `flushImmediatelySync()` runs (for example for a `critical` event), the sync flush is deferred (`pendingSyncFlush`) and re-run from the async send's `finally`. That avoids sending the same events twice under different idempotency tokens while still delivering events tracked mid-flight.

**Public API:** `track(event)`, `flushImmediately()` (async, `fetch`), `flushImmediatelySync()` (`sendBeacon`), `recoverPersistedEvents()`, `getQueueLength()`, `stop()`.

**`hasStartSession`** prevents duplicate `SESSION_START`: set when one is tracked, reset in `stop()`. Secondary tabs that adopt a session over BroadcastChannel never set it.

On `App.destroy()`, handlers stop first, then the queue is flushed with `sendBeacon`, then `EventManager.stop()` runs.

## SenderManager

Delivers batches to the configured `endpoint` (one immutable URL per instance).

- **Transport** — `fetch` with `keepalive: true`, `credentials: 'omit'` and `Content-Type: text/plain;charset=UTF-8`, aborted after 15 s; or `navigator.sendBeacon()` with a `text/plain;charset=UTF-8` Blob for page hide, unload and critical events.
- **Request metadata** — every request carries `_metadata`: `client_version` (from `package.json`), a monotonic `timestamp`, `referer` (current URL, sensitive parameters removed) and `idempotency_token`, a 32-bit FNV-1a hash of the sorted event ids salted with `user_id` and `session_id`, stable across retries and recovery.
- **Retries** — 5xx, 408, timeouts and network errors are retried up to twice, with `100 ms * 2^attempt` plus up to 100 ms of jitter (200–300 ms, then 400–500 ms). Other 4xx responses are permanent: no retry, the batch is discarded, and the error log is throttled per status code.
- **429** — no retry. Arms a 60 s cooldown stored in `localStorage` (`spoorly:{userId}:rate_limit`), so every tab on the origin and every page load honors it. Sends during the cooldown are persisted instead.
- **Circuit breaker** — after 3 consecutive sends that fail with no HTTP response (DNS, connection refused), sends are skipped for 2 minutes, then one probe batch goes through. Success closes the circuit; failure reopens it.
- **Persistence** — failed batches are saved to `spoorly:{userId}:queue` with their idempotency token. Another tab persisting within the last second is not overwritten.
- **Recovery** — on `init()` and on a back/forward cache restore, a persisted batch younger than 2 hours is resent (individual events older than 6 days are dropped). Each failed recovery increments `recoveryFailures`; at 3 the batch is discarded. A concurrent recovery is skipped.
- **Beacon limits** — a payload over 64 KB, a missing `sendBeacon` or a rejected beacon persists the batch for the next recovery.

With no `endpoint`, no `SenderManager` is created and no request is ever made.

## SessionManager

Session lifecycle, cross-tab sync and recovery.

- **Lifecycle** — a session ends after `sessionTimeout` (default 15 min, 30 s to 24 h) without activity (`click`, `keydown`, `scroll`). After a timeout, the next interaction starts a new session with a new `SESSION_START`, which keeps SPAs from running without a session id.
- **Session id** — `{timestamp}-{9 base-36 characters}`; a stored id that doesn't match the format is discarded.
- **Storage** — `spoorly:session` in `localStorage` holds the id, last activity time and the session's referrer, UTM and ad click ids. Every write is mirrored to `sessionStorage`, so when `localStorage` is empty (for example after an external redirect) the session is recovered from the mirror. The timeout still applies.
- **Recovery** — a recovered session never emits `SESSION_START` again.
- **Cross-tab sync** — a BroadcastChannel (`spoorly:broadcast`) shares new sessions. Only `action: 'session_start'` messages less than 5 s old are accepted. The channel is opened before `SESSION_START` is tracked so no message is lost. Without BroadcastChannel, sessions still work per tab.
- **Visibility** — the timeout timer stops while the page is hidden; when it becomes visible again, a session whose last activity is older than the timeout is renewed.
- **Rollback** — if `startTracking()` fails, everything it set up is undone and the error is rethrown.

There is no session end event: a receiver infers the end from the last event.

## StateManager

Abstract base class: one shared in-memory state for every component.

- `this.get(key)` / `this.set(key, value)` read and write; `this.getState()` returns a read-only shallow copy.
- Keys (see `src/types/state.types.ts`): `config`, `apiUrl`, `sessionId`, `userId`, `device`, `pageUrl`, `identity`, `mode`, `hasStartSession`, `suppressNextScroll`, `scrollEventCount`, `sessionReferrer`, `sessionUtm`, `sessionClickIds`.
- `getGlobalState()` and `resetGlobalState()` exist for tests and the TestBridge; resetting in production breaks the running instance.

## StorageManager

`localStorage` and `sessionStorage` wrapper with an in-memory fallback.

- Each storage is probed at startup with a write-then-remove of `__spoorly_test__`; where writes throw (private modes, disabled storage), an in-memory map is used instead.
- On `QuotaExceededError` it runs one cleanup pass and retries the write once. The pass removes every `spoorly:…:queue` key (persisted batches, the largest and safest to drop) and up to 5 other `spoorly:` keys, never the user id, session, identity, pending identity or rate-limit keys.

## TimeManager

Monotonic timestamps: `now()` is the boot `Date.now()` plus `performance.now()` elapsed, so a system clock change mid-session doesn't skew events. Falls back to `Date.now()` without `performance.now()`. `validateTimestamp()` rejects timestamps more than 2 minutes in the future.

## UserManager

`getId(storageManager)` returns the visitor id: a random UUID v4 stored in `localStorage` as `spoorly:uid` (in memory when storage is unavailable), reused across sessions. `resetIdentity()` replaces it.
