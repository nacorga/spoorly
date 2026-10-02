// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Server } from 'node:http';
import { createReceiver } from '../../../examples/receiver/server.mjs';

describe('example receiver', () => {
  let server: Server;
  let base: string;

  beforeEach(async () => {
    server = createReceiver();
    await new Promise<void>((resolve) => server.listen(0, resolve));
    base = `http://localhost:${(server.address() as { port: number }).port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const post = async (ids: string[]): Promise<Response> =>
    fetch(`${base}/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ events: ids.map((id) => ({ id, type: 'custom' })) }),
    });

  it('accepts a batch with 204 and an open CORS header', async () => {
    const res = await post(['e1']);

    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('drops events whose id it has already seen', async () => {
    await post(['e2', 'e3']);
    await post(['e3', 'e4']);

    const received = (await (await fetch(`${base}/received`)).json()) as { id: string }[];
    expect(received.map((e) => e.id)).toEqual(['e2', 'e3', 'e4']);
  });

  it('rejects a body that is not JSON with 400', async () => {
    const res = await fetch(`${base}/collect`, { method: 'POST', body: 'nope' });

    expect(res.status).toBe(400);
  });

  it('rejects JSON without an events array with 400 and keeps serving', async () => {
    const nullBody = await fetch(`${base}/collect`, { method: 'POST', body: 'null' });
    const badEvents = await fetch(`${base}/collect`, { method: 'POST', body: '{"events":5}' });

    expect(nullBody.status).toBe(400);
    expect(badEvents.status).toBe(400);
    expect((await post(['e5'])).status).toBe(204);
  });

  it('rejects a body over about 1 MB with 413', async () => {
    const res = await fetch(`${base}/collect`, { method: 'POST', body: 'x'.repeat(2 * 1024 * 1024) });

    expect(res.status).toBe(413);
  });
});
