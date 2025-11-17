import { Component, ElementRef, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setScreenshotToClipboardEnabled } from "../../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { setExperimentalFeaturesEnabled } from "../../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setHideFlatBuildings } from "../../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setIsWhiteBackground } from "../../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setResetCameraIfNewFileIsLoaded } from "../../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { GlobalSettingsFacade } from "../../../../features/globalSettings/facade"
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

    screenshotToClipboardEnabled = toSignal(this.globalSettingsFacade.screenshotToClipboardEnabled$(), { requireSync: true })
    experimentalFeaturesEnabled = toSignal(this.globalSettingsFacade.experimentalFeaturesEnabled$(), { requireSync: true })
    isWhiteBackground = toSignal(this.globalSettingsFacade.isWhiteBackground$(), { requireSync: true })
    hideFlatBuildings = toSignal(this.globalSettingsFacade.hideFlatBuildings$(), { requireSync: true })
    resetCameraIfNewFileIsLoaded = toSignal(this.globalSettingsFacade.resetCameraIfNewFileIsLoaded$(), { requireSync: true })

    constructor(
        private readonly store: Store<CcState>,
        private readonly globalSettingsFacade: GlobalSettingsFacade
    ) {}

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
