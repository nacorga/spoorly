/**
 * SenderManager - Coverage Tests
 *
 * Exercises the send path: queue send (async), sendBeacon (sync),
 * retry/backoff, permanent vs transient errors, 429 rate-limit cooldown
 * (mirrored to localStorage), network circuit breaker, persistence +
 * recovery, and idempotency token determinism.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestEnvironment, cleanupTestEnvironment } from '../../helpers/setup.helper';
import { createMockQueue, createMockEvent, MOCK_DEVICE_INFO } from '../../helpers/fixtures.helper';
import { SenderManager } from '../../../src/managers/sender.manager';
import { StorageManager } from '../../../src/managers/storage.manager';
import { EventType, type EventsQueue } from '../../../src/types';
import { QUEUE_KEY, RATE_LIMIT_KEY } from '../../../src/constants/storage.constants';
import { TEXT_PLAIN_CONTENT_TYPE } from '../../../src/constants/config.constants';

const PROD_URL = 'https://collect.example.com/collect';
const USER_ID = 'user-test';

/**
 * Lightweight Response-shaped object. We avoid `new Response()` because CI's
 * Node version may not expose `Response` as a global, and the SenderManager
 * only touches `.ok`, `.status`, `.statusText`, `.json()`, and `.clone()`.
 */
interface MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
  clone: () => MockResponse;
}

function jsonResponse(status: number, body: unknown = {}): MockResponse {
  const resp: MockResponse = {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    json: async () => Promise.resolve(body),
    clone: () => resp,
  };
  return resp;
}

function emptyResponse(status: number): MockResponse {
  const resp: MockResponse = {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    json: async () => Promise.resolve({}),
    clone: () => resp,
  };
  return resp;
}

function makeSender(apiUrl = PROD_URL): { sender: SenderManager; storage: StorageManager } {
  const storage = new StorageManager();
  const sender = new SenderManager(storage, apiUrl);
  sender['set']('userId', USER_ID);
  return { sender, storage };
}

function makeQueue(eventCount = 2, overrides?: Partial<EventsQueue>): EventsQueue {
  const events = Array.from({ length: eventCount }, () => createMockEvent(EventType.CUSTOM));
  return createMockQueue(events, {
    user_id: USER_ID,
    session_id: 'session-test',
    device: MOCK_DEVICE_INFO,
    ...overrides,
  });
}

