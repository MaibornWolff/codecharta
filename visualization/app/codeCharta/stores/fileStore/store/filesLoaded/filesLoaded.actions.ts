import { createAction, props } from "@ngrx/store"
import { DependencyLensSource, MetricsLensSource, SharedView } from "../../../../model/codeCharta.model"
import { UrlMetricSelection } from "../../../../util/queryParameter/queryParameter"

export type FilesLoadedSource = "url" | "indexedDB" | "sample" | "upload" | "reset"

/**
 * The view slices of a restored session. They must beat the values derived from the files themselves:
 * a user's exclusions, marked packages and focus live ONLY here — they are never written back into the
 * file's own fileSettings — so a file-derived merge would silently erase them.
 */
export interface RestoredSettings {
    sharedView: SharedView
    metricsLensSource: MetricsLensSource
    dependencyLensSource: DependencyLensSource
}

export interface FilesLoadedPayload {
    source: FilesLoadedSource
    areSampleFiles: boolean
    // Only populated when the FILES themselves came from the ?file= parameter. Never for uploads —
    // an upload must not re-apply the metrics of a URL that describes different files.
    urlMetrics: UrlMetricSelection
    // True only on the initial boot when the persisted preference resetCameraIfNewFileIsLoaded is
    // false: the very first map must still be fitted once, even though later loads must not be.
    forceAutoFit: boolean
    // A reset discards the previous selection on purpose, so the metrics fall back to the computed
    // default even when the old selection would still be available in the reloaded files.
    forceDefaultMetrics: boolean
    // Set when this load restores a persisted session. Null for a fresh load.
    restoredSettings: RestoredSettings | null
}

/**
 * The single "a file set was loaded" signal. No reducer handles it — it exists so that the post-load
 * reconciliation has one trigger carrying the provenance of the load.
 */
export const filesLoaded = createAction("FILES_LOADED", props<FilesLoadedPayload>())
