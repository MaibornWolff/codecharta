import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { screenshotToClipboardEnabledSelector } from "./enableClipboard/screenshotToClipboardEnabled.selector"
import { experimentalFeaturesEnabledSelector } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { isPresentationModeSelector } from "./isPresentationMode/isPresentationMode.selector"
import { maxTreeMapFilesSelector } from "./maxTreeMapFiles/maxTreeMapFiles.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { sortingOrderAscendingSelector, sortingOrderSelector } from "./sorting/sorting.selector"

@Injectable({
    providedIn: "root"
})
export class PreferencesReadWindow {
    constructor(private readonly store: Store<CcState>) {}

    readonly isPresentationMode$ = this.store.select(isPresentationModeSelector)
    readonly isColorMetricLinkedToHeightMetric$ = this.store.select(isColorMetricLinkedToHeightMetricSelector)
    readonly screenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)
    readonly experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)
    readonly resetCameraIfNewFileIsLoaded$ = this.store.select(resetCameraIfNewFileIsLoadedSelector)
    readonly maxTreeMapFiles$ = this.store.select(maxTreeMapFilesSelector)
    readonly sortingOrder$ = this.store.select(sortingOrderSelector)
    readonly sortingOrderAscending$ = this.store.select(sortingOrderAscendingSelector)
}