describe('SenderManager - async send via fetch()', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('sends successfully on HTTP 200 and clears persisted events', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    (global as any).fetch = fetchMock;

    const { sender, storage } = makeSender();
    // Pre-seed persisted data to confirm clearing.
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify({ events: [], timestamp: Date.now() }));

    const onSuccess = vi.fn();
    const ok = await sender.sendEventsQueue(makeQueue(), { onSuccess });

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });

  it.each([
    ['204 without body', 204, 'No Content'],
    ['200 with non-JSON body', 200, 'OK'],
  ])('treats %s as success without reading the body', async (_label, status, statusText) => {
    const json = vi.fn(async () => Promise.reject(new SyntaxError('no JSON body')));
    const text = vi.fn(async () => Promise.resolve('not json'));
    const response = { ok: true, status, statusText, json, text, clone: (): unknown => response };
    (global as any).fetch = vi.fn().mockResolvedValue(response);

    const { sender } = makeSender();
    const onSuccess = vi.fn();

    const ok = await sender.sendEventsQueue(makeQueue(1), { onSuccess });

    expect(ok).toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(json).not.toHaveBeenCalled();
    expect(text).not.toHaveBeenCalled();
  });

  it('attaches idempotency_token, client_version and referer to the request payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    (global as any).fetch = fetchMock;

    const { sender } = makeSender();
    await sender.sendEventsQueue(makeQueue(1));

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(PROD_URL);
    expect(init.method).toBe('POST');
    expect(init.keepalive).toBe(true);

    const payload = JSON.parse(init.body);
    expect(payload._metadata.idempotency_token).toMatch(/^[0-9a-f]{8}$/);
    expect(payload._metadata.client_version).toBeTruthy();
    expect(typeof payload._metadata.timestamp).toBe('number');
  });

  it('retries on transient 500 and persists after all attempts exhausted', async () => {
    const fetchMock = vi.fn().mockResolvedValue(emptyResponse(500));
    (global as any).fetch = fetchMock;

    const { sender, storage } = makeSender();
    const onFailure = vi.fn();
    const ok = await sender.sendEventsQueue(makeQueue(), { onFailure });

    expect(ok).toBe(false);
    // MAX_SEND_RETRIES = 2, so total attempts = 3 (1 + 2 retries).
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(storage.getItem(QUEUE_KEY(USER_ID))).not.toBeNull();
  }, 10_000);

  it('does NOT retry on permanent 4xx and discards persisted events', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(400, { error: 'BadRequestException' }));
    (global as any).fetch = fetchMock;

    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), 'preexisting');

    const onFailure = vi.fn();
    const ok = await sender.sendEventsQueue(makeQueue(), { onFailure });

    expect(ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onFailure).toHaveBeenCalledTimes(1);
    // Permanent errors clear pre-existing persistence to break retry loops.
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });

  it('does retry on 408 Request Timeout (treated as transient)', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(emptyResponse(408)).mockResolvedValueOnce(jsonResponse(200));
    (global as any).fetch = fetchMock;

    const { sender } = makeSender();
    const ok = await sender.sendEventsQueue(makeQueue());

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('arms 60s rate-limit cooldown on HTTP 429 and persists to localStorage', async () => {
    const fetchMock = vi.fn().mockResolvedValue(emptyResponse(429));
    (global as any).fetch = fetchMock;

    const { sender, storage } = makeSender();
    const ok = await sender.sendEventsQueue(makeQueue());

    expect(ok).toBe(false);
    // 429 is not retried.
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const raw = storage.getItem(RATE_LIMIT_KEY(USER_ID));
    expect(raw).not.toBeNull();
    const cooldownUntil = Number(raw);
    expect(cooldownUntil).toBeGreaterThan(Date.now());
    expect(cooldownUntil - Date.now()).toBeLessThanOrEqual(60_000 + 100);
  });

  it('skips subsequent sends while rate-limited and persists the batch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(emptyResponse(429));
    (global as any).fetch = fetchMock;

    const { sender, storage } = makeSender();
    await sender.sendEventsQueue(makeQueue());

    fetchMock.mockClear();

    // Second send must skip fetch() and persist.
    const ok = await sender.sendEventsQueue(makeQueue(3));
    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(storage.getItem(QUEUE_KEY(USER_ID))).not.toBeNull();
  });

  it('opens the network circuit after consecutive fetch rejections', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    (global as any).fetch = fetchMock;

    const { sender } = makeSender();

    // Three batches, each retried up to MAX_SEND_RETRIES + 1 = 3 times.
    // After 3 consecutive HTTP-less failures the circuit opens.
    for (let i = 0; i < 3; i++) {
      await sender.sendEventsQueue(makeQueue());
    }

    fetchMock.mockClear();

    const ok = await sender.sendEventsQueue(makeQueue());
    expect(ok).toBe(false);
    // Circuit open → no further fetch attempts.
    expect(fetchMock).not.toHaveBeenCalled();
  }, 20_000);
});

