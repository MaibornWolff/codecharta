import { createAction, props } from "@ngrx/store"
import { UrlMetricSelection } from "../../../../util/queryParameter/queryParameter"

export type FilesLoadedSource = "url" | "indexedDB" | "sample" | "upload" | "reset"

export interface FilesLoadedPayload {
    source: FilesLoadedSource
    areSampleFiles: boolean
    // Only populated when the FILES themselves came from the ?file= parameter. Never for uploads —
    // an upload must not re-apply the metrics of a URL that describes different files.
    urlMetrics: UrlMetricSelection
    // True only on the initial boot when the persisted preference resetCameraIfNewFileIsLoaded is
    // false: the very first map must still be fitted once, even though later loads must not be.
    forceAutoFit: boolean
}

/**
 * The single "a file set was loaded" signal. No reducer handles it — it exists so that the
 * post-load reconciliation has one trigger carrying the provenance of the load.
 */
export const filesLoaded = createAction("FILES_LOADED", props<FilesLoadedPayload>())
