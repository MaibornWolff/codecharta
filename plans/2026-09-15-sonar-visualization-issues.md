---
name: Fix open SonarCloud issues in visualization
issue: <none>
state: complete
version: 1
---

## Goal

Clear the 74 open SonarCloud issues on `maibornwolff-gmbh_codecharta_visualization` with the smallest
possible change each, keeping unit, e2e, knip and dependency-cruiser green.

## Tasks

### 1. CSP in `app/index.html` (`Web:S7039` ×3)
- Split `default-src` into `script-src 'self' 'unsafe-eval'` and `style-src 'self' 'unsafe-inline'`;
  Ajv's `compile()` needs eval and Angular injects inline styles.
- Angular's critical-CSS inlining emits `<link onload="this.media='all'">`; allow exactly that handler
  with `'unsafe-hashes'` + its sha256 (user decision) instead of `'unsafe-inline'`.
- Replace the `https://*` image wildcard with the hosts the changelog dialog's images load from
  (github.com, user-images.githubusercontent.com and the S3 host github.com redirects to).
- **Decision (user):** the `unsafe-inline` / `unsafe-eval` issues stay and are accepted in SonarCloud.

### 2. Accessibility in templates
- `InputWithoutLabelCheck` ×10: add `aria-label` (already accepted by Sonar on sibling inputs).
- `S6819` actionIcon: drop `role="button"`; wrap the changelog usage in a `<button>` (user decision).
- `S6819` explorerModeToggle: `<div role="group">` → `<fieldset>`.

### 3. Code smells
- Cognitive complexity (S3776 ×10): extract focused helpers; verified locally with
  `eslint-plugin-sonarjs` (`cognitive-complexity: 15`).
- Too many parameters (S107 ×2): bundle invariants into an options object; keep `volumeCount` per call.
- Remaining small smells: readonly statics, nested ternaries, `Math.min`, `Object.hasOwn`, optional
  chains, `??=`, `.some`, `String.raw`, `Blob#arrayBuffer`, `new MouseEvent`, `Promise.resolve`,
  default parameter order, boolean selector parameter, numeric separator, regex anchoring.

### 4. TODO comments (S1135 ×21)
- **Decision (user):** delete every flagged TODO comment block.

## Steps

- [x] Complete Task 1: CSP
- [x] Complete Task 2: accessibility
- [x] Complete Task 3: code smells
- [x] Complete Task 4: TODOs removed
- [x] Full suite green: format:check, npm test, npm run lint, tsc, e2e

## Notes

- SonarCloud's last analysis is on `868aac27d` (vis-2.4.0), the current HEAD.
- Verified: format:check, tsc, depcruise, style lint, knip, 442 unit suites (coverage gate), 90 e2e tests.
- Local oracle: eslint-plugin-sonarjs cognitive-complexity/max-params reproduced Sonar's findings and
  is clean after the refactors (Angular DI constructors excepted, Sonar ignores those).
- A throwaway Playwright check confirmed the new CSP: changelog image hosts load, other hosts are
  blocked, and the critical-CSS onload handler still runs.
