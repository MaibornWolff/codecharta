---
name: Secure dependency update for the visualization
issue: <none>
state: progress
version: 1
---

## Goal

Close the 21 open `npm audit` findings in `visualization/` without a big-bang upgrade. Each wave is one
PR with its own verification gate, ordered so the cheapest, highest-value security work lands first and
the framework jump lands last.

Measured target: **21 findings → 2**, and the 2 that remain are an advisory we are provably not exposed
to. Angular 22 and Electron 44 follow as their own waves.

## Tasks

### 0. Prerequisites — nothing updates until these are in

Three things make an update unsafe or impossible today.

- **Node floor is wrong.** `engine-strict=true` plus the newer jsdom in `jest-environment-jsdom`'s range
  requires `^22.22.2 || ^24.15.0 || >=26`, and Angular 22 (wave 5) needs `^22.22.3 || ^24.15.0 || >=26`.
  `visualization/.node-version` says `24.14.0`, so `npm update` hard-fails with `EBADENGINE` before it does
  anything. Set the floor **once, to the wave-5 value**, so this is one change and one CHANGELOG entry:
  - `visualization/.node-version` → the current 24.15.x
  - `visualization/package.json` engines → `^22.22.3 || ^24.15.0 || >=26.0.0`, plus the lockfile root entry
  - the docs that state the visualization's dev prerequisite: `CLAUDE.md`, `dev_docs/DEV_START_GUIDE.md`

  Write the range, not a single `>=` number. `>=22.19` is exactly the shape that failed today: `24.14.0`
  satisfies it while jsdom rejects it, so the check passes and the install still dies. The "one number
  everywhere" of [`plans/node-22-minimum.md`](node-22-minimum.md) was a convenience; here it hides the
  failure. **Leave `analysis/node-wrapper` and the ccsh docs alone** — raising the published shell's floor
  for a visualization *dev* dependency breaks `npm i codecharta-analysis` on 22.20 for no reason.
- **CI can silently discard the reviewed lockfile.** `test_visualization.yml` runs
  `npm ci || (npm install --package-lock-only && npm ci)`. On any lock/registry hiccup that regenerates the
  dependency graph unreviewed, which defeats every guard below. Remove the fallback and let `npm ci` fail —
  but find out *why* it is there first. Almost certainly a darwin-generated lock that dropped linux-only
  optional deps, which is also why `@rollup/rollup-linux-x64-gnu` sits in `optionalDependencies`. Acceptance
  test before the fallback goes: `npm ci` on linux CI passes with the committed lock and no fallback. (The
  wave-1 dry-run lock did carry every `@esbuild/*` platform entry, so the current lock looks sound.)
- **The review gate has to be a CI script, not a documented habit.** Renovate automerges every minor/patch
  and runs `lockFileMaintenance` with `automerge: true` each Monday — that is wave 1 happening weekly,
  unreviewed. A gate that only the manual waves follow leaves the larger hole wide open. Make it a check that
  runs on every PR, including Renovate's, against `git diff` of the lockfile:
  - `git diff package-lock.json | grep '"resolved"' | grep -v registry.npmjs.org` must come back empty.
  - Every *newly added* package name in the diff gets named in the PR description. Version bumps of packages
    we already had do not; a name we have never depended on before does.
  - A provenance check on **newly added packages only**, not the whole tree. Measured 2026-09-21: a
    tree-wide `npm audit signatures` aborts on the first package signed with npm's registry key that expired
    2025-01-29 (`SHA256:jl3bw…`) — `echarts@5.6.0` is one, and a sample of 400 of the 1156 locked packages
    found 40 more, so roughly 115 across the tree. Every package published before ~Jan 2025 and not
    republished since carries it; an allowlist that size is not a gate. Instead, take the names the diff
    *adds*, and check those: anything published recently must carry the current non-expiring key
    (`SHA256:DhQ8…`) or an attestation. `npm view <pkg>@<ver> dist.signatures dist.attestations` does it
    per package.

Also true and worth knowing: `min-release-age=3` in `.npmrc` is **silently ignored by npm < 11.10**. Whoever
runs the update must check `npm -v` first, or the 3-day quarantine that is the main defence against fast-burn
compromises simply does not apply.

