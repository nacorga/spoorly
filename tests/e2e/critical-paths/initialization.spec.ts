/**
 * E2E: Initialization Tests
 * Focus: Basic initialization and config in real browser
 */

import { test, expect } from '@playwright/test';

test.describe('E2E: Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?auto-init=false');
  });

  test.describe('Basic Initialization', () => {
    test('should initialize without config (standalone mode)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        let retries = 0;
        while (!window.__spoorlyBridge && retries < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }
        if (!window.__spoorlyBridge) {
          throw new Error(`Spoorly bridge not available after ${retries * 100}ms`);
        }

        window.__spoorlyBridge.destroy(true);
        await window.__spoorlyBridge.init();

        return {
          initialized: window.__spoorlyBridge.initialized,
        };
      });

      expect(result.initialized).toBe(true);
    });
  });

  test.describe('Session Management', () => {
    test('should generate userId on first init', async ({ page }) => {
      const result = await page.evaluate(async () => {
        let retries = 0;
        while (!window.__spoorlyBridge && retries < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }
        if (!window.__spoorlyBridge) {
          throw new Error(`Spoorly bridge not available after ${retries * 100}ms`);
        }

        // Clear storage to simulate first visit
        localStorage.clear();
        sessionStorage.clear();

        window.__spoorlyBridge.destroy(true);
        await window.__spoorlyBridge.init();

        const userId = window.__spoorlyBridge.getFullState().userId;

        return {
          initialized: window.__spoorlyBridge.initialized,
          userId,
          isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId || ''),
        };
      });

      expect(result.initialized).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.userId).not.toBe('');
      expect(result.isUUID).toBe(true);
    });

    test('should restore userId from storage', async ({ page }) => {
      const result = await page.evaluate(async () => {
        let retries = 0;
        while (!window.__spoorlyBridge && retries < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }
        if (!window.__spoorlyBridge) {
          throw new Error(`Spoorly bridge not available after ${retries * 100}ms`);
        }

        // First initialization
        localStorage.clear();
        sessionStorage.clear();

        window.__spoorlyBridge.destroy(true);
        await window.__spoorlyBridge.init();

        const firstUserId = window.__spoorlyBridge.getFullState().userId;

        // Simulate page reload by destroying and re-initializing
        window.__spoorlyBridge.destroy(true);
        await window.__spoorlyBridge.init();

        const secondUserId = window.__spoorlyBridge.getFullState().userId;

        return {
          firstUserId,
          secondUserId,
          persisted: firstUserId === secondUserId,
        };
      });

      expect(result.firstUserId).toBeDefined();
      expect(result.secondUserId).toBeDefined();
      expect(result.persisted).toBe(true);
    });

    test('should generate sessionId on init', async ({ page }) => {
      const result = await page.evaluate(async () => {
        let retries = 0;
        while (!window.__spoorlyBridge && retries < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }
        if (!window.__spoorlyBridge) {
          throw new Error(`Spoorly bridge not available after ${retries * 100}ms`);
        }

        localStorage.clear();
        sessionStorage.clear();

        window.__spoorlyBridge.destroy(true);
        await window.__spoorlyBridge.init();

        const sessionId = window.__spoorlyBridge.getFullState().sessionId;

        return {
          initialized: window.__spoorlyBridge.initialized,
          sessionId,
          // SessionId format: {timestamp}-{random-alphanumeric} (e.g., "1729795200000-abc123xyz")
          isValidId: /^\d+-[a-z0-9]+$/.test(sessionId || ''),
        };
      });

      expect(result.initialized).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.sessionId).not.toBe('');
      expect(result.isValidId).toBe(true);
    });
  });
});