describe('SenderManager - sync send via sendBeacon', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('returns true when navigator.sendBeacon accepts the payload', () => {
    const beacon = vi.fn().mockReturnValue(true);
    (navigator as any).sendBeacon = beacon;

    const { sender } = makeSender();
    const ok = sender.sendEventsQueueSync(makeQueue());

    expect(ok).toBe(true);
    expect(beacon).toHaveBeenCalledTimes(1);
    const [url, blob] = beacon.mock.calls[0]!;
    expect(url).toBe(PROD_URL);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('persists when sendBeacon rejects the request', () => {
    const beacon = vi.fn().mockReturnValue(false);
    (navigator as any).sendBeacon = beacon;

    const { sender, storage } = makeSender();
    const ok = sender.sendEventsQueueSync(makeQueue());

    expect(ok).toBe(false);
    expect(storage.getItem(QUEUE_KEY(USER_ID))).not.toBeNull();
  });

  it('persists oversized payloads instead of calling sendBeacon', () => {
    const beacon = vi.fn().mockReturnValue(true);
    (navigator as any).sendBeacon = beacon;

    // Build a payload larger than the 64KB beacon cap by stuffing custom_event metadata.
    const huge = 'x'.repeat(70_000);
    const events = [createMockEvent(EventType.CUSTOM, { custom_event: { name: 'big', metadata: { payload: huge } } })];
    const queue: EventsQueue = {
      user_id: USER_ID,
      session_id: 'session-test',
      device: MOCK_DEVICE_INFO,
      events,
    };

    const { sender, storage } = makeSender();
    const ok = sender.sendEventsQueueSync(queue);

    expect(ok).toBe(false);
    expect(beacon).not.toHaveBeenCalled();
    expect(storage.getItem(QUEUE_KEY(USER_ID))).not.toBeNull();
  });

  it('skips sendBeacon and persists when rate-limited', () => {
    const beacon = vi.fn().mockReturnValue(true);
    (navigator as any).sendBeacon = beacon;

    const { sender, storage } = makeSender();
    // Arm cooldown via persisted key (simulates another tab that already got 429).
    storage.setItem(RATE_LIMIT_KEY(USER_ID), String(Date.now() + 60_000));

    // Reset internal cooldown so loadRateLimitCooldown() re-reads from storage.
    (sender as any).rateLimitedUntil = 0;

    const ok = sender.sendEventsQueueSync(makeQueue());

    expect(ok).toBe(false);
    expect(beacon).not.toHaveBeenCalled();
    expect(storage.getItem(QUEUE_KEY(USER_ID))).not.toBeNull();
  });
});

describe('SenderManager - persistence recovery', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('recovers persisted events from a previous session and clears storage on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    (global as any).fetch = fetchMock;

    const persisted = {
      ...makeQueue(2),
      timestamp: Date.now() - 1000,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(persisted));

    const onSuccess = vi.fn();
    await sender.recoverPersistedEvents({ onSuccess });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });

  it('discards expired persisted data (>2h old) without sending', async () => {
    const fetchMock = vi.fn();
    (global as any).fetch = fetchMock;

    const stale = {
      ...makeQueue(2),
      timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3h old
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(stale));

    await sender.recoverPersistedEvents();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });

  it('discards persisted events after MAX_RECOVERY_FAILURES attempts', async () => {
    const fetchMock = vi.fn();
    (global as any).fetch = fetchMock;

    const exhausted = {
      ...makeQueue(2),
      timestamp: Date.now() - 1000,
      recoveryFailures: 3,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(exhausted));

    const onFailure = vi.fn();
    await sender.recoverPersistedEvents({ onFailure });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });

  it('bumps recoveryFailures and re-persists when recovery send fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(emptyResponse(500));
    (global as any).fetch = fetchMock;

    const persisted = {
      ...makeQueue(1),
      timestamp: Date.now() - 1000,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(persisted));

    await sender.recoverPersistedEvents();

    const after = JSON.parse(storage.getItem(QUEUE_KEY(USER_ID)) ?? '{}');
    expect(after.recoveryFailures).toBe(1);
  }, 10_000);

  it('is idempotent — concurrent calls do not double-send', async () => {
    let resolveFetch!: (value: MockResponse) => void;
    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Promise<MockResponse>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    (global as any).fetch = fetchMock;

    const persisted = {
      ...makeQueue(1),
      timestamp: Date.now() - 1000,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(persisted));

    const first = sender.recoverPersistedEvents();
    const second = sender.recoverPersistedEvents(); // should bail out immediately

    resolveFetch(jsonResponse(200));
    await Promise.all([first, second]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears persisted events on permanent error during recovery', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(403, { error: 'ForbiddenException' }));
    (global as any).fetch = fetchMock;

    const persisted = {
      ...makeQueue(1),
      timestamp: Date.now() - 1000,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(persisted));

    const onFailure = vi.fn();
    await sender.recoverPersistedEvents({ onFailure });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });
});

describe('SenderManager - recovery age filter', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('drops events older than the recovery age cutoff during replay', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    (global as any).fetch = fetchMock;

    const cutoffMs = 6 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const staleEvent = createMockEvent(EventType.CUSTOM, {
      id: 'stale-evt',
      timestamp: now - cutoffMs - 60_000,
    });
    const freshEvent = createMockEvent(EventType.CUSTOM, {
      id: 'fresh-evt',
      timestamp: now - 60_000,
    });

    const persisted = {
      ...makeQueue(0, { events: [staleEvent, freshEvent] }),
      timestamp: now - 1000,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(persisted));

    await sender.recoverPersistedEvents();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.events).toHaveLength(1);
    expect(body.events[0].id).toBe('fresh-evt');
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });

  it('discards the whole batch and skips the network call when every event is stale', async () => {
    const fetchMock = vi.fn();
    (global as any).fetch = fetchMock;

    const cutoffMs = 6 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const staleEvents = [
      createMockEvent(EventType.CUSTOM, { id: 'a', timestamp: now - cutoffMs - 60_000 }),
      createMockEvent(EventType.CUSTOM, { id: 'b', timestamp: now - cutoffMs - 120_000 }),
    ];

    const persisted = {
      ...makeQueue(0, { events: staleEvents }),
      timestamp: now - 1000,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(persisted));

    await sender.recoverPersistedEvents();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(storage.getItem(QUEUE_KEY(USER_ID))).toBeNull();
  });

  it('keeps every event when all timestamps are within the recovery age cutoff', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    (global as any).fetch = fetchMock;

    const now = Date.now();
    const events = [
      createMockEvent(EventType.CUSTOM, { id: 'recent-1', timestamp: now - 60_000 }),
      createMockEvent(EventType.CUSTOM, { id: 'recent-2', timestamp: now - 120_000 }),
    ];

    const persisted = {
      ...makeQueue(0, { events }),
      timestamp: now - 1000,
    };
    const { sender, storage } = makeSender();
    storage.setItem(QUEUE_KEY(USER_ID), JSON.stringify(persisted));

    await sender.recoverPersistedEvents();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.events).toHaveLength(2);
    expect(body.events.map((e: { id: string }) => e.id)).toEqual(['recent-1', 'recent-2']);
  });
});

