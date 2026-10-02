// Minimal spoorly receiver: no dependencies. Run with `node examples/receiver/server.mjs`.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

// Roughly 1 MB of body text; larger requests get 413.
const MAX_BODY_LENGTH = 1024 * 1024;

export const createReceiver = () => {
  // Delivery is at-least-once: retries and recovery can resend an event, so dedupe by id.
  // ponytail: in-memory and unbounded; a real receiver dedupes in its datastore.
  const seen = new Set();
  const received = [];

  return createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Test hook for the e2e suite: exposes every received event to any origin. Drop it in a real receiver.
    if (req.method === 'GET' && req.url === '/received') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(received));
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405).end();
      return;
    }

    let body = '';
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      body += chunk;
      tooLarge = body.length > MAX_BODY_LENGTH;
    });
    req.on('end', () => {
      if (tooLarge) {
        res.writeHead(413).end();
        return;
      }

      let events;
      try {
        events = JSON.parse(body)?.events;
      } catch {
        // Not JSON: falls through to the 400 below.
      }
      if (!Array.isArray(events)) {
        res.writeHead(400).end();
        return;
      }

      for (const event of events) {
        if (typeof event?.id !== 'string' || seen.has(event.id)) continue;
        seen.add(event.id);
        received.push(event);
        console.log(JSON.stringify(event));
      }

      res.writeHead(204).end();
    });
  });
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 8787);
  createReceiver().listen(port, () => console.log(`spoorly receiver on http://localhost:${port}/collect`));
}
