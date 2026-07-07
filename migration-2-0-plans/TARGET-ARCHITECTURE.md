---
name: viz-2.0-target-architecture
issue:
state: complete
version: 1
---

# Target architecture — the folder-and-layer reorganization

> **Status: REALIZED (2026-07-07) by [Slice 17](./slice-17-folder-reorg.md).** The tree now IS this
> stack; `visualization/.dependency-cruiser.js` was evolved to equal `.dependency-cruiser.target.js`
> (rule set byte-identical). This doc is retained as the design rationale. It did **not** change the
> dependency graph — every edge that existed survived; only the **folders** and the **dep-cruiser path
> prefixes** moved (lint stayed 0/0 acyclic at the same 1170 modules). Companion enforced-target config:
> [`.dependency-cruiser.target.js`](./.dependency-cruiser.target.js) (a draft of the *post-move* rule
> set; not active until the git-mv slices land). Safety model is unchanged — inherits
> [`CONVENTIONS.md`](./CONVENTIONS.md) verbatim (snapshots ARE the behavior contract, structural
> `git mv` before behavioral, per-commit `tsc` + `npm test` zero-snapshot-diff + `lint:architecture`).

## Why this doc exists

Slices 1–16 produced a **correct but wide** tree: a fan of ~13 top-level siblings
(`features`, `lenses`, `renderModel`, `mapState`, `sharedView`, `preferences`, `fileStore`,
`threeViewer`, `store`, `load`, `util`, `model`, `resources`). The dependency *direction* is clean —
`npm run lint:architecture` reports **0 errors, 0 warnings, acyclic** across 1169 modules — but the
*shape* reads as a flat pile rather than a layered stack. This doc collapses that pile into a
readable linear stack **without touching a single edge**.

The one thing this migration never delivered (out of scope: CodeMap-renderer-only) is a distinct
**view/page** band — it collapsed into `features/`. This reorg finally carves it out.

## The target stack

Top = what you see, bottom = the data. **A layer imports only downward.**

```
app root      app/app.config.ts · app/main.ts            ← Angular bootstrap (outside codeCharta/)
              store/  · load/   ← PARKED, see "Open questions"
─────────────────────────────────────────────────────────────────────────────
views/        routes · page composition (codeCharta.component today; Graph/Report later)
features/     one flat layer · facade · components · services
renderer/     renderer/threeViewer/  (the Three.js engine: scene/camera/controls/mesh/layout)
              renderer/renderModel/  (derived read-model: accumulatedData, metricData, node selectors)
lenses/       metrics · dependency · structure        (read-only projections of the cc.json)
stores/       stores/mapState/     (CodeMap renderer's own presentation + metric selection)
              stores/sharedView/   (cross-renderer: focus · selection · search · blacklist · marked)
              stores/preferences/  (durable global prefs)
              stores/fileStore/    (the raw loaded file(s) + delta/provenance — the SOURCE)
util/         the leaf kernel (pure helpers; imports only util/ + model/ + node_modules)
model/        model/ + codeCharta.model.ts + codeCharta.api.model.ts   (the shared type vocabulary)
resources/    static assets · sample cc.json fixtures
```

## Per-boundary rationale (why each cut, and the edge it rests on)

| Boundary | Real dependency it encodes | Backing fitness function (post-move name) |
|---|---|---|
| **views → features** | The page composes features; nothing imports the page back. | `nothing-imports-views` *(new)* + `feature-no-external-access-to-internals` (views reach features only via facade/components/effects) |
| **features → renderer** | Features **drive** the engine (verified: `features/* → threeViewer`; the engine imports **zero** features). | `renderer-does-not-import-up` *(renamed from `three-viewer-engine-does-not-import-up`)* |
| **renderer → lenses / stores** | Both the engine and `renderModel` read lens facades + home facades **downward**. | existing lens/home boundary rules (`lens-external-access-only-via-public-surface`, `feature-reaches-state-home-only-via-facade`) |
| **renderModel sits in renderer, above lenses** | `renderModel` composes **across** lenses **and** homes, so it must sit above the lens band. Because you put **Lenses above Stores**, `renderModel` cannot live in `stores/` (it reads lenses = would be an upward edge) — the renderer tier is the only correct home. | `render-model-is-top-derived` (lenses/homes/fileStore must not import it) |
| **lenses ‖ stores** *(parallel, not a gradient)* | There is **no enforced edge between lenses and the homes**: a lens must not read view state, a home must not read a lens. They are **parallel leaves**; stacking Lenses above Stores is a *readability* choice (projection-of-file over mutable-state), not a dependency the tooling exercises. | `lens-no-view-state` + `state-home-is-leaf` (both directions fenced) |
| **stores → util → model/resources** | Homes/lenses/fileStore read the kernel; the kernel reads nothing above it. | `util-is-a-leaf-kernel` (positive allow-list: util/ may import only util/ + model/) |