describe('SenderManager - idempotency token', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('produces the same token for the same event set', async () => {
    const tokens: string[] = [];
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      tokens.push(body._metadata.idempotency_token);
      return Promise.resolve(jsonResponse(200));
    });
    (global as any).fetch = fetchMock;

    const queue = makeQueue(3);
    const { sender } = makeSender();

    await sender.sendEventsQueue(queue);
    await sender.sendEventsQueue(queue);

    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toBe(tokens[1]);
    expect(tokens[0]).toMatch(/^[0-9a-f]{8}$/);
  });

  it('produces a different token for a different event set', async () => {
    const tokens: string[] = [];
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
      tokens.push(JSON.parse(init.body as string)._metadata.idempotency_token);
      return Promise.resolve(jsonResponse(200));
    });
    (global as any).fetch = fetchMock;

    const { sender } = makeSender();
    await sender.sendEventsQueue(makeQueue(2));
    await sender.sendEventsQueue(makeQueue(3));

    expect(tokens[0]).not.toBe(tokens[1]);
  });
});

describe('SenderManager - cross-origin friendly transport', () => {
  let originalUrl: string;

  beforeEach(() => {
    setupTestEnvironment();
    originalUrl = window.location.href;
  });
  afterEach(() => {
    window.history.replaceState({}, '', originalUrl);
    delete (navigator as any).sendBeacon;
    cleanupTestEnvironment();
  });

  it('posts a text/plain body without credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    (global as any).fetch = fetchMock;
    const { sender } = makeSender();

    await sender.sendEventsQueue(makeQueue(1));

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.credentials).toBe('omit');
    expect(init.headers).toEqual({ 'Content-Type': TEXT_PLAIN_CONTENT_TYPE });
    expect(JSON.parse(init.body).events).toHaveLength(1);
  });

  it('beacons a text/plain blob', () => {
    const beacon = vi.fn().mockReturnValue(true);
    (navigator as any).sendBeacon = beacon;
    const { sender } = makeSender();

    sender.sendEventsQueueSync(makeQueue(1));

    expect((beacon.mock.calls[0]![1] as Blob).type).toBe(TEXT_PLAIN_CONTENT_TYPE.toLowerCase());
  });

  it('keeps the endpoint query string intact on fetch and beacon', async () => {
    const endpoint = 'https://collect.example.com/collect?key=abc';
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    const beacon = vi.fn().mockReturnValue(true);
    (global as any).fetch = fetchMock;
    (navigator as any).sendBeacon = beacon;
    const { sender } = makeSender(endpoint);

    await sender.sendEventsQueue(makeQueue(1));
    sender.sendEventsQueueSync(makeQueue(1));

    expect(fetchMock.mock.calls[0]![0]).toBe(endpoint);
    expect(beacon.mock.calls[0]![0]).toBe(endpoint);
  });

  it('strips sensitive query params from the referer metadata', async () => {
    window.history.replaceState({}, '', '/checkout?token=secret&step=2');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    (global as any).fetch = fetchMock;
    const { sender } = makeSender();
    sender['set']('config', { sensitiveQueryParams: ['step'] });

    await sender.sendEventsQueue(makeQueue(1));

    const referer: string = JSON.parse(fetchMock.mock.calls[0]![1].body)._metadata.referer;
    expect(referer).toContain('/checkout');
    expect(referer).not.toContain('secret');
    expect(referer).not.toContain('step=2');
  });
});
