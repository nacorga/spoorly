import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite Build Configuration for Browser Bundles
 *
 * Generates two browser-compatible bundles:
 * - spoorly.js (IIFE) → Use with <script> tags; exposes window.Spoorly.spoorly as window.spoorly,
 *   and auto-initializes with `endpoint` when the script tag carries data-endpoint
 *   (a failed init is reported with console.error, the only signal in a production bundle)
 * - spoorly.esm.js (ESM) → Use with <script type="module"> and import statements
 */
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV === 'development' ? process.env.NODE_ENV : 'production'
    ),
  },
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/public-api.ts'),
      name: 'spoorly',
    },
    rollupOptions: {
      external: [],
      output: [
        {
          // IIFE format for traditional <script> tags
          // Creates: window.spoorly = { init, event, ... }; autoinit from data-endpoint
          format: 'iife',
          name: 'Spoorly',
          entryFileNames: 'spoorly.js',
          dir: 'dist/browser',
          inlineDynamicImports: true,
          extend: true,
          footer: `
            (function () {
              if (typeof window !== 'undefined' && window.Spoorly?.spoorly) {
                window.spoorly = window.Spoorly.spoorly;
                var spoorlyScript = document.currentScript;
                var spoorlyEndpoint = spoorlyScript && spoorlyScript.dataset && spoorlyScript.dataset.endpoint;
                if (spoorlyEndpoint) {
                  window.spoorly.init({ endpoint: spoorlyEndpoint }).catch(function (error) {
                    console.error('[spoorly] data-endpoint init failed:', error);
                  });
                }
              }
            })();
          `,
        },
        {
          // ES Module format for modern imports
          // Usage: import { spoorly } from './spoorly.esm.js'
          format: 'es',
          entryFileNames: 'spoorly.esm.js',
          dir: 'dist/browser',
          inlineDynamicImports: true,
        },
      ],
    },
    target: 'es2022',
    minify: process.env.NODE_ENV !== 'development',
    sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
  },
});