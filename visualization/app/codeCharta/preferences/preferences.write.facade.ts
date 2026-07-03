/**
 * WRITE surface of the preferences state-home (Slice 13 CQRS split) — the ONLY dispatch surface.
 *
 * This barrel re-exports the preferences action creators (`setX`/`toggleX`) plus the
 * `preferencesActions` union consumed by `actionsRequiringSaveCcState` for `.type` membership.
 * Writers (feature `stores/`, the load applier, save/rerender effects) import from here; display
 * components do not — enforced by the `state-home-write-facade-is-sole-dispatch-surface` and
 * `display-components-cannot-dispatch` dep-cruiser rules. Readers use `preferences.read.facade`.
 */
export * from "./store/preferences.actions"
export * from "./store/enableClipboard/screenshotToClipboardEnabled.actions"
export * from "./store/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
export * from "./store/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
export * from "./store/isPresentationMode/isPresentationMode.actions"
export * from "./store/maxTreeMapFiles/maxTreeMapFiles.actions"
export * from "./store/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
export * from "./store/sorting/sorting.actions"
