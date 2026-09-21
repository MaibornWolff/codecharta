---
name: Finish the dependency cleanup
issue: <none>
state: progress
version: 1
---

## Goal

Close everything [`secure-npm-update-visualization.md`](secure-npm-update-visualization.md) left open: the
three other lockfiles, the two broken icon paths the full packaging run exposed, a CI job so packaging
never hides again, and the echarts advisory that is the last `npm audit` finding anywhere in the repo.

## Tasks

### 1. The other three lockfiles

The visualization got the full treatment; the rest of the repo did not. Both remaining findings clear with
a plain in-range `npm update` — measured, no declared range changes:

| Lockfile | before | after |
| --- | --- | --- |
| `package-lock.json` (root) | 5 — `ajv` ReDoS, `fast-uri` ×7, `js-yaml` ×4, `picomatch` ×2 | **0** |
| `analysis/node-wrapper` | 1 — `picomatch` ×2 | **0** |
| `gh-pages` | 0 | 0 |

The root one is the tooling that runs on every commit (Biome, commitlint, husky, lint-staged). Gate:
`npm run format:check` at the root, and a commit through husky to prove the hooks still fire.

### 2. Both icon paths are wrong

The full matrix run surfaced two separate, long-standing breakages. Neither comes from the dependency work.

- **No application icon, every platform.** `script/appBuild.js` passes `icon: "app/codeCharta/assets/icon"`,
  but the icons moved to `public/codeCharta/assets/` and the path was never updated, so packager skips the
  icon on all six targets and every release ships the default Electron one.
- **No window icon on Linux.** `electron/main.js` hardcodes `icon.ico`, which Electron cannot decode
  outside Windows — it warns on every launch. Use the `.png` there.

Gate: `npm run package` warns about neither, and the packaged app shows its icon.

### 3. A CI packaging job

`npm run package` runs only in the release workflow today, which is how Electron 44 dropping `win32/ia32`
and `linux/armv7l` got all the way to a local run before anyone saw it, and how the icon paths stayed
broken for years. Add a PR job that packages the matrix (or at least darwin + win32, the two this container
cannot otherwise exercise) whenever `visualization/script/**`, `electron/**` or the Electron dependencies
change.

### 4. echarts 6 — the last audit finding

Two moderate findings remain repo-wide, both [GHSA-fgmj-fm8m-jvvx](https://github.com/advisories/GHSA-fgmj-fm8m-jvvx).
We are not exposed — it is the Lines series tooltip with the *built-in* formatter, and the word cloud is a
`wordCloud` series with our own. But "audit is clean" is worth more than "audit has two we have argued
about", so try the upgrade:

- `echarts-wordcloud@2.1.0` peer-pins `echarts ^5` and is unmaintained since 2022 — override the peer
- re-apply `patches/echarts-wordcloud+2.1.0.patch` against 6.x and re-verify both defects it fixes; its own
  header says to
- confirm `echarts.registerLayout` and the `wordCloud` series still exist in 6.x
- gate on the domain-view e2e, which is what covers the word cloud

If the word cloud breaks, stop and record the risk acceptance instead — do not carry a half-working chart.

### 5. schema:generate has been broken since 2020

`npm run schema:generate` passes a `.ts` file rather than a tsconfig, so `typescript-json-schema` compiles
at its default target and dies on `Map`/`Set` iteration. Nothing in CI runs it and
`generatedSchema.json` has not changed since 2020. Either point it at `tsconfig.json` and regenerate, or
delete the script and the stale output. Decide by whether anything still reads that schema.

### 6. Renovate is not running

Configured to automerge minor/patch weekly, yet ~48 packages had drifted and the lock had not moved since
the 2.5.0 release. Cannot be checked or fixed from a checkout — needs the GitHub App's install status and
its dashboard. Investigate; it is the reason all of this was needed at once.

## Steps

- [ ] Complete Task 1: root and node-wrapper lockfiles
- [ ] Complete Task 2: both icon paths
- [ ] Complete Task 3: CI packaging job
- [ ] Complete Task 4: echarts 6, or a recorded risk acceptance
- [ ] Complete Task 5: schema:generate fixed or deleted
- [ ] Complete Task 6: Renovate (needs GitHub access — report only)

## Notes

Run everything with npm >= 11.10 or `min-release-age` is ignored without saying so; on this container that
means the scratch Node 24. Every lockfile change is now gated by
`.github/workflows/scripts/auditLockfileDiff.mjs`, which also prints the added package names for the PR
description.
