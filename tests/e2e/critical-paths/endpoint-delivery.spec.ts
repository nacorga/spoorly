import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const RECEIVER = 'http://localhost:8787';

// The receiver is shared by every worker and project, so each click carries a unique element id.
const receivedClickIds = async (request: APIRequestContext): Promise<string[]> =>
  ((await (await request.get(`${RECEIVER}/received`)).json()) as { type: string; click_data?: { id?: string } }[])
    .filter((e) => e.type === 'click')
    .map((e) => e.click_data?.id ?? '');

const clickWithId = async (page: Page, id: string): Promise<void> => {
  await page.evaluate((newId) => {
    document.querySelector('button')!.id = newId;
  }, id);
  await page.click(`#${id}`);
};

test.describe('Endpoint delivery to a cross-origin receiver', () => {
  test('autoinit from data-endpoint delivers events through the batch fetch and the unload beacon', async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const token = `cta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await page.goto('/autoinit.html');

    // Still on the page: the 10 s batch interval delivers through fetch.
    await clickWithId(page, `${token}-fetch`);
    await expect
      .poll(async () => receivedClickIds(request), { timeout: 15000, intervals: [500] })
      .toContain(`${token}-fetch`);

    // pagehide flushes the queue through sendBeacon.
    await clickWithId(page, `${token}-beacon`);
    await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    await page.goto('about:blank');

    await expect.poll(async () => receivedClickIds(request), { timeout: 5000 }).toContain(`${token}-beacon`);
    expect(errors).toEqual([]);
  });

  test('leaving the page delivers one web_vitals event with the metrics finalized on hide', async ({
    page,
    request,
    browserName,
  }) => {
    const token = `vitals-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const receivedVitals = async (): Promise<{ type: string }[][]> =>
      (
        (await (await request.get(`${RECEIVER}/received`)).json()) as {
          type: string;
          page_url?: string;
          web_vitals?: { metrics: { type: string }[] };
        }[]
      )
        .filter((e) => e.type === 'web_vitals' && e.page_url?.includes(token) === true)
        .map((e) => e.web_vitals?.metrics ?? []);

    await page.goto(`/autoinit.html?run=${token}`);
    // No interaction: LCP then only finalizes when the page is hidden, after the
    // `pagehide` that browsers fire first on unload.
    await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    await page.goto('about:blank');

    await expect.poll(receivedVitals, { timeout: 5000 }).not.toHaveLength(0);
    // Room for a second, split event to arrive.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const vitals = await receivedVitals();
    expect(vitals).toHaveLength(1);
    if (browserName === 'chromium') {
      expect(vitals[0]!.map((m) => m.type)).toContain('LCP');
    }
  });

  test('without data-endpoint the IIFE does not initialize', async ({ page }) => {
    await page.goto('/autoinit-none.html');

    const initialized = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return (window as any).spoorly.isInitialized();
    });

    expect(initialized).toBe(false);
  });

  test('an invalid data-endpoint is reported in the console without an uncaught error', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));

    await page.route('**/autoinit.html', async (route) => {
      const res = await route.fetch();
      const html = (await res.text()).replace('http://localhost:8787/collect', 'http://insecure.example.com/collect');
      await route.fulfill({ response: res, body: html });
    });
    await page.goto('/autoinit.html');
    await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    expect(pageErrors).toEqual([]);
    expect(consoleErrors.some((t) => t.includes('[spoorly] data-endpoint init failed'))).toBe(true);
  });
});
