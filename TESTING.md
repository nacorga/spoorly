# Testing

Three suites, all run in CI:

| Suite | Tool | Location | Command |
| --- | --- | --- | --- |
| Unit | Vitest + jsdom | `tests/unit/` | `npm run test:unit` |
| Integration | Vitest + jsdom | `tests/integration/flows/` | `npm run test:integration` |
| E2E | Playwright | `tests/e2e/critical-paths/` | `npm run test:e2e` |

`npm test` runs unit and integration. `npm run test:coverage` runs the unit suite with coverage; the 70% threshold in `vitest.config.mjs` fails the run below it and is never lowered. Run a single file with `npm run test:unit -- sender-manager.test.ts`, `npm run test:integration -- session-mirror.test.ts` or `npx playwright test endpoint-delivery`.

## Layout

```text
tests/
├── unit/{core,handlers,managers,utils,examples}/             one file per component
├── integration/flows/                                         managers working together
├── e2e/
│   ├── critical-paths/      specs (endpoint delivery, page lifecycle, clicks, scroll, errors, web vitals, prerender…)
│   ├── fixtures/            small HTML pages for edge cases (minimal, SPA, forms)
│   ├── helpers/             in-page code snippets, wait constants, typed assertions
│   └── TEMPLATE.spec.ts     starting point for a new spec (ignored by the runner)
├── helpers/                 shared Vitest helpers (bridge, setup, mocks, fixtures, assertions, waits)
└── setup.ts, vitest-setup.ts
```

Everything in `tests/` is TypeScript, linted and formatted with the source.

## TestBridge

Tests adapt to the library, never the other way round: production code has no test hooks. `src/test-bridge.ts` is the adapter. It is only included when `NODE_ENV=development` (Vitest and the e2e dev build) and appears as `window.__spoorlyBridge`, a subclass of `App` that also exposes internal state: `getQueueEvents()`, `getQueueLength()`, `getSessionData()`, `getFullState()`, the managers and handlers (`getEventManager()`, `getClickHandler()`…), `flushQueue()`, `clearQueue()` and `destroy(force)`.

| Test | Use the bridge? |
| --- | --- |
| Unit test of one component | No. Instantiate it and mock its collaborators |
| Unit test of `App` startup, integration tests | Yes, through `tests/helpers/bridge.helper.ts` |
| E2E | Yes, `window.__spoorlyBridge` inside `page.evaluate()` |

## Unit and integration pattern

Integration tests go through `bridge.helper.ts` (never `window.__spoorlyBridge` directly) and reset the environment around every test:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestEnvironment, cleanupTestEnvironment } from '../../helpers/setup.helper';
import { initTestBridge, destroyTestBridge } from '../../helpers/bridge.helper';
import type { SpoorlyTestBridge } from '../../../src/types';

describe('Custom events', () => {
  let bridge: SpoorlyTestBridge;

  beforeEach(async () => {
    setupTestEnvironment();
    bridge = await initTestBridge({ sessionTimeout: 30000 });
  });

  afterEach(() => {
    destroyTestBridge();
    cleanupTestEnvironment();
  });

  it('queues a custom event', () => {
    bridge.event('signup_started', { plan: 'pro' });
    const events = bridge.getQueueEvents();
    expect(events.at(-1)?.custom_event?.name).toBe('signup_started');
  });
});
```

`setupTestEnvironment()` clears mocks, both storages and the DOM and silences the console; `cleanupTestEnvironment()` also restores mocks, deletes `global.fetch` and clears timers.

Omitting `endpoint` is standalone mode: no sender exists and nothing touches the network. To test delivery, pass an `endpoint` and mock the transport:

```ts
import { createMockFetch, createMockFetchNetworkError, setupMockSendBeacon } from '../../helpers/mocks.helper';

global.fetch = createMockFetch({ ok: true, status: 200 });   // or { ok: false, status: 503 }
global.fetch = createMockFetchNetworkError();               // fetch rejects with TypeError
setupMockSendBeacon(true);                                  // navigator.sendBeacon returns true

