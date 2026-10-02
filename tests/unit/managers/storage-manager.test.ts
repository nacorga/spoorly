/**
 * StorageManager - Coverage Tests
 *
 * Exercises the simplified v3.0 storage wrapper: dual local + session storage,
 * automatic in-memory fallback when browser APIs are unavailable, and
 * single-pass quota-error cleanup that preserves critical keys.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestEnvironment, cleanupTestEnvironment } from '../../helpers/setup.helper';
import { StorageManager } from '../../../src/managers/storage.manager';
import { STORAGE_BASE_KEY, STORAGE_NAMESPACE } from '../../../src/constants/storage.constants';

describe('StorageManager - basic operations', () => {
  let storage: StorageManager;

  beforeEach(() => {
    setupTestEnvironment();
    storage = new StorageManager();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('reads, writes and removes localStorage items', () => {
    storage.setItem('key1', 'value1');
    expect(storage.getItem('key1')).toBe('value1');

    storage.removeItem('key1');
    expect(storage.getItem('key1')).toBeNull();
  });

  it('returns null for missing keys', () => {
    expect(storage.getItem('does-not-exist')).toBeNull();
  });

  it('overwrites existing values', () => {
    storage.setItem('key', 'a');
    storage.setItem('key', 'b');
    expect(storage.getItem('key')).toBe('b');
  });

  it('reads, writes and removes sessionStorage items', () => {
    storage.setSessionItem('skey', 'sval');
    expect(storage.getSessionItem('skey')).toBe('sval');

    storage.removeSessionItem('skey');
    expect(storage.getSessionItem('skey')).toBeNull();
  });

  it('keeps localStorage and sessionStorage isolated from each other', () => {
    storage.setItem('shared', 'local');
    storage.setSessionItem('shared', 'session');

    expect(storage.getItem('shared')).toBe('local');
    expect(storage.getSessionItem('shared')).toBe('session');
  });

  it('handles repeated removeItem calls without throwing', () => {
    storage.setItem('k', 'v');
    storage.removeItem('k');
    expect(() => {
      storage.removeItem('k');
    }).not.toThrow();
    expect(storage.getItem('k')).toBeNull();
  });
});

describe('StorageManager - fallback to in-memory', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('falls back to in-memory map when localStorage.getItem throws after initialization', () => {
    const storage = new StorageManager();
    storage.setItem('k', 'v');

    // Make Storage.prototype.getItem throw — manager must read from fallbackStorage.
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('SecurityError: storage disabled');
    });

    try {
      expect(storage.getItem('k')).toBe('v');
    } finally {
      Storage.prototype.getItem = original;
    }
  });

  it('falls back to in-memory for sessionStorage when getItem throws', () => {
    const storage = new StorageManager();
    storage.setSessionItem('sk', 'sv');

    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('SecurityError');
    });

    try {
      expect(storage.getSessionItem('sk')).toBe('sv');
    } finally {
      Storage.prototype.getItem = original;
    }
  });

  it('removeItem swallows real-storage exceptions without throwing', () => {
    const storage = new StorageManager();
    storage.setItem('k', 'v');

    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = vi.fn(() => {
      throw new Error('SecurityError');
    });

    try {
      expect(() => {
        storage.removeItem('k');
      }).not.toThrow();
    } finally {
      Storage.prototype.removeItem = original;
    }
  });

  it('removeSessionItem swallows real-storage exceptions without throwing', () => {
    const storage = new StorageManager();
    storage.setSessionItem('sk', 'sv');

    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = vi.fn(() => {
      throw new Error('SecurityError');
    });

    try {
      expect(() => {
        storage.removeSessionItem('sk');
      }).not.toThrow();
    } finally {
      Storage.prototype.removeItem = original;
    }
  });
});

describe('StorageManager - quota-exceeded cleanup', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('purges persisted queues and non-critical keys on QuotaExceededError, keeps critical keys, and retries setItem', () => {
    const storage = new StorageManager();

    localStorage.setItem(`${STORAGE_BASE_KEY}:user-1:queue`, '{"x":1}');
    localStorage.setItem(`${STORAGE_BASE_KEY}:queue`, '{"x":2}');
    localStorage.setItem(`${STORAGE_BASE_KEY}:user-1:session_counts:s1`, '{}');
    localStorage.setItem(`${STORAGE_BASE_KEY}:uid`, 'keep-uid');
    localStorage.setItem(`${STORAGE_BASE_KEY}:${STORAGE_NAMESPACE}:session`, 'keep-session');
    localStorage.setItem(`${STORAGE_BASE_KEY}:${STORAGE_NAMESPACE}:identity`, 'keep-identity');
    localStorage.setItem(`${STORAGE_BASE_KEY}:pending_identity`, 'keep-pending');
    localStorage.setItem(`${STORAGE_BASE_KEY}:user-1:rate_limit`, 'keep-rate-limit');
    localStorage.setItem('other_lib:queue', 'foreign');

    const originalSet = Storage.prototype.setItem;
    let attempt = 0;
    Storage.prototype.setItem = vi.fn(function (this: Storage, key: string, value: string) {
      // Only throw on the user's setItem for 'fresh-key', not on initialization probes or cleanup retries.
      if (key === 'fresh-key') {
        attempt++;
        if (attempt === 1) {
          const err = new Error('Quota');
          err.name = 'QuotaExceededError';
          throw err;
        }
      }
      originalSet.call(this, key, value);
    });

    try {
      storage.setItem('fresh-key', 'v');
    } finally {
      Storage.prototype.setItem = originalSet;
    }

    expect(localStorage.getItem('fresh-key')).toBe('v');
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:user-1:queue`)).toBeNull();
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:queue`)).toBeNull();
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:user-1:session_counts:s1`)).toBeNull();
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:uid`)).toBe('keep-uid');
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:${STORAGE_NAMESPACE}:session`)).toBe('keep-session');
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:${STORAGE_NAMESPACE}:identity`)).toBe('keep-identity');
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:pending_identity`)).toBe('keep-pending');
    expect(localStorage.getItem(`${STORAGE_BASE_KEY}:user-1:rate_limit`)).toBe('keep-rate-limit');
    expect(localStorage.getItem('other_lib:queue')).toBe('foreign');
  });

  it('purges at most 5 non-critical keys per cleanup pass', () => {
    const storage = new StorageManager();

    const countsKeys = Array.from({ length: 8 }, (_, i) => `${STORAGE_BASE_KEY}:user-1:session_counts:s${i}`);
    countsKeys.forEach((key) => {
      localStorage.setItem(key, '{}');
    });

    const originalSet = Storage.prototype.setItem;
    let attempt = 0;
    Storage.prototype.setItem = vi.fn(function (this: Storage, key: string, value: string) {
      if (key === 'fresh-key' && ++attempt === 1) {
        const err = new Error('Quota');
        err.name = 'QuotaExceededError';
        throw err;
      }
      originalSet.call(this, key, value);
    });

    try {
      storage.setItem('fresh-key', 'v');
    } finally {
      Storage.prototype.setItem = originalSet;
    }

    expect(localStorage.getItem('fresh-key')).toBe('v');
    expect(countsKeys.filter((key) => localStorage.getItem(key) !== null)).toHaveLength(3);
  });

  it('gives up gracefully when QuotaExceededError fires and no cleanup candidates exist', () => {
    const storage = new StorageManager();

    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const err = new Error('Quota');
      err.name = 'QuotaExceededError';
      throw err;
    });

    let threw = false;
    try {
      storage.setItem('k', 'v');
    } catch {
      threw = true;
    } finally {
      Storage.prototype.setItem = originalSet;
    }

    // Public contract: setItem never throws. In-memory mirror still populated for getItem fallback.
    expect(threw).toBe(false);

    // Force getItem to take the catch path so we observe the fallback mirror.
    const originalGet = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('SecurityError');
    });
    try {
      expect(storage.getItem('k')).toBe('v');
    } finally {
      Storage.prototype.getItem = originalGet;
    }
  });

  it('ignores non-quota setItem errors (no cleanup, no throw)', () => {
    const storage = new StorageManager();

    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('SecurityError');
    });

    try {
      expect(() => {
        storage.setItem('k', 'v');
      }).not.toThrow();
    } finally {
      Storage.prototype.setItem = originalSet;
    }

    // Fallback mirror was populated even though real storage refused.
    const originalGet = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('SecurityError');
    });
    try {
      expect(storage.getItem('k')).toBe('v');
    } finally {
      Storage.prototype.getItem = originalGet;
    }
  });

  it('still persists if setItem fails after cleanup but does not throw', () => {
    const storage = new StorageManager();

    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const err = new Error('Quota');
      err.name = 'QuotaExceededError';
      throw err;
    });

    try {
      expect(() => {
        storage.setItem('persisted-key', 'v');
      }).not.toThrow();
    } finally {
      Storage.prototype.setItem = originalSet;
    }
  });
});
