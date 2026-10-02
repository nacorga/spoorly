/**
 * EventManager - permanent rejection by the endpoint
 *
 * A batch the endpoint rejects with a permanent 4xx (anything except 408/429)
 * is discarded: it leaves the queue, is not emitted to `queue` listeners and is
 * never sent again. Transient failures (5xx) keep the events queued for retry.
 */
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

import { setupTestEnvironment, cleanupTestEnvironment } from '../../helpers/setup.helper';
import { MOCK_DEVICE_INFO } from '../../helpers/fixtures.helper';
import { EventManager } from '../../../src/managers/event.manager';
import { SenderManager } from '../../../src/managers/sender.manager';
import { StorageManager } from '../../../src/managers/storage.manager';
import { EmitterEvent, EventType } from '../../../src/types';
import { QUEUE_KEY } from '../../../src/constants/storage.constants';
import { Emitter } from '../../../src/utils';

function response(status: number): unknown {
  const resp = {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    json: async (): Promise<unknown> => Promise.resolve({}),
    clone: (): unknown => resp,
  };
  return resp;
}

describe('EventManager - permanent rejection by the endpoint', () => {
  let eventManager: EventManager;
  let storageManager: StorageManager;
  let queueListener: Mock<(queue: unknown) => void>;
  let fetchMock: Mock<(...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    setupTestEnvironment();
    storageManager = new StorageManager();
    const emitter = new Emitter();
    queueListener = vi.fn<(queue: unknown) => void>();
    emitter.on(EmitterEvent.QUEUE, queueListener);
    eventManager = new EventManager(storageManager, emitter);

    eventManager['set']('userId', 'user-reject');
    eventManager['set']('device', MOCK_DEVICE_INFO);
    eventManager['set']('pageUrl', 'https://example.com/reject');
    eventManager['set']('sessionId', 'session-reject');

    const sender = new SenderManager(storageManager, 'https://collect.example.com/collect');
    vi.spyOn(sender as unknown as { backoffDelay: () => Promise<void> }, 'backoffDelay').mockResolvedValue(undefined);
    const senders = eventManager['dataSenders'];
    senders.length = 0;
    senders.push(sender);

    fetchMock = vi.fn<(...args: unknown[]) => Promise<unknown>>();
    (globalThis as { fetch: unknown }).fetch = fetchMock;
  });

  afterEach(() => {
    eventManager.stop();
    cleanupTestEnvironment();
  });

  it('discards a batch rejected with 400 and never resends it', async () => {
    fetchMock.mockResolvedValue(response(400));
    eventManager.track({ type: EventType.CUSTOM, custom_event: { name: 'rejected' } });

    await eventManager.flushImmediately();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(eventManager.getQueueLength()).toBe(0);
    expect(queueListener).not.toHaveBeenCalled();
    expect(storageManager.getItem(QUEUE_KEY('user-reject'))).toBeNull();

    await eventManager.flushImmediately();
    eventManager.flushImmediatelySync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps a batch that failed with 500 queued for retry', async () => {
    fetchMock.mockResolvedValue(response(500));
    eventManager.track({ type: EventType.CUSTOM, custom_event: { name: 'transient' } });

    await eventManager.flushImmediately();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(eventManager.getQueueLength()).toBe(1);
    expect(queueListener).not.toHaveBeenCalled();
  });
});
