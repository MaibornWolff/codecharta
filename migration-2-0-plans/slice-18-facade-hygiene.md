---
name: viz-2.0-slice-18-facade-hygiene
issue:
state: complete
version: 1
---

> **DONE (2026-07-07).** 18a `a7e7e3e0a` (swept 37 dead exports/files + 1 cascade), 18b `66004af36`
> (knip gate: `knip.json`, `lint:deadcode`+`lint` scripts, CI step; 2.0 types + wire-contract enums
> allow-listed in place via `@public` JSDoc), 18c `af0049b28` (7 `export *` facades → explicit named
> re-exports via a TS-checker codemod). Each commit: tsc clean + `npm test` 45/45 snapshots zero-diff +
> `lint:architecture` clean + knip 0 unused exports. **Deviations from the proposal, all confirmed safe:**
> (1) `files.store.ts` was NOT deletable — `files.repo.ts` (live) imports 3 symbols from it; trimmed the
> barrel to those 3 instead. (2) Most flagged helpers were `un-export`, not delete, because they're used
> in-file. (3) 18c surfaced ~90 dead-via-facade re-exports (the READ facades are ~83% bypassed — consumers
> import `store/` internals directly); pruned them to the real consumed surface (runtime-neutral) rather than
> config-ignoring the facades, since re-hiding dead surface defeats the slice. Routing consumers back through
> the facades stays out of scope (a CF#9-style behavioral cleanup).

# Slice 18 — Facade hygiene: kill the dead surface, make it visible, make it legible

> **Why:** the state-home facades are `export *` barrels (`mapState.read.facade` = 60+ wildcard
> re-exports). A `git`-verified knip pass (2026-07-07) found **52 dead exports** hiding behind them —
> including duplicated selectors the barrels blindly re-publish and a near-orphaned store module — with
> **zero tooling** in the repo that would ever flag them. This slice removes the dead surface, adds
> knip so it can never silently return, and converts the wildcard facades to explicit named re-exports
> (a legible public API + a per-symbol read/write boundary). Inherits [`CONVENTIONS.md`](./CONVENTIONS.md)
> (snapshots ARE the behavior contract, no `-u`; every commit `tsc` + `npm test` zero-diff + `lint:architecture`).
> **Independent of the folder reorg (Slice 17)** — it changes facade *contents*, not locations; land in either order.

> **RE-BASELINED post-reorg (2026-07-07, after Slices 17 + 19a–d).** knip re-run against the current tree:
> **21 unused exports + 23 unused exported types + 1 unused enum group + 1 unused file** (~46; was 52 — the
> shift is the reorg + the 2 deleted lens load facades). **Every core finding still holds, at new paths.**
> Path map for the citations below: `store/` → `stores/rootStore/`; `fileStore/store/` → `stores/fileStore/store/`;
> `threeViewer/algorithm/` → `renderer/threeViewer/algorithm/`; `threeViewer/rendering/` →
> `renderer/threeViewer/rendering/`; `mapState.read.facade` → `stores/mapState/mapState.read.facade`. The 18b
> `knip.json` config is unaffected (entry `app/main.ts`, project `app/**/*.ts` — the reorg stayed inside
> `app/codeCharta/`). NEW since the first pass: `stores/fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.selector.ts`
> is now an unused FILE (not just an export). The 6 `ccjson2.model.ts` types are now surfaced as 3
> (`MetricsLensData`, `DependencyLensData`, `DependencyEdge`) — still KEEP-pending-2.0. Re-run knip at the
> start of 18a for the authoritative list; our reorg did NOT add any dead code (the 4 new stores/*LensSource
> facades are fully consumed, no new orphans).

## The evidence (knip, validated against source)

52 dead exports. Spot-checks confirmed knip is **accurate** (it resolves `export *`, so it saw through the
barrels). Two findings drive the design:

- **Duplicated selectors the barrel re-publishes dead.** `colorLabelsSelector` / `amountOfTopLabelsSelector`
  are defined in the `mapState` home **and** re-defined byte-identically in
  `features/labelSettings/selectors/labelSettings.selectors.ts`. The feature uses its own copy; the home's
  copy has **zero consumers** — yet `mapState.read.facade` publishes it via `export * from
  "./store/colorLabels/colorLabels.selector"`. The barrel advertises dead API.
- **A near-orphaned store module.** `fileStore/store/files.store.ts` — all 11 exports dead, one importer
  (`files.repo.ts`); the live path is `files.selector.ts` (9 importers) + separate actions. Looks superseded.

Bucketed (see triage note — **not all 52 are deletions**):

| Bucket | Count | Disposition |
|---|---|---|
| dead home selectors (behind read-facade `export *`) | 11 | delete the dead export/file |
| `fileStore/store/files.store.ts` | 11 | delete the module **iff** `files.repo.ts`'s use is also dead |
| `threeViewer/algorithm/*` helpers | 11 | delete or un-export (verify none are test-only) |
| `features/*` (incl. a dead `facade.ts` re-export) | 7 | delete |
| `model/ccjson2.model.ts` types | 6 | **KEEP — likely pending-2.0 ingestion types**; confirm, don't blind-delete |
| `util/*` | 4 | some are *un-export* (e.g. `isPathBlacklisted` is used only inside its own file) |
| `store/`, `threeViewer.facade.ts` | 2 | delete |

## Definition of done

- **knip reports 0 unused exports** against a committed config, wired into `lint` (and CI).
- The confirmed-dead exports are gone; the pending-2.0 types are explicitly allow-listed (ignored) with a
  one-line reason, not deleted.
- The 7 `export *` facades are explicit named re-exports; the read/write split is now **per-symbol** (a
  `.selector`/`.reducer` can't leak an action into the read facade by file-naming accident).
- Every commit: `tsc` clean + `npm test` **zero snapshot diff** + `lint:architecture` clean. Removing an
  *export* is runtime-neutral → snapshots stay byte-identical; if one moves, the symbol wasn't dead → stop.

## Sub-slices

### 18a — dead-code sweep · structural-ish · M · snapshot-gated
**Triage first, then delete.** Re-run knip, classify each of the 52 into `delete | un-export |
keep-pending-2.0 | investigate`. Then:
- **Delete** the confirmed-dead exports. **Safety rule: remove only the EXPORT (or its file), never a live
  state slice.** The dead home selectors are duplicates of a live feature selector — the `colorLabels`
  *reducer/state slice stays wired* (the feature reads `state.colorLabels`); only the home's unused
  `colorLabelsSelector` function + its `export * …/colorLabels.selector` facade line go.
- **`files.store.ts`:** verify `files.repo.ts`'s import of it is itself dead before deleting the module; if
  `files.repo.ts` is the last user and is also unused, drop both.
- **Un-export** (keep the function, drop the `export` keyword) where a symbol is only used inside its own
  module (`isPathBlacklisted`, and check `getMedian`/`pushSorted`).
- **Keep** the 6 `ccjson2.model.ts` 2.0 types — add them to knip's ignore with a reason (2.0 ingestion,
  not yet wired; the CodeMap-only migration hasn't consumed them). Do **not** delete forward-looking contract.
- Gate: `tsc` + full suite **zero snapshot diff** + `lint:architecture`. Rollback: revert the commit.
- **Note (out of scope here):** the *deeper* fix for the duplicated selectors — make `labelSettings` read
  the home facade instead of re-defining the selector — is the CF #9 dedup, a separate behavioral change.
  18a only removes the *dead* copy.

### 18b — add knip as a gate · tooling · S · do AFTER 18a (so it starts green)
- Add `knip` + a committed `knip.json` (entry: `app/main.ts` + `**/*.{spec,e2e,po}.ts`; project `app/**/*.ts`;
  ignore `mocks/`, `*.mocks.ts`; the 2.0-types allow-list from 18a). Enable the Angular plugin (auto from
  `angular.json`).
- Add `"lint:deadcode": "knip"` to `package.json`; wire into the `lint`/CI aggregate so a new unused export
  fails the build. Baseline must be **0**.
- Value: this is what makes the detection *permanent* — knip found today's 52 despite the barrels, so it
  guards regressions regardless of 18c.

### 18c — wildcard facades → named re-exports · structural · L · codemod + tsc-gated
Convert the 7 `export *` facades (the mapState/sharedView/preferences read+write facades + any remaining
lens/feature barrels) to explicit `export { … } from "…"`.
- **Codemod:** for each `export * from "./x"`, resolve `./x`'s exported names (post-18a, only *live* ones
  remain) and emit a named re-export. A `ts-morph` script generates this from the current export sets;
  hand-review the diff.
- **Payoff:** (1) each facade becomes a readable manifest of its public surface; (2) the read/write boundary
  is enforced **per symbol**, not by the `.selector`-vs-`.actions` file-naming convention the `export *`
  currently trusts — `state-home-read-facade-has-no-dispatch` stops depending on discipline.
- Gate: `tsc` (a dropped name that was actually used fails instantly) + `npm test` zero-diff + `lint:architecture`.
  Keep the CQRS dep-cruiser rules unchanged — they still hold, now belt-and-suspenders with the explicit lists.

## Sequencing

`18a → 18b → 18c`. 18a must precede 18b (knip starts green). 18c is independent of 18b but reads cleanest
after the dead exports are gone (the codemod then only re-exports live symbols). All three are independent of
Slice 17.

## Risks & rollback

- **False "dead" from DI/templates/dynamic use.** knip's Angular plugin covers component/DI usage; the
  spot-checks found no false positives, but 18a triages rather than blind-deletes, and `tsc`+snapshots are
  the backstop. Anything ambiguous → `investigate`, don't delete.
- **Deleting a wired state slice by mistake** — forbidden by the 18a safety rule (remove exports, never
  slices); a snapshot diff would catch a behavior change immediately.
- **18c dropping a used name** — `tsc` fails on the missing import the same commit. Rollback = revert.

## Out of scope

- **CF #9 selector dedup** (make features reuse home selectors instead of re-defining) — behavioral, its own slice.
- **Feature/lens facades that are already named** — untouched; 18c only targets the `export *` ones.
</content>
