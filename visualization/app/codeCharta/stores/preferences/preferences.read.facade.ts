/**
 * READ surface of the preferences state-home (Slice 13 CQRS split) — selectors, the root selector,
 * the `default*` read fallbacks, and the store wiring (combined reducer + `defaultPreferences`).
 *
 * preferences owns the durable, global user preferences that are neither map-view settings, cc.json
 * source, nor cross-renderer view state: the presentation-mode toggle, the reset-camera-on-new-file
 * toggle, the experimental-features + screenshot-to-clipboard toggles, the height↔color-metric link,
 * the max-tree-map-files cap, and the file-explorer sort order/option.
 *
 * Slice 13a split the old single `preferences.facade` barrel into this read facade and a
 * `preferences.write.facade` (action creators), so a display-only consumer physically cannot dispatch.
 * This barrel re-exports the combined `preferences` reducer + `defaultPreferences` and the
 * `preferencesSelector` root selector (store wiring for `state.manager`), plus the read selectors and
 * `default*` read fallbacks consumed through it. Slice 18c made every re-export explicit (no more
 * `export *`) and dropped the ones no consumer imported via the facade — the per-slice reducers are
 * imported directly by the combined reducer. It re-exports NO action creator — enforced by the
 * `state-home-read-facade-has-no-dispatch` dep-cruiser rule.
 */

export { isColorMetricLinkedToHeightMetricSelector } from "./store/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
export { isPresentationModeSelector } from "./store/isPresentationMode/isPresentationMode.selector"
export { defaultPreferences, preferences } from "./store/preferences.reducer"
export { preferencesSelector } from "./store/preferences.selector"
export { defaultSorting } from "./store/sorting/sorting.reducer"
export { sortingOrderAscendingSelector, sortingOrderSelector } from "./store/sorting/sorting.selector"
