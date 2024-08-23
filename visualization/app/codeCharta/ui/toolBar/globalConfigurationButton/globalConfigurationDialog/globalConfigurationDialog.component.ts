import { Component, ViewEncapsulation } from "@angular/core"
import { MatSlideToggleChange } from "@angular/material/slide-toggle"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setScreenshotToClipboardEnabled } from "../../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { screenshotToClipboardEnabledSelector } from "../../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { setExperimentalFeaturesEnabled } from "../../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { experimentalFeaturesEnabledSelector } from "../../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"
import { setHideFlatBuildings } from "../../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { hideFlatBuildingsSelector } from "../../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.selector"
import { setIsWhiteBackground } from "../../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { isWhiteBackgroundSelector } from "../../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.selector"
import { setResetCameraIfNewFileIsLoaded } from "../../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { resetCameraIfNewFileIsLoadedSelector } from "../../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { safeReloadSelector } from "../../../../state/store/appSettings/safeReload/safeReload.selector"
import { setSafeReload } from "../../../../state/store/appSettings/safeReload/safeReload.actions"

@Component({
    templateUrl: "./globalConfigurationDialog.component.html",
    encapsulation: ViewEncapsulation.None
})
export class GlobalConfigurationDialogComponent {
    screenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)
    experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)
    isWhiteBackground$ = this.store.select(isWhiteBackgroundSelector)
    hideFlatBuildings$ = this.store.select(hideFlatBuildingsSelector)
    resetCameraIfNewFileIsLoaded$ = this.store.select(resetCameraIfNewFileIsLoadedSelector)
    safeReload = this.store.select(safeReloadSelector)

    constructor(private store: Store<CcState>) {}

    handleResetCameraIfNewFileIsLoadedChanged(event: MatSlideToggleChange) {
        this.store.dispatch(setResetCameraIfNewFileIsLoaded({ value: event.checked }))
    }

    handleHideFlatBuildingsChanged(event: MatSlideToggleChange) {
        this.store.dispatch(setHideFlatBuildings({ value: event.checked }))
    }

    handleIsWhiteBackgroundChanged(event: MatSlideToggleChange) {
        this.store.dispatch(setIsWhiteBackground({ value: event.checked }))
    }

    handleExperimentalFeaturesEnabledChanged(event: MatSlideToggleChange) {
        this.store.dispatch(setExperimentalFeaturesEnabled({ value: event.checked }))
    }

    handleScreenshotToClipboardEnabledChanged(event: MatSlideToggleChange) {
        this.store.dispatch(setScreenshotToClipboardEnabled({ value: event.checked }))
    }

    handleSafeReloadChanged(event: MatSlideToggleChange) {
        this.store.dispatch(setSafeReload({ value: event.checked }))
    }
}