## What actually moves (git-mv map)

Pure `git mv` — byte-identical files, only paths + imports change:

| From (today) | To (target) |
|---|---|
| `app/codeCharta/codeCharta.component.*` | `app/codeCharta/views/` |
| `app/codeCharta/threeViewer/` | `app/codeCharta/renderer/threeViewer/` |
| `app/codeCharta/renderModel/` | `app/codeCharta/renderer/renderModel/` |
| `app/codeCharta/mapState/` | `app/codeCharta/stores/mapState/` |
| `app/codeCharta/sharedView/` | `app/codeCharta/stores/sharedView/` |
| `app/codeCharta/preferences/` | `app/codeCharta/stores/preferences/` |
| `app/codeCharta/fileStore/` | `app/codeCharta/stores/fileStore/` |
| `app/codeCharta/codeCharta.model.ts` | `app/codeCharta/model/codeCharta.model.ts` |
| `app/codeCharta/codeCharta.api.model.ts` | `app/codeCharta/model/codeCharta.api.model.ts` |
| `util/`, `model/` (contents), `resources/`, `features/`, `lenses/` | **unchanged** |

`features/scenarios/model/` **stays put** — it is a feature-local type folder, not part of the shared
`model/` kernel; do not hoist it (that was a mis-read in an earlier draft — "both model folders" really
means the top-level `model/` **plus the two root `*.model.ts` files**).

## Two things this reorg does NOT fix (call them out so they don't hide)

1. **The 300-importer god-barrel.** `codeCharta.model.ts` is a 7-line `export *` barrel over
   `model/domain.model.ts` (292 lines), imported by **~300 files**. That is a **fan-in / god-object**
   problem — *not* a cycle problem (the graph is 0-cycle). Splitting `domain.model.ts` into cohesive
   type modules is a **separate slice** from this folder move; do not conflate "50 lines"/"300 importers"
   with "50 cycles."
2. **The wire-DTO fence must survive the move.** `codeCharta.api.model.ts` (the cc.json wire contract,
   13 importers) is fenced by `wire-dto-only-in-filestore-boundary`, and `model/ccjson2.model.ts` is
   forbidden from importing it. After moving both into `model/`, those rules must keep targeting the file
   **by its exact new path** (`model/codeCharta.api.model.ts`) and must **not** be relaxed into a
   whole-`model/`-folder allow — otherwise the DTO leaks into the domain kernel.

## Open questions (deliberately unresolved)

- **`load/` (write-side orchestrator).** Parked at the user's request. It is neither view/feature/store:
  it drives the homes/lenses/fileStore write facades on boot + runs the app-level effects
  (saveCcState/updateQueryParameters/updateFileSettings). It **cannot** go inside `stores/` — its own
  `load-orchestrator-not-imported-by-lower-layers` rule forbids any home/lens/fileStore from importing it,
  so co-locating it with them would invite a cycle. Candidate homes: an `app-root` band above `views/`, or
  its own thin band under features. Decide later.
- **`store/` (ngrx root composer).** `store/store.ts` is the sole ngrx composition root (only
  `app.config` imports it). Same "composition-root shard" category as `load/`. Parked at its current
  top-level path; likely belongs in the same `app-root` band.
- **Folder names `util/` vs `utils/`, `model/` vs `models/`.** The stack calls the layers *Utils* /
  *Models*; the folders are kept singular (`util/`, `model/`) to honor "utils can stay as is" and minimize
  churn. Flipping to plural is a pure string change if preferred.

## The property that makes this safe

Every move is a **pure `git mv` + a dep-cruiser path-prefix rewrite**. No file's logic changes, so:
render snapshots stay byte-identical, `tsc` stays green, and `depcruise` against the *target* config
reports the **same 0 errors / 0 warnings** it does today — only the paths in the report differ. If a
snapshot moves, the move wasn't pure → fix it (per `CONVENTIONS.md`). The god-barrel split (item 1 above)
is the only follow-on that touches real logic, and it is out of scope here.
</content>
</invoke>
