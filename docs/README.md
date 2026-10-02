# spoorly playground

Live at **[nacorga.github.io/spoorly](https://nacorga.github.io/spoorly/)**.

A small single-page demo store (TechShop) running spoorly in standalone mode, with a floating monitor that shows every event as it is captured. It is also the page the e2e suite runs against.

## Run it locally

```bash
npm run docs:dev    # dev build of the library copied into docs/, served on http://localhost:3000
```

`npm run docs:setup` rebuilds and copies the library without starting the server; `npm run serve` serves `docs/` as it is.

## What's on the page

- **Store**: product list, cart, Home/Products/About/Contact pages with hash routing, and a contact form.
- **Event monitor** (bottom right): processing state, number of events queued, the last 50 events with their type and time, and the time since the last batch. Click an event to see its JSON, the header to collapse the panel and × to clear it.
- **Custom events**: `add_to_cart` when a product is added and `contact_form_submit` when the form is sent.

Everything else is autocaptured: page views on every route change, clicks, scroll depth, the session start, web vitals and errors.

## How it initializes

`index.html` imports the ESM build and `script.js` uses only the public API, the same way a site would (simplified):

```js
// Listeners first, so the monitor also sees session_start and page_view.
spoorly.on('event', (eventData) => addEventToMonitor(eventData.type, 'queued', eventData));
spoorly.on('queue', (batch) => { /* mark the batch's events as sent in the monitor */ });

await spoorly.init({
  pageViewThrottleMs: 1000,
  clickThrottleMs: 300,
  maxSameEventPerMinute: 60,
  sessionTimeout: 15 * 60 * 1000,
});
```

There is no `endpoint`, so nothing leaves the browser. Before `init()` the playground deletes the `spoorly` keys from `localStorage`, so every load starts a new session.

Add `?auto-init=false` to the URL to skip the automatic `init()`; the e2e suite does this and drives the library through `window.__spoorlyBridge`, which only exists in the dev build.

## One-line install demo

- `autoinit.html` loads the IIFE bundle with `data-endpoint="http://localhost:8787/collect"`. Start the receiver with `node examples/receiver/server.mjs` and watch events arrive in its console.
- `autoinit-none.html` loads the same bundle without `data-endpoint`, which leaves the library uninitialized.

## QA mode

Open the page with `?spoorly_mode=qa` to log custom events to the console and make invalid custom events throw; `?spoorly_mode=qa_off` turns it off. The flag lives in `sessionStorage`, so it survives reloads in the same tab.

## Files

| File | Contents |
| --- | --- |
| `index.html`, `style.css`, `script.js` | The demo store and its monitor |
| `spoorly.js` | ESM build of the library, copied from `dist/browser/spoorly.esm.js` |
| `spoorly.iife.js` | IIFE build, copied from `dist/browser/spoorly.js` |
| `autoinit.html`, `autoinit-none.html` | One-line install pages |

The GitHub Pages deploy (`.github/workflows/deploy-demo.yml`) publishes `docs/` with a production build (`npm run docs:gh-pages`).

## Troubleshooting

- **Nothing happens**: rerun `npm run docs:setup` so `docs/` has a fresh build.
- **No events in the monitor**: check the console for errors and that `spoorly.isInitialized()` is `true`.
