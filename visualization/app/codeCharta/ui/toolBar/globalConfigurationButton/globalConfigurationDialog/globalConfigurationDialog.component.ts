import { Component } from "@angular/core"
import { MatSlideToggleChange, MatSlideToggle } from "@angular/material/slide-toggle"
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
import { MatToolbar } from "@angular/material/toolbar"
import { CdkScrollable } from "@angular/cdk/scrolling"
import { MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection/mapLayoutSelection.component"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection/displayQualitySelection.component"
import { ResetSettingsButtonComponent } from "../../../resetSettingsButton/resetSettingsButton.component"
import { MatButton } from "@angular/material/button"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-global-configuration-dialog",
    templateUrl: "./globalConfigurationDialog.component.html",
    styleUrls: ["./globalConfigurationDialog.component.scss"],
    standalone: true,
    imports: [
        MatToolbar,
        CdkScrollable,
        MatDialogContent,
        MapLayoutSelectionComponent,
        DisplayQualitySelectionComponent,
        MatSlideToggle,
        ResetSettingsButtonComponent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
        AsyncPipe
    ]
})
export class GlobalConfigurationDialogComponent {
    screenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)
    experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)
    isWhiteBackground$ = this.store.select(isWhiteBackgroundSelector)
    hideFlatBuildings$ = this.store.select(hideFlatBuildingsSelector)
    resetCameraIfNewFileIsLoaded$ = this.store.select(resetCameraIfNewFileIsLoadedSelector)

    constructor(private readonly store: Store<CcState>) {}

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
}
