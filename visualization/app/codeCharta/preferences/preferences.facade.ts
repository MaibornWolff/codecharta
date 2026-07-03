/**
 * Public surface of the preferences state-home — the ONLY thing outsiders import.
 *
 * preferences owns the durable, global user preferences that are neither map-view settings, cc.json
 * source, nor cross-renderer view state: the presentation-mode toggle, the reset-camera-on-new-file
 * toggle, the experimental-features + screenshot-to-clipboard toggles, the height↔color-metric link,
 * the max-tree-map-files cap, and the file-explorer sort order/option. Slice 10 pulled the seven
 * ex-appSettings prefs and the ex-dynamicSettings sortingOption out of those two grab-bag
 * combineReducers into the preferences combineReducers — all now persist under `state.preferences.*`.
 *
 * This barrel re-exports each slice's selectors (read), action creators (write), reducer + `default*`
 * (store wiring), plus — added in the behavioral reshape — the combined `preferences` reducer,
 * `defaultPreferences`, and the `preferencesSelector` root selector used by `state.manager` to register
 * the home. Consumers read preferences only through here; the `store/` internals stay private by
 * convention (the `state-home-is-leaf` dep-cruiser rule locks the leaf direction).
 */
export * from "./store/preferences.reducer"
export * from "./store/preferences.selector"
export * from "./store/preferences.actions"
export * from "./store/enableClipboard/screenshotToClipboardEnabled.actions"
export * from "./store/enableClipboard/screenshotToClipboardEnabled.reducer"
export * from "./store/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
export * from "./store/enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
export * from "./store/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
export * from "./store/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
export * from "./store/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
export * from "./store/isPresentationMode/isPresentationMode.actions"
export * from "./store/isPresentationMode/isPresentationMode.reducer"
export * from "./store/isPresentationMode/isPresentationMode.selector"
export * from "./store/maxTreeMapFiles/maxTreeMapFiles.actions"
export * from "./store/maxTreeMapFiles/maxTreeMapFiles.reducer"
export * from "./store/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
export * from "./store/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
export * from "./store/sorting/sortingOrderAscending.actions"
export * from "./store/sorting/sortingOrderAscending.reducer"
export * from "./store/sorting/sortingOrderAscending.selector"
export * from "./store/sorting/sorting.actions"
export * from "./store/sorting/sorting.reducer"
export * from "./store/sorting/sorting.selector"
