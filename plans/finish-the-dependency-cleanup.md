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

### 5. schema:generate — investigated, and it is not a dependency problem

Three separate things are wrong with `npm run schema:generate`, and the third is why this is left open.

1. It passes a `.ts` file rather than a tsconfig, so `typescript-json-schema` compiles with default
   options and dies on `Map`/`Set` iteration. Fixed by passing `tsconfig.json`.
2. It asks for `ExportCCFile` in `model/codeCharta.model.ts`, but the type moved to
   `model/codeCharta.api.model.ts`. Fixed by pointing at the new file.
3. `typescript-json-schema@0.67.1` pins TypeScript `~5.5`, which predates the generic `Uint8Array` the
   codebase now uses, so it cannot parse the project at all. 0.68.0 pins `~5.9` and does work.

With all three addressed the script runs — **and its output must not be adopted.** The regenerated schema
makes `fileChecksum` a required property, and `generatedSchema.json` is what `fileValidator.ts` validates
every loaded file against. Measured with ajv: a cc.json without a checksum is valid under the committed
schema and **invalid** under the regenerated one, which would reject files that load today and pre-empt the
friendly "File has no checksum" message the validator already produces for exactly that case. The
regenerated `CodeMapNode` also drops `isFlattened` and gains `fileCount`, `rect`, `value` and `zOffset` —
render-time fields that accumulated on the internal type the schema is generated from.

So the model has drifted from what the viz actually accepts: `ExportCCFile.fileChecksum` is declared
non-optional while the app deliberately handles its absence, and `CodeMapNode` is the internal type rather
than an export shape. Decide what those two types should mean for validation first; regenerating before
that would silently narrow what users can open. The dependency bump is reverted — on its own it fixes
nothing, and a script that runs and emits a schema nobody should install is worse than one that fails.

### 6. Renovate is not running

Configured to automerge minor/patch weekly, yet ~48 packages had drifted and the lock had not moved since
the 2.5.0 release. Cannot be checked or fixed from a checkout — needs the GitHub App's install status and
its dashboard. Investigate; it is the reason all of this was needed at once.

## Steps

- [x] Complete Task 1: root and node-wrapper lockfiles
- [x] Complete Task 2: both icon paths
- [x] Complete Task 3: CI packaging job
- [x] Complete Task 4: echarts 6 — repo-wide audit is now clean
- [x] Complete Task 5: schema:generate investigated — needs a model decision, not a dependency fix
- [ ] Complete Task 6: Renovate (needs GitHub access — report only)

## Notes

Run everything with npm >= 11.10 or `min-release-age` is ignored without saying so; on this container that
means the scratch Node 24. Every lockfile change is now gated by
`.github/workflows/scripts/auditLockfileDiff.mjs`, which also prints the added package names for the PR
description.
