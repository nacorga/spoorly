/**
 * Integration: framework router patching coexistence
 *
 * spoorly patches `window.history.pushState` and `replaceState` inside
 * `PageViewHandler.startTracking()` to detect SPA route changes for any
 * client framework (Angular Router, React Router, Vue Router, vanilla). The
 * patch wraps the existing function, so multiple patches form a chain.
 *
 * These tests verify the chain mechanics: consumer-installed wrappers fire
 * in both directions (before/after spoorly init), and `destroy()` leaves
 * the consumer wrapper intact. Whether a `page_view` event is queued for a
 * given URL is covered by the dedicated page-view handler tests — here we
 * focus on the *wrapper chain*, which is framework-agnostic.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { setupTestEnvironment, cleanupTestEnvironment } from '../../helpers/setup.helper';
import { initTestBridge, destroyTestBridge } from '../../helpers/bridge.helper';
import { createMockFetch } from '../../helpers/mocks.helper';
import type { SpoorlyTestBridge } from '../../../src/types';

describe('Integration: framework router patching coexistence', () => {
  let bridge: SpoorlyTestBridge | null = null;
  let originalPushState: typeof window.history.pushState;
  let originalReplaceState: typeof window.history.replaceState;

  beforeEach(() => {
    setupTestEnvironment();
    global.fetch = createMockFetch({ ok: true, status: 200 });
    originalPushState = window.history.pushState.bind(window.history);
    originalReplaceState = window.history.replaceState.bind(window.history);
  });

  afterEach(() => {
    destroyTestBridge();
    bridge = null;
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    cleanupTestEnvironment();
  });

  it('consumer patch installed BEFORE spoorly init is still called when pushState fires', async () => {
    const consumerCalls: string[] = [];
    const native = window.history.pushState.bind(window.history);
    window.history.pushState = function (this: History, ...args: Parameters<typeof native>) {
      consumerCalls.push(String(args[2] ?? ''));
      native.apply(this, args);
    } as typeof native;

    bridge = await initTestBridge({
      pageViewThrottleMs: 0,
    });

    // After spoorly init, the public pushState is spoorly's wrapper. Calling
    // it must drill into the consumer wrapper (which holds the native call).
    window.history.pushState({}, '', '/consumer-then-spoorly');

    expect(consumerCalls).toContain('/consumer-then-spoorly');
  });

  it('consumer patch installed AFTER spoorly init still runs on every pushState', async () => {
    bridge = await initTestBridge({
      pageViewThrottleMs: 0,
    });

    // Consumer wraps the spoorly-installed wrapper. Both should fire.
    const consumerCalls: string[] = [];
    const spoorlyPatched = window.history.pushState.bind(window.history);
    window.history.pushState = function (this: History, ...args: Parameters<typeof spoorlyPatched>) {
      consumerCalls.push(String(args[2] ?? ''));
      spoorlyPatched.apply(this, args);
    } as typeof spoorlyPatched;

    window.history.pushState({}, '', '/spoorly-then-consumer');

    expect(consumerCalls).toContain('/spoorly-then-consumer');
  });

  it('replaceState patch chain works the same way as pushState', async () => {
    const consumerCalls: string[] = [];
    const native = window.history.replaceState.bind(window.history);
    window.history.replaceState = function (this: History, ...args: Parameters<typeof native>) {
      consumerCalls.push(String(args[2] ?? ''));
      native.apply(this, args);
    } as typeof native;

    bridge = await initTestBridge({
      pageViewThrottleMs: 0,
    });

    window.history.replaceState({}, '', '/replace-consumer-then-spoorly');

    expect(consumerCalls).toContain('/replace-consumer-then-spoorly');
  });

  it('destroy() leaves the consumer wrapper active — next pushState still fires consumer', async () => {
    const consumerCalls: string[] = [];
    const native = window.history.pushState.bind(window.history);
    const consumerWrapper = function (this: History, ...args: Parameters<typeof native>): void {
      consumerCalls.push(`consumer:${String(args[2] ?? '')}`);
      native.apply(this, args);
    };
    window.history.pushState = consumerWrapper as typeof native;

    bridge = await initTestBridge({
      pageViewThrottleMs: 0,
    });

    // Spoorly has wrapped the consumer wrapper. The public reference is no
    // longer the consumer wrapper directly. (Reading the method as a property
    // for identity comparison — not invoking it — so unbound-method lint
    // warning does not apply.)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(window.history.pushState).not.toBe(consumerWrapper);

    bridge.destroy(true);
    bridge = null;

    // After destroy, the next pushState call must still drill into the
    // consumer's wrapper (spoorly must not have left a dangling wrapper that
    // bypasses or swallows the consumer's logic).
    window.history.pushState({}, '', '/after-destroy');
    expect(consumerCalls).toContain('consumer:/after-destroy');
  });
});
