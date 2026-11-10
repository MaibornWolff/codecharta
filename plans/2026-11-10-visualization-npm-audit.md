---
name: Reduce npm audit issues in visualization
issue: <none>
state: complete
version: 1
---

## Goal

Cut the visualization's `npm audit` findings (50: 3 critical, 8 high) with updates that are already well
established, without crossing majors or forcing overrides.

## Tasks

### 1. Angular 22.1 → 22.2
- Framework packages to ^22.2.3 (26 days old), `@angular/build` / `@angular/cli` to ^22.2.5 (13 days, accepted
  for the vite 8.3.5 pin — dev-server-only high otherwise stays)
- npm 9 cannot resolve the peer set from the old lock: drop the `@angular/*` lock entries and re-resolve with
  npm >= 11.10 so `min-release-age` is honoured

### 2. Patch transitive deps inside existing ranges
- `npm update --package-lock-only --min-release-age=14` for handlebars, undici, source-map-js, fast-uri,
  ip-address, qs, smol-toml, zod, piscina, ts-jest, jsdom, knip, …

### 3. Gates
- format:check, unit tests, lint, type check, production build

## Steps

- [x] Complete Task 1: Angular 22.2
- [x] Complete Task 2: transitive patches
- [x] Complete Task 3: gates green, commit

## Notes

- beasties 0.5 swaps the critical-CSS `onload="this.media='all'"` handler for an inline `<script>`; the CSP
  blocked it and left the app unstyled (100 e2e failures). The CSP now allows that script's sha256 and drops
  `'unsafe-hashes'`, as no inline handler is left
- Gates: format, 636 unit suites (coverage 96.7/90.1/95.3/96.6), lint, tsc, build, 149 e2e, lockfile audit

- Result: 50 → 33 (0 critical, 0 high, 32 moderate, 1 low); only the Angular CLI/build group is younger than
  14 days (13)
- Build warnings (budget, 56 unparsable critical-CSS selectors) are the same on main; beasties 0.5 only rewords them
- lightningcss 1.33.0 (MPL-2.0, policy deny) is added by @angular/build, but main already has 1.32.0 via Tailwind

- Left on purpose: glob 9–14.0.1 / minimatch < 11.0.1 (Jest coverage, electron packager, bestzip, cyclonedx) —
  even the newest upstream releases still use them; deepmerge has no fixed release; cyclonedx-npm 7 is 0 days old
- Angular router advisories only concern SSR, which the app does not use
