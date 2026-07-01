---
name: viz-2.0-slice-4-appearance
issue:
state: todo
version: 1
---

# Roadmap — Visualization 2.0, Slice 4: stand up the Appearance module

> Slices 1–3 built the **Metrics** and **Dependency** lenses (the *data* side). This slice starts
> decomposing the legacy `state/` into the new-world **shared state modules**. The full three-way split
> (`interaction` · `appearance` · per-renderer `viewState`) is too large and too entangled with the
> renderer/page split for one safe slice, so we take the **cleanest, most self-contained first cut:
> `appearance`** — the purely-visual leaf state (colors, labels, scaling, axis inversion, and edge
> *visibility*). It is the increment that decouples the most with the least renderer coupling: it lets
> the **dependency lens stop reading `state/appSettings/showEdges`** and the **metrics-lens legend stop
> reading `state/appSettings/mapColors`**, and it delivers CARRIED-FORWARD item **#2b (edge appearance)**.
> Metric/edge **selection** (`viewState`, items #3 + #2b-selection) and **interaction** (hover/select/
> search/focus/blacklist) are the next two slices.
>
> **Every step follows `CONVENTIONS.md`** — snapshots are the behavior contract (never `-u`), structural
> commits ⇒ zero snapshot diff, behavioral swaps prove value-equality before delete, each boundary backed
> by a dep-cruiser rule.

## Definition of done
- A real **`app/codeCharta/appearance`** module exists: `store/` (the moved visual setting slices) +
  `appearance.facade.ts` (the public selector/store surface outsiders import).
- The following **visual leaf settings** live under `appearance/` (moved from `state/store/appSettings`,
  not duplicated): `mapColors` (kept whole), `isWhiteBackground`, `scaling`, `invertHeight`, `invertArea`,
  `hideFlatBuildings`; the label group (`colorLabels`, `showMetricLabelNodeName`, `showMetricLabelNameValue`,
  `amountOfTopLabels`, `labelSize`, `enableFloorLabels`, `labelMode`, `groupLabelCollisions`, `labelsPerMap`);
  and the **edge appearance** group (item #2b): `isEdgeMetricVisible`, `amountOfEdgePreviews`, `edgeHeight`,
  `showEdges/{incoming,outgoing}`, `showOnlyBuildingsWithEdges`.
- The **file-load settings-seeding is inverted out of `fileStore`**: `LoadInitialFileStore` no longer
  imports/dispatches these settings' action creators (that would be an illegal `fileStore → appearance`
  edge under the already-`error` `filestore-has-no-upward-deps` rule). A legacy/shell settings-restore
  effect applies file-provided + URL settings instead.
- The two **lens → `state/` appearance bridges are retired**: `dependency-lens` reads `showEdges` via the
  appearance facade, and the metrics-lens **legend** reads `mapColors` via the appearance facade.
- dep-cruiser: new `shared-state-is-leaf` rule (at `warn`) governs `appearance/`; the ngrx-owner allow-list
  includes `appearance/`; **0 new errors**, and the `new-must-not-import-legacy` `warn` count **drops**
  (report the delta, as Slice 2 did). unit green; render-pipeline Jest snapshots byte-identical.