### 1. In-range refresh — the whole security win, no `package.json` change

`npm update` inside the existing ranges takes audit from **21 findings to 6** and clears, on its own:

- every Angular CVE — compiler sanitization bypass / XSS ×4, common DoS + `HttpTransferCache` leaks ×6
  (`21.2.8 → 21.2.23`, the vulnerable range ends at 21.2.19)
- the entire `@angular/build` chain: `@babel/core` arbitrary file read, esbuild, **undici ×12**,
  **piscina prototype-pollution RCE**, vite

About 910 lockfile entries move. This is lockfile-only — no declared range changes — but it is *not*
visually risk-free: `tailwindcss 4.2 → 4.3` and `daisyui 5.5 → 5.7` ride along, and "in-range is safe" is
weakest for CSS frameworks. The e2e gate is mandatory here, not optional.

Procedure: `npm update --package-lock-only` → review the diff against the gate in task 0 → `npm ci` → run
the full gate below.

### 2. Electron 40 → 44

Electron 40 reached **end of life on 2026-06-30**; 41 followed on 2026-08-25. Supported majors are 42/43/44,
so 40 gets no further Chromium backports — it is a forced major, not an optional one. 34 Electron advisories
are open against the pinned `40.6.1`, and one of them (GHSA-9f4c-93c8-jc8g) has no fix anywhere in the 40 line.

In the same PR, because they are the same subsystem and share the `extract-zip` finding (which has *no* fixed
version of its own):

- `electron` `40.6.1 → 44.4.2` (exact pin, as today — 44.4.3 was under three days old and `min-release-age` refused it)
- `@electron/packager` `^19 → ^20`
- `@electron/get` `^4 → ^5`
- drop the now-pointless `overrides.extract-zip.yauzl` — verified: with packager 20 the finding disappears

Four majors of Chromium and Node in the desktop shell. Gate: `npm run build`, `npm run package`, then launch
the packaged app and actually load a `.cc.json`, take a screenshot and open a context menu. `script/ensureElectron.js`
downloads the binary on demand (install scripts are off) — confirm that still works after the bump.

### 3. `@cyclonedx/cyclonedx-npm` 4 → 6

Dev-only, drives `npm run sbom`. Two shell-injection advisories, both via an unsanitized `--workspace` argument
that we never pass — so the exposure is nil, but it is the last audit finding and the fix is cheap.
**After this wave, `npm audit` reports only the echarts entry.** Gate: `npm run sbom` produces a valid SBOM.

### 4. Remaining dev majors — no CVE, one PR each, optional

Do these only if they buy something. None is security work.

| Package | Jump | Gate | Note |
| --- | --- | --- | --- |
| `dependency-cruiser` | 17 → 18 | `npm run lint:architecture` | config format may move |
| `jest-preset-angular` | 16 → 17 | `npm test` | peers allow Angular ≥20 <23 — safe before *and* after wave 5 |
| `typescript-json-schema` | 0.67 → 0.68 | `npm run schema:generate`, diff must be empty | nests its own TS 5.9; harmless duplicate after wave 5 |
| `marked` | 17 → 18 | docs render | `marked-mangle` peer allows `<19` |
| `bestzip` | 2 → 4 | `npm run package` | |

### 5. Angular 21 → 22 + ngrx 21 → 22 — and TypeScript 6, not 7

The framework jump, last, alone. **`npm outdated` says TypeScript's latest is 7.0.2 — do not follow it.**
`@angular/compiler-cli@22` peers `typescript: >=6.0 <6.1`. TypeScript 7 is the native rewrite and Angular does
not support it; the correct move is `5.9.3 → 6.0.3`.

- `ng update @angular/core@22 @angular/cli@22`, then `ng update @ngrx/store@22` (`@ngrx/store` and
  `@ngrx/effects` 22.0.1 both peer `@angular/core ^22`)
- the other Angular-peered libraries are already clear: `ngx-color@10.1.0` peers `>=19.0.0-0`,
  `@testing-library/angular@19.5.0` peers `>= 21.0.0`, `jest-preset-angular@17` peers `>=20 <23` — no
  upper bound blocks 22, and none of them needs a coordinated bump
