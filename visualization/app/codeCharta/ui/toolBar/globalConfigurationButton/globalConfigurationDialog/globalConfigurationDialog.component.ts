import { Component, ElementRef, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setScreenshotToClipboardEnabled } from "../../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { screenshotToClipboardEnabledSelector } from "../../../../features/globalSettings/facade"
import { setExperimentalFeaturesEnabled } from "../../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { experimentalFeaturesEnabledSelector } from "../../../../features/globalSettings/facade"
import { setHideFlatBuildings } from "../../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { hideFlatBuildingsSelector } from "../../../../features/globalSettings/facade"
import { setIsWhiteBackground } from "../../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { isWhiteBackgroundSelector } from "../../../../features/globalSettings/facade"
import { setResetCameraIfNewFileIsLoaded } from "../../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { resetCameraIfNewFileIsLoadedSelector } from "../../../../features/globalSettings/facade"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection/mapLayoutSelection.component"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection/displayQualitySelection.component"
import { ResetSettingsButtonComponent } from "./resetSettingsButton/resetSettingsButton.component"
import { SettingToggleComponent } from "./settingToggle/settingToggle.component"
import { ExternalLinksComponent } from "./externalLinks/externalLinks.component"

@Component({
    selector: "cc-global-configuration-dialog",
    templateUrl: "./globalConfigurationDialog.component.html",
    imports: [
        MapLayoutSelectionComponent,
        DisplayQualitySelectionComponent,
        ResetSettingsButtonComponent,
        SettingToggleComponent,
        ExternalLinksComponent
    ]
})
export class GlobalConfigurationDialogComponent {
    dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    screenshotToClipboardEnabled = toSignal(this.store.select(screenshotToClipboardEnabledSelector), { requireSync: true })
    experimentalFeaturesEnabled = toSignal(this.store.select(experimentalFeaturesEnabledSelector), { requireSync: true })
    isWhiteBackground = toSignal(this.store.select(isWhiteBackgroundSelector), { requireSync: true })
    hideFlatBuildings = toSignal(this.store.select(hideFlatBuildingsSelector), { requireSync: true })
    resetCameraIfNewFileIsLoaded = toSignal(this.store.select(resetCameraIfNewFileIsLoadedSelector), { requireSync: true })

    constructor(private readonly store: Store<CcState>) {}

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    handleResetCameraIfNewFileIsLoadedChanged(checked: boolean) {
        this.store.dispatch(setResetCameraIfNewFileIsLoaded({ value: checked }))
    }

    handleHideFlatBuildingsChanged(checked: boolean) {
        this.store.dispatch(setHideFlatBuildings({ value: checked }))
    }

    handleIsWhiteBackgroundChanged(checked: boolean) {
        this.store.dispatch(setIsWhiteBackground({ value: checked }))
    }

    handleExperimentalFeaturesEnabledChanged(checked: boolean) {
        this.store.dispatch(setExperimentalFeaturesEnabled({ value: checked }))
    }

    handleScreenshotToClipboardEnabledChanged(checked: boolean) {
        this.store.dispatch(setScreenshotToClipboardEnabled({ value: checked }))
    }
}
