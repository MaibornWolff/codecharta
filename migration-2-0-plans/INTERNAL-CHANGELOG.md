---
name: viz-2.0-internal-changelog
issue:
state: living
version: 1
---

# Internal changelog — Visualization 2.0 migration

> These entries were written for `visualization/CHANGELOG.md` and moved here instead.
>
> A changelog entry exists to tell a **user** what changed for them. Internal restructuring — module
> moves, state-home reshapes, lint rules, CI wiring — does not belong in the user-facing changelog no
> matter how large the diff. Six of the entries below say so in their own text: *"No user-facing
> behavior change (render and metric values are identical)."*
>
> The per-slice plans (`slice-2-*.md` … `slice-19-*.md`) record the *design*; this file records the
> narrative as it would have read in a release note. Append here when a slice lands an internal-only
> change worth remembering.

## Unreleased

### Changed

- **Metrics lens architecture (Visualization 2.0, Slice 1)**: Node-metric data now flows through a dedicated `lenses/metrics` module — a store + repos behind a single `MetricsLens` facade — that the codeMap render pipeline, the floating metrics bar, and the Inspector read from. The files slice and the load pipeline moved into a new `fileStore/` module, and the **Legend**'s per-concern services were collapsed onto one view-model. No user-facing behavior change (render and metric values are identical).
- **Metrics lens owns the node-metric domain (Visualization 2.0, Slice 2)**: The metrics lens now **owns** node-metric computation — `nodeMetricData.calculator`, the color-range selector, and the node-side attribute maps all moved under `lenses/metrics/store`. The legacy `metricDataSelector` became a shrinking aggregator that reads the lens's node selector through the facade and keeps composing the (still-legacy) edge side for the future dependency lens, so its cross-cutting consumers are unchanged. The Slice-1 color-range duplication was collapsed onto the single owned selector, and the shared `sortByMetricName`/`UNARY_METRIC` helpers moved to `util/metric`. No user-facing behavior change (render and metric values are identical).
- **Dependency (edge) lens (Visualization 2.0, Slice 3)**: A new `lenses/dependency` module now **owns** the edge-metric data — the `calculateEdgeMetricData` engine and the edge selectors (`edgeMetricData`, `nodeEdgeMetricsMap`, edge-metric names, `sortedNodeEdgeMetricsMap`) moved under `lenses/dependency/store` behind a `DependencyLens` facade. `metricDataSelector` is now a thin aggregator that reads the node side from the metrics lens and the edge side from the dependency lens, keeping its combined shape for cross-cutting consumers. The edge-preview, edge-building-count, and edge query-parameter/reset paths read the lens facade directly. Edge *selection* and edge *appearance* settings stay put for the viewState/appearance slice. No user-facing behavior change (render and metric values are identical).
- **Appearance module (Visualization 2.0, Slice 4)**: The purely-visual leaf settings — map colors, the label group, scaling, axis inversion, hide-flat-buildings, white background, and edge *appearance* (edge visibility, edge height, edge previews, buildings-with-edges) — now live in a dedicated `appearance/` shared-state module behind a single `appearance.facade`, moved out of `state/store/appSettings`. It is a **code-boundary** move: the settings still register under the existing `appSettings` store key, so `state.appSettings.*`, the URL query round-trip, scenarios and IndexedDB persistence stay byte-identical. This lets the **dependency lens** read edge visibility and the **metrics-lens legend** read map colors through the appearance facade instead of legacy `state/`, and the file-load settings applier moved out of `fileStore` so the module boundary holds (a new `shared-state-is-leaf` dependency-cruiser rule pins `appearance/` as a leaf). No user-facing behavior change (render and settings are identical).
- **Feature architecture migration**: Moved the remaining `app/codeCharta/ui/` components into the feature-slice architecture — `features/shared` (actionIcon, errorDialog, loadingFileProgressSpinner, resetSettingsButton), `features/fileExtensionBar`, `features/codeMap`, and `features/viewCube`. Each slice is reached through a `facade.ts`, contains no SCSS (daisyUI/Tailwind only), and accesses `@ngrx/store` only from `stores/`/`selectors/`. The `ui/` directory is gone and the dependency-cruiser SCSS rule now covers all of `app/codeCharta/`. No user-facing behavior change.
- **mapState state-home (Visualization 2.0, Slice 5)**: The Slice-4 `appearance/` module is renamed to `mapState/` and its 21 map-view settings now register under their own **`state.mapState`** root instead of being combined into `appSettings` — the first slice where the state has a real runtime home. This is a **store-key reshape** (not just a folder move): the model splits a new `MapState` type out of `AppSettings`, every `state.appSettings.<mapKey>` reader/selector/reset-key now points at `mapState`, the file-load applier gains an `applyMapState` path, scenario apply patches key colors/labels under `mapState`, and the IndexedDB store bumps to **v3** with a real record transform that re-homes a persisted v2 blob's map-view settings into `mapState` (so an old blob doesn't silently revert to defaults). The URL round-trip is untouched (it only carries metric/mode/file params). No user-facing behavior change (render, settings, and persistence are identical).

### Chore

- **Metrics-lens aggregator shrink**: The three node-only consumers that still read the shrinking `metricDataSelector` aggregator — the reset-chosen-metrics effect, the render-availability selector, and the map-reset store — now read the metrics lens's `nodeMetricData` selector directly through its facade. The value is identical (the aggregator's node slot already *is* that selector), moving the aggregator one step closer to deletion. No user-facing behavior change.
- **Metrics-lens boundary enforcement**: dependency-cruiser now enforces (at `error`) the `lenses/` and `fileStore/` boundaries — outside code reaches a lens only through its public facade or a feature's `components/`, components go through services, services read repos, and the cc.json wire DTO stays confined to the `fileStore` ingestion seam.
- **CI schema-drift guards**: CI now runs the 2.0 schema drift guards when only the schema source of truth (`dev_docs/cc-json-2.0.schema.json`) changes: the analysis and visualization test workflows watch that path in addition to their own trees.
