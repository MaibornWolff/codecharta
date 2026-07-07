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
 * This barrel re-exports each slice's selectors (read) and reducer + `default*` (store wiring + shared
 * read fallbacks), plus the combined `preferences` reducer, `defaultPreferences`, and the
 * `preferencesSelector` root selector used by `state.manager` to register the home. It re-exports NO
 * action creator — enforced by the `state-home-read-facade-has-no-dispatch` dep-cruiser rule.
 */
export * from "./store/preferences.reducer"
export * from "./store/preferences.selector"
export * from "./store/enableClipboard/screenshotToClipboardEnabled.reducer"
export * from "./store/enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
export * from "./store/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
export * from "./store/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
export * from "./store/isPresentationMode/isPresentationMode.reducer"
export * from "./store/isPresentationMode/isPresentationMode.selector"
export * from "./store/maxTreeMapFiles/maxTreeMapFiles.reducer"
export * from "./store/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
export * from "./store/sorting/sorting.reducer"
export * from "./store/sorting/sorting.selector"