- TypeScript 6 is its own source of breakage — expect real compile errors, and run
  `npx tsc --noEmit -p tsconfig.json` early and often
- full gate plus a manual pass over the 3D map, delta mode and the lenses

### 6. Deliberately not now

- **echarts 5.6 → 6.1.** [GHSA-fgmj-fm8m-jvvx](https://github.com/advisories/GHSA-fgmj-fm8m-jvvx) is the
  **Lines** series tooltip **without** a custom `tooltip.formatter`. We render a wordcloud series with
  `buildTooltipFormatter()`, so the advisory does not reach us. Against upgrading: `echarts-wordcloud@2.1.0`
  peer-pins `echarts ^5`, is unmaintained since 2022, and carries our own two-defect patch
  (`patches/echarts-wordcloud+2.1.0.patch`) whose header says to re-verify it before any bump. Own spike,
  own PR — and the wordcloud patch has to be re-applied and re-verified against 6.x first.
- `three` / `@types/three` 0.182 → 0.186 — Renovate disables these on purpose ("almost always breaking
  changes"). Own PR with before/after screenshots.
- `pako` 2 → 3, `@types/node` 24 → 26 — no forcing reason.

### 7. The actual XSS we own (independent of every wave above)

`app/codeCharta/renderer/wordCloud/util/wordCloudTooltip.ts` builds
`` `<b>${name}</b>` `` and hands it to echarts as tooltip HTML. Traced 2026-09-21: `name` is
`DomainWord.text`, which the app does not tokenize — it is read verbatim out of the loaded `.cc.json`
(`ccjson2.model.ts` → `DomainNode.words`), and the 2.0 schema types it as a plain unconstrained `string`.
So a crafted file puts arbitrary markup in a tooltip. This is precisely the sink the echarts advisory
describes, in our own code, at any echarts version. Escape it, or return the structured form echarts escapes
for us. Small PR, separate from the dependency work.

## Steps

- [x] Complete Task 0: Prerequisites (node floor, CI fallback, review gate)
- [x] Complete Task 1: In-range refresh — audit 21 → 6
- [ ] Complete Task 2: Electron 44 + packager 20 + get 5, drop the yauzl override
- [ ] Complete Task 3: cyclonedx-npm 6 — audit 6 → 2
- [ ] Complete Task 4: Remaining dev majors (optional, one PR each)
- [ ] Complete Task 5: Angular 22 + ngrx 22 + TypeScript 6.0.3
- [x] Complete Task 7: Escape the wordcloud tooltip name

## Notes

### The gate, run on every wave

```bash
npm run format:check                # repo root
npm test                            # visualization/ — unit tests + coverage gate
npm run lint                        # depcruise, component styles, knip
npx tsc --noEmit -p tsconfig.json   # neither Jest nor the build type-checks spec files
npm run build
npm run e2e                         # not optional, least of all for wave 1
```

### Where the update is run

Not in the Claude container: its npm is 9.2.0 (ignores `min-release-age` entirely), its node is 22.22.1
(below jsdom's floor), and `visualization/node_modules` is a darwin-arm64 install. Run waves on the Mac with
npm ≥ 11.10, or generate the lock in a scratch copy and `npm ci` it on 24.15.

### Measurements behind the numbers (2026-09-21, scratch copies of the lockfile)

| State | Findings |
| --- | --- |
| today | 21 (2 low, 8 moderate, 11 high) |
| after wave 1 | 6 (2 moderate, 4 high) |
| after waves 2–3 | 2 (moderate, echarts only) |

- `electron@40.10.6` alone clears 33 of the 34 Electron advisories — but 40 is EOL, so wave 2 goes to 44.
- Renovate is configured to automerge minor/patch, yet the lockfile has not moved since `Releasing vis-2.5.0`
  on 2026-09-16 while ~48 packages drifted. Worth checking whether it is actually running on this repo.

### Changelog

Dependency updates are invisible to users and get no CHANGELOG entry — except the node minimum in task 0 and
wave 5 (a Changed entry each, matching the wording `plans/node-22-minimum.md` used) and anything the Electron
or Angular jump visibly changes.
