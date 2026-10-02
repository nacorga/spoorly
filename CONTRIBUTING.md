# Contributing

Thanks for helping. Bugs and ideas go to [GitHub issues](https://github.com/nacorga/spoorly/issues); security problems go through [SECURITY.md](./SECURITY.md).

## Setup

Node.js 22 (the version CI uses) and npm.

```bash
git clone https://github.com/nacorga/spoorly.git
cd spoorly
npm ci
npx playwright install chromium   # only needed for the e2e suite
```

`npm ci` also installs the git hooks: `pre-commit` runs lint-staged and `commit-msg` runs commitlint.

Useful scripts:

```bash
npm run build:all   # ESM + CJS (tsup) and browser bundles (Vite) into dist/
npm run docs:dev    # playground on http://localhost:3000 with a dev build
node examples/receiver/server.mjs   # reference receiver on http://localhost:8787/collect
```

The layout and conventions are described in [AGENTS.md](./AGENTS.md); testing is covered in [TESTING.md](./TESTING.md).

## Gates

Every change must pass, in this order:

```bash
npm run check        # ESLint + Prettier (npm run fix auto-fixes)
npm run type-check   # tsc --noEmit, strict
npm test             # unit + integration (Vitest)
npm run test:e2e     # Playwright; starts the playground and the receiver itself
npm run build:all
npm run size         # gzip budget of dist/browser/spoorly.js
```

CI runs the same gates on every pull request (e2e on Chromium only), plus `npm audit` and the coverage threshold (70%).

## Commits and pull requests

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint: `feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `style:` or `revert:`, an optional lowercase scope, and no trailing period.

```text
feat: add flushOnSpaNavigation option
fix(sender): keep the idempotency token across retries
```

Keep pull requests focused on one change, add or update tests with it, and update the docs when behavior changes. The only runtime dependency is `web-vitals`; a pull request that adds another will not be merged.

## Release

Maintainers release from `main`:

```bash
npm version <patch|minor>   # bumps package.json, commits and tags vX.Y.Z
git push --follow-tags
```

The tag push runs `.github/workflows/release.yml`: it runs every gate except e2e, checks that the tag matches `package.json`, publishes to npm through npm Trusted Publishing (OIDC, no token, with provenance) and creates a GitHub release with generated notes. The library version sent in `_metadata.client_version` is read from `package.json`, so there is nothing else to bump.

**First publish.** Trusted Publishing can only be configured for a package that already exists on npm, so the very first release can't go through the workflow. Publish `0.1.0` by hand from a clean checkout while logged in to npm (`npm run build:all && npm publish`). Then, on npmjs.com, open the `spoorly` package settings and add a trusted publisher: GitHub Actions, repository `nacorga/spoorly`, workflow `release.yml`. From then on, every tag push publishes through OIDC.
