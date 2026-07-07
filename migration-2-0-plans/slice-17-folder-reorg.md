---
name: viz-2.0-slice-17-folder-reorg
issue:
state: complete
version: 1
---

# Slice 17 — Folder reorg: collapse the flat pile into the layered stack

> **✅ COMPLETE (2026-07-07).** All moves landed as one verified structural change: `views/` (page),
> `renderer/` (threeViewer + renderModel), `stores/` (mapState, sharedView, preferences, fileStore),
> `model/` (+ codeCharta.model.ts + api.model.ts); `load/`/`store/` parked; util/model/features/lenses/
> resources unchanged. A deterministic codemod recomputed **1285 specifiers** across **612 files** (relative
> + baseUrl-absolute + the `jest.mock`/`requireActual` family that tsc does NOT resolve-check — a trap that
> failed 3 suites until covered). **334 renames, 0 history-losing delete/adds.** The live
> `visualization/.dependency-cruiser.js` was evolved to **equal `.dependency-cruiser.target.js`** (rule set
> byte-identical; only the file's production `@type` header differs from the draft banner) — incl. the
> renamed `renderer-does-not-import-up` (from `^renderer/`, `to` adds `views/`+`load/`), the new
> `nothing-imports-views`, the exact-path wire-DTO fence on `model/codeCharta.api.model.ts`, and the
> simplified `util-is-a-leaf-kernel` allow-list. **Gates:** `tsc` 0 · `lint:architecture` **0/0 acyclic,
> 1170 modules / 4618 deps (== baseline; graph-neutral)** · full suite **384/384, 45/45 snapshots zero-diff**
> (no `-u`). Verified by a 5-auditor adversarial workflow which caught one real defect the bulk config
> rewrite missed — the `source-layers-must-not-import-features` fence was hidden inside a `(lenses|fileStore)`
> alternation so the prefix substitution skipped it, silently un-fencing fileStore→features; fixed to
> `(lenses|stores/fileStore)` and re-proven live (the target draft already had it right). **Landed as one
> structural commit rather than the 17a–17e umbrella split** — the reorg is atomically coupled through
> relative imports and every DoD invariant is met by the end state; the split remains available if
> bisectable history is preferred (revert + re-slice, it is unpushed).

> **The migration is done and CLEAN (Slice 16: 0 errors, 0 warnings, acyclic).** This slice changes
> **no behavior and no edges** — it is a pure `git mv` + dep-cruiser path-prefix rewrite that reshapes
> the ~13 top-level siblings into the readable stack ratified in
> [`TARGET-ARCHITECTURE.md`](./TARGET-ARCHITECTURE.md). The destination rule set already exists as
> [`.dependency-cruiser.target.js`](./.dependency-cruiser.target.js); this slice evolves the live
> `visualization/.dependency-cruiser.js` into it, umbrella by umbrella. Inherits
> [`CONVENTIONS.md`](./CONVENTIONS.md) verbatim (snapshots ARE the behavior contract, no `-u`; every
> commit `tsc` + `npm test` zero-snapshot-diff + `lint:architecture`).

## The target (recap)

```
views/     ← codeCharta.component (+ Graph/Report pages later)
features/  ← unchanged
renderer/  renderer/threeViewer/ (engine)  +  renderer/renderModel/ (derived read-model)
lenses/    ← unchanged
stores/    stores/mapState/  stores/sharedView/  stores/preferences/  stores/fileStore/
util/      ← unchanged (leaf kernel)
model/     ← + codeCharta.model.ts + codeCharta.api.model.ts moved in
resources/ ← unchanged
```

`load/` and `store/` (composition-root shards) are **PARKED** — see TARGET-ARCHITECTURE.md "Open
questions". They keep their current top-level path in this slice.

## Definition of done (the invariants)

- **Graph-neutral, provable.** `depcruise app` reports the **same module/dependency counts** before and
  after (baseline today: **1169 modules, 4615 dependencies**). Only the *paths* in the report change.
- **`npm run lint:architecture` → 0 errors, 0 warnings** against the evolved live config, at every commit.
- **The live `visualization/.dependency-cruiser.js` byte-matches `.dependency-cruiser.target.js`** at the
  end (the target file was the spec; the live file is evolved to equal it).
- Every commit: **`tsc` clean + `npm test` green with ZERO snapshot diff (no `-u`)**. Pure structural →
  render snapshots stay byte-identical (each `__snapshots__/` moves *with* its spec, so keys stay matched).
- **`grep` for every old path prefix returns empty** (importers fully repointed, incl. `.spec.ts` and the
  baseUrl-absolute `app/codeCharta/<old>` form as well as the relative `../<old>` form).

## Ground truth (verified 2026-07-07)

- **No tsconfig path aliases.** Imports are a **mix** of relative (`../mapState/…`) and baseUrl-absolute
  (`app/codeCharta/…`, e.g. `app/main.ts`). Both recompute under `tsc` — repoint is `tsc`-gated, but the
  baseUrl-absolute form must be grepped explicitly (it won't break relatively).
- **Only 4 non-source touchpoints:** `package.json` `schema:generate` (`app/codeCharta/codeCharta.model.ts`),
  `app/main.ts` (`import … "app/codeCharta/codeCharta.component"`), the dep-cruiser config itself, and the
  config's `archi.collapsePattern`. `angular.json` entry stays `app/main.ts` (untouched). Jest uses
  `jest-preset-angular` with **no** path `moduleNameMapper`/`roots` to update. e2e/`.po` files import **none**
  of the moving source.
- **Snapshot dirs that ride along:** `threeViewer/__snapshots__`, `threeViewer/algorithm/**/__snapshots__`
  (treemap/street layout, relocated here in 16i), `util/__snapshots__`. `features/codeMap/rendering/__snapshots__`
  stays put (codeMap is unchanged).

## The vacuous-rule hazard (why config + move must be ONE commit)

A dep-cruiser rule whose `from`/`to` path matches **zero files passes vacuously**. So if a `git mv`
lands **without** updating that umbrella's rule prefixes in the *same* commit, the boundary silently
stops being enforced (green, but un-fenced). A pure move can't actually *violate* a boundary (no new
import is added), so the risk is only a transient enforcement gap — but we close it anyway: **each
umbrella commit moves the files AND rewrites that umbrella's rule prefixes together.** The 17e reconcile
`diff`s live-vs-target to prove no rule was left dangling.

## Sub-slices (each its own structural commit; gate = the DoD checklist)

### 17a — `stores/` umbrella · structural · L
`git mv` `mapState/ sharedView/ preferences/ fileStore/` → `stores/`. Repoint all importers (relative +
baseUrl-absolute). In the SAME commit, rewrite these live-config rules to the `stores/…` prefix:
`filestore-has-no-upward-deps`, `state-home-is-leaf`, `state-home-only-stores-import-ngrx`,
`feature-reaches-state-home-only-via-facade`, the three CQRS rules
(`…write-facade-is-sole-dispatch-surface`, `…read-facade-has-no-dispatch`, `display-components-cannot-dispatch`),
`wire-dto-only-in-filestore-boundary` (from `fileStore/` → `stores/fileStore/`), `lens-no-view-state`,
`render-model-is-top-derived` (its `stores/*` from-paths), `load-orchestrator-not-imported-by-lower-layers`
(its home/fileStore from-paths), `source-layers-must-not-import-features` (its `fileStore` from). **Largest
commit** (mapState alone ~87 importers) — review-gate it.

### 17b — `renderer/` umbrella · structural · M
`git mv` `threeViewer/` → `renderer/threeViewer/` and `renderModel/` → `renderer/renderModel/`. Repoint
(renderModel has ~33 feature importers; the engine is driven by features). Same commit, in the live config:
rename `three-viewer-engine-does-not-import-up` → **`renderer-does-not-import-up`**, set its `from` to
`^app/codeCharta/renderer/` and add `^app/codeCharta/views/` to its `to`; repoint `render-model-is-top-derived`
`to` → `^app/codeCharta/renderer/renderModel/`; update the `archi.collapsePattern`.

### 17c — `views/` · structural · S
`git mv` `codeCharta.component.{ts,html,spec.ts}` → `views/`. Repoint `app/main.ts`
(`app/codeCharta/views/codeCharta.component`) + any other importers. Same commit: add the **new
`nothing-imports-views`** rule to the live config.

### 17d — `model/` consolidation · structural · S
`git mv` `codeCharta.model.ts` + `codeCharta.api.model.ts` → `model/`. Repoint importers (the barrel has
~300 — mostly the baseUrl-absolute `app/codeCharta/codeCharta.model` form; the api.model has 13). Same commit:
update `package.json` `schema:generate` → `app/codeCharta/model/codeCharta.model.ts`; retarget
`wire-dto-only-in-filestore-boundary.to` → `^app/codeCharta/model/codeCharta\.api\.model\.ts$`; simplify
`util-is-a-leaf-kernel.to.pathNot` (drop the two now-redundant root-file entries — `^app/codeCharta/model/`
already covers them). **Guard:** confirm `model/ccjson2.model.ts` still does NOT import `codeCharta.api.model`
(the DTO fence must survive the co-location) and the rule targets the file by exact path, never a whole-folder allow.

### 17e — reconcile & seal · config/docs · S · STRICTLY LAST
- `diff visualization/.dependency-cruiser.js migration-2-0-plans/.dependency-cruiser.target.js` → **empty**
  (the live config now equals the spec). If not, fix the drift.
- Re-run the graph-neutrality check: `depcruise app` module/dep counts equal the 1169/4615 baseline.
- Mark `TARGET-ARCHITECTURE.md` state `proposal → complete`; note the target `.js` is now the live config
  (keep it as the historical spec or delete — either; if kept, add a "superseded by the live config" banner
  like `Ideas/dependency-cruiser.2.0.refined.cjs`).

## Sequencing

`17a → 17b → 17c → 17d → 17e`. Each is independently `tsc`+test+lint green, so they can also land on
separate days. 17e is strictly last (it asserts the end state). Order among 17a–17d is flexible, but doing
`stores` (17a) before `renderModel`'s rule edits (17b) keeps `render-model-is-top-derived` self-consistent
within each commit.

## Tooling note

With no path aliases and a mix of relative + baseUrl-absolute imports, the safest repoint is: `git mv`,
then let **`tsc --noEmit`** enumerate every broken import and fix by the compiler's guidance (an IDE
"move file" refactor or a `ts-morph` codemod does this mechanically). Finish each commit by grepping BOTH
forms of the old prefix (`from "\\.\\./<old>` and `from "app/codeCharta/<old>`) to prove zero stragglers,
including `.spec.ts`.

## Risks & rollback

- **Repoint churn is the whole risk** — hundreds of import lines. Fully `tsc`-gated; a missed baseUrl-absolute
  import is the one thing a relative-only search misses, hence the explicit dual grep.
- **Snapshot drift = a non-pure move.** If any `__snapshots__` diff appears, the move touched logic → fix it,
  do not `-u`.
- **Rollback:** `git revert` the umbrella commit (it's a self-contained `git mv` + config edit). No data,
  no runtime, no schema touched.

## Out of scope (separate work)

- **The `domain.model.ts` god-barrel split** (300 importers of `codeCharta.model.ts`) — a fan-in cleanup,
  not a folder move; its own slice.
- **Placing `load/` and `store/`** — parked (TARGET-ARCHITECTURE.md "Open questions"); likely a small
  `app-root` band above `views/`, decided later.
- **`util/`→`utils/`, `model/`→`models/` renames** — a pure string change if wanted; not done here.
</content>