## Scope guards (explicitly OUT — carried forward)
- **Metric/edge *selection*** (`areaMetric`/`heightMetric`/`colorMetric`/`edgeMetric`/`distributionMetric`,
  `dynamicSettings`) — the **viewState** slice (items #3 + #2b-selection). Blocked here by the
  lens-reads-`colorMetric` ↔ per-renderer-`viewState` tension (see Notes); appearance avoids it entirely.
- **`colorRange` · `colorMode` · `margin` · `sortingOption` · `sortingOrderAscending`** — the design docs
  route these to **per-renderer `viewState`** (color mapping / layout), and `colorRange`/`colorMode` are
  bound to the `colorMetric` value domain the metrics-lens legend reads. Left for the viewState slice.
- **`isPresentationMode`** (appearance vs shell) and the **app/shell prefs** (`experimentalFeaturesEnabled`,
  `screenshotToClipboardEnabled`, `maxTreeMapFiles`, `resetCameraIfNewFileIsLoaded`, `layoutAlgorithm`,
  `isColorMetricLinkedToHeightMetric`) — a later `shell`/`viewState` slice.
- **`interaction`** state (`hoveredNodeId`, `selectedBuildingId`, `rightClickedNodeData`, `searchPattern`,
  `focusedNodePath`, `isLoadingFile/Map`, and the `blacklist` filter home) — the **interaction** slice.
- **`markedPackages`** — the design routes it to appearance, but it is a per-file `fileSettings` slice with
  a large consumer/marking surface; move it with the interaction/fileSettings work, not here.
- **`mapColors` is NOT split** — the incoming/outgoing edge colors stay in the one shared flat map (the
  arrow renderer reads two keys), exactly as `attributeTypes`/`attributeDescriptors` stayed whole.
- **No ngrx store-shape reshape** — settings move as a *code/import* boundary; they keep contributing to
  the existing `appSettings` combineReducers key (see Open decision). Re-keying `state.appSettings.*` →
  `state.appearance.*` is a separate, riskier step (URL/scenario/IndexedDB/`_applyPartialState` paths).
- **Full `new-must-not-import-legacy` → `error` flip** (item #5) — needs the interaction + viewState
  slices too (the lenses still read `colorMetric`, `blacklist`; fileStore still seeds non-appearance
  settings). This slice only *shrinks* the warn set; the flip lands when `state/` is fully split.
- **Edge `attributeTypes` + injectable `DependencyLensStore`/`EdgesRepo`** (item #2a) — still no
  single-lens edge consumer; stays deferred.

## Open decision to make first
**Code-boundary vs store-key reshape.** Moving a visual setting into `appearance/` can mean either (a) a
**code/import move** — the reducer/actions/selector files live under `appearance/` but still register under
the existing `appSettings` combineReducers key, so the store *shape* and every `state.appSettings.mapColors`
path are unchanged; or (b) a **store-key reshape** — a real `state.appearance` root slice. Option (b)
touches `_applyPartialState`'s hardcoded dotted paths, URL (de)serialization, scenarios, and IndexedDB
persistence, and risks snapshot/behavior drift. **Recommendation: (a) code-boundary this slice** (keeps
behavior byte-identical, matches how the lenses moved *code* without re-keying), and schedule the store-key
reshape for a dedicated later step once all three modules exist. Ratify before Step 3. Concretely, several
consumers read the settings by **dotted path off `CcState`** rather than via a selector import
(`treeMapHelper` → `state.appSettings.showOnlyBuildingsWithEdges`; `_applyPartialState`'s hardcoded merge
paths) — the code-boundary approach leaves every one of them untouched, whereas a store-key reshape would
have to rewrite all of them in lockstep.

## Ordering rationale (Tidy First: structure before behavior)
Invert the load-seeding out of `fileStore` (behavioral, shared groundwork) → create the `appearance/`
skeleton + scoped rules (structural) → `git mv` the visual settings + repoint importers (structural,
zero-diff) → repoint the two lens reads to the facade (behavioral, bridge retirement) → optionally flip
the cheap `metrics-lens-ngrx-guard` → verify + docs. The load-seeding inversion comes **first** because the
`filestore-has-no-upward-deps` rule is already `error`: the moment an appearance action moves, any surviving
`fileStore →` import of it is a hard build break.

## Steps

### 1. Invert the file-load settings-seeding out of `fileStore` (behavioral, shared groundwork)
- Today `fileStore/loaders/ccJson/stores/loadInitialFile.store.ts` imports ~30 `state/store/*` action
  creators and dispatches them (`applyAppSettings`/`applyDynamicSettings`/`applyFileSettings` +
  `mapAppSettingToAction`, `setMetricsFromUrlValues`) to restore saved-file + URL settings.
- Relocate the **settings-restore responsibility** into a legacy/shell effect *outside* `fileStore`
  (e.g. `state/effects/applyLoadedSettings/`), invoked by the load pipeline via an action/event rather than
  a direct dispatch from within `fileStore`. Legacy → new is the allowed flow, and the applier may import
  both the `fileStore` facade and the (future) `appearance` facade without tripping `filestore-has-no-upward-deps`.
- This is **shared groundwork** the interaction/viewState slices also need. Behavior-preserving: the same
  actions fire in the same order; parity via the existing `loadInitialFile` specs + the e2e upload/URL flow.

### 2. Create the `appearance/` skeleton + scoped dep-cruiser rules (structural)
- Add `app/codeCharta/appearance/{store/, appearance.facade.ts}` (facade = the public selector/store barrel).
- Add **`shared-state-is-leaf`** at `warn` (`appearance/` must not import `lenses/renderers/shell`) to lock
  the leaf direction from day one, and **extend the ngrx-owner allow-list** to include `appearance/` so its
  stores may import `@ngrx/store`. Keep `new-must-not-import-legacy` at `warn`.

### 3. Move the visual + label + edge-appearance settings into `appearance/store/` (structural, `git mv`)
- `git mv` the setting folders listed in the DoD from `state/store/appSettings/*` into `appearance/store/*`;
  fix their relative imports. **Preserve the store shape** (still register under the `appSettings` key per the
  Open decision). Keep `mapColors` whole.
- Repoint **every importer** to the appearance facade: metricsBar edge/color/label components + services +
  stores, the codeMap render selectors (`edgePreviewNodes`, `edgeVisibility`, arrow service),
  `actionsRequiringRerender` / `actionsRequiringUpdateQueryParameters`, and the `state.manager`
  registration. `grep` the old paths (incl. `.spec.ts`) as the checklist. Byte-identical, **zero
  snapshot diff**. Note: **direct `state.appSettings.*` field readers need no change** under the
  code-boundary approach — e.g. `treeMapHelper` reads `state.appSettings.showOnlyBuildingsWithEdges`
  by dotted path (not via a selector import), so preserving the `appSettings` store key leaves it
  untouched.

### 4. Repoint the two lens reads to the appearance facade (behavioral, bridge retirement)
- `lenses/dependency/store/sortedNodeEdgeMetricsMap.selector.ts` → read `showIncoming/OutgoingEdges` from the
  appearance facade (retires a `new-must-not-import-legacy` warn edge; `dependency-lens → appearance` is the
  allowed lens read per `lens-no-ui-dependency`).
- `lenses/metrics/features/legend/services/legend.service.ts` + `legendColorRow.component.ts` → read
  `mapColors` from the appearance facade. Value-identical; parity tests before deleting the old reads.

### 5. (Optional free win) Flip `metrics-lens-ngrx-guard` to `error`
- It is tripped by a **single** edge: `legend.service.ts` injecting `@ngrx/store` directly. Move that
  injection into a legend feature store/selector (or the metrics-lens store), then flip the rule to `error`.
  Self-contained; may also be split into its own tiny follow-up.

### 6. Verify + document
- `npx tsc --noEmit` clean; `npm test` green with **zero snapshot diff, no `-u`**; `npm run lint:architecture`
  — **0 errors**, and report the `new-must-not-import-legacy` warn-count **delta** (edges retired: the
  fileStore appearance-seeding + the two lens reads). Run `npm run e2e` for the upload / URL round-trip /
  edge-visibility flows; manual smoke of colors, labels, and edge visibility vs `main`.
- Update `CHANGELOG.md`; update `CARRIED-FORWARD.md` (mark **#2b edge-appearance done**; keep #2b-selection +
  #3 for viewState, #2a deferred; note #5 partially advanced).

## Steps (tracked)
- [ ] Complete Task 1: invert the file-load settings-seeding out of `fileStore`
- [ ] Complete Task 2: `appearance/` skeleton + `shared-state-is-leaf` (warn) + ngrx-owner allow-list
- [ ] Complete Task 3: `git mv` the visual/label/edge-appearance settings + repoint importers (zero-diff)
- [ ] Complete Task 4: repoint the dependency-lens `showEdges` + legend `mapColors` reads to the facade
- [ ] Complete Task 5: (optional) flip `metrics-lens-ngrx-guard` to error via the legend.service fix
- [ ] Complete Task 6: verify (tsc / test / lint:architecture / e2e) + docs

## Notes
- **Why not `viewState` first** — the *only* new-world code reading metric selection from `state/` is the
  **metrics lens** (`legend.service` + `metricsLens.selectors` read `colorMetricSelector`). The design pins
  `viewState` **inside** the renderer (`renderers/codeMap/viewState/`), and `lens-no-ui-dependency` forbids
  a lens importing `renderers/` — so moving selection to per-renderer `viewState` would force parameterizing
  the lens (dissolving its internal `colorMetric` read), which belongs to the renderer/page split (item #6).
  `appearance` is a top-level leaf a lens *may* read, so it sidesteps the tension entirely.
- **The load-seeding inversion is the real cost of any first `state/` slice**, not appearance-specific:
  `filestore-has-no-upward-deps` is already `error`, so the split cannot merely rename `state/` — fileStore
  must stop dispatching upward into the moved modules. Doing it here unblocks slices 5 & 6 too.
- **Cross-cutting infra to keep working**: `_applyPartialState`'s hardcoded dotted paths, the URL
  query-parameter round-trip, scenarios, and IndexedDB persistence all key off the current store shape —
  preserved by the code-boundary approach (Open decision), so they need no change this slice.
- **Rollback** — Step 1 (seeding inversion) and Steps 3–4 are isolated; revert the offending commit to
  restore the `state/`-owned path with zero runtime impact. The new dep-cruiser rules are `warn`, so a
  revert cannot break CI.
- Sources: this slice was scoped from the `slice4-understand` pass (state-tree classification, 2.0 design
  intent, the item-#2b edge-consumer map, and the dep-cruiser flip analysis) + `CARRIED-FORWARD.md`
  items #2b, #3, #5.

## Outcome (executed <date>)

_To be filled after execution (commits, test/lint results, decisions/corrections, deferrals) — following
the Slice 2 & 3 precedent._