const bridge = await initTestBridge({ endpoint: 'https://collect.example.com/collect' });
```

Read what was sent from the mock: `JSON.parse(fetchMock.mock.calls[0][1].body)` for `fetch`, or the Blob passed to `sendBeacon`.

### Fake timers

Never use `vi.runAllTimersAsync()`: the send loop is a recurring timer and it never finishes. Use `vi.advanceTimersByTimeAsync(ms)` followed by `vi.runOnlyPendingTimersAsync()`. To assert that something does not retry, real timers and a short wait are simpler than fake ones.

## E2E pattern

`npm run test:e2e` builds the dev bundle into `docs/` (`npm run docs:setup`), and Playwright starts the playground on `http://localhost:3000` and the reference receiver on `http://localhost:8787` (see `webServer` in `playwright.config.ts`). Locally it runs Chromium, Mobile Chrome, Firefox, WebKit and Mobile Safari; CI runs only the Chromium projects.

The playground initializes itself unless the URL has `?auto-init=false`. Specs open it that way and drive the bridge from inside the page:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?auto-init=false');
});

test('captures clicks', async ({ page }) => {
  const events = await page.evaluate(async () => {
    let retries = 0;
    while (!window.__spoorlyBridge && retries < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }

    const bridge = window.__spoorlyBridge!;
    bridge.destroy(true);
    await bridge.init();

    const captured: { type: string }[] = [];
    bridge.on('event', (event) => captured.push(event));

    document
      .querySelector('button')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 100, clientY: 100 }));
    await new Promise((resolve) => setTimeout(resolve, 200));

    return captured;
  });

  expect(events.some((e) => e.type === 'click')).toBe(true);
});
```

Rules:

- **No `page.waitForFunction()`.** Its predicate runs as eval-style code, which a Content-Security-Policy without `'unsafe-eval'` blocks. Poll inside `page.evaluate()` instead, so specs keep working on CSP-protected pages.
- **Always `destroy(true)` before `init()`**, so a test never inherits the previous instance.
- **Wait after acting.** At least 200 ms for clicks and custom events, 500 ms for scroll (250 ms debounce), 1100 ms between page views (1 s throttle). `E2E_WAIT_TIMES` in `tests/e2e/helpers/bridge.helper.ts` has the documented values.
- **Return serializable data** from `page.evaluate()`: events and plain objects, never the bridge.
- **Event types are lowercase**: `'click'`, `'session_start'`, never `'CLICK'`.
- **Delivery tests use the real receiver.** `endpoint-delivery.spec.ts` loads `docs/autoinit.html` and polls `GET http://localhost:8787/received`. The receiver is shared by every worker and project, so give each test's events a unique marker.

A bare `element.click()` produces an untrusted click at (0, 0), which the click handler skips. Dispatch a `MouseEvent` with non-zero `clientX`/`clientY`, or use `page.click()`, when the test needs a `click` event (a `data-spoorly-name` custom event fires either way).

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No events at all | Lowercase event types; `samplingRate`/`errorSampling` not 0; listener registered before `init()` |
| Expected event missing | Throttles (clicks 300 ms per element, page views 1 s), duplicate detection (same event within 1 s), session caps, `maxSameEventPerMinute` |
| Queue empty after tracking | A flush already ran: in standalone mode listen to `'queue'`; with an endpoint inspect the `fetch`/`sendBeacon` mock. Persisted batches sit in `localStorage` under `spoorly:{userId}:queue` |
| Cross-tab message ignored | The BroadcastChannel is `spoorly:broadcast`, and messages need `action: 'session_start'` and a timestamp under 5 s old |
| State leaks between tests | `setupTestEnvironment()`/`cleanupTestEnvironment()` in every file; `destroyTestBridge()` in `afterEach` |
| E2E bridge never appears | The page must load the dev bundle: rerun `npm run docs:setup` |
| Flaky timing | Use the `E2E_WAIT_TIMES` constants rather than ad-hoc sleeps |

When a test fails, decide first whether the test or the library is wrong: a test that relies on internal timing or on state left by another test is a test bug; behavior that contradicts the documented API is a library bug, and gets its own failing test before the fix.
