import { Component, ElementRef, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ScreenshotDestinationService } from "../../services/screenshotDestination.service"
import { ExperimentalFeaturesService } from "../../services/experimentalFeatures.service"
import { BackgroundThemeService } from "../../services/backgroundTheme.service"
import { FlatBuildingVisibilityService } from "../../services/flatBuildingVisibility.service"
import { AutomaticCameraResetService } from "../../services/automaticCameraReset.service"
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

    screenshotToClipboardEnabled = toSignal(this.screenshotDestinationService.screenshotToClipboardEnabled$(), {
        requireSync: true
    })
    experimentalFeaturesEnabled = toSignal(this.experimentalFeaturesService.experimentalFeaturesEnabled$(), {
        requireSync: true
    })
    isWhiteBackground = toSignal(this.backgroundThemeService.isWhiteBackground$(), { requireSync: true })
    hideFlatBuildings = toSignal(this.flatBuildingVisibilityService.hideFlatBuildings$(), { requireSync: true })
    resetCameraIfNewFileIsLoaded = toSignal(this.automaticCameraResetService.resetCameraIfNewFileIsLoaded$(), {
        requireSync: true
    })

    constructor(
        private readonly screenshotDestinationService: ScreenshotDestinationService,
        private readonly experimentalFeaturesService: ExperimentalFeaturesService,
        private readonly backgroundThemeService: BackgroundThemeService,
        private readonly flatBuildingVisibilityService: FlatBuildingVisibilityService,
        private readonly automaticCameraResetService: AutomaticCameraResetService
    ) {}

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    handleResetCameraIfNewFileIsLoadedChanged(checked: boolean) {
        this.automaticCameraResetService.setResetCameraIfNewFileIsLoaded(checked)
    }

    handleHideFlatBuildingsChanged(checked: boolean) {
        this.flatBuildingVisibilityService.setHideFlatBuildings(checked)
    }

    handleIsWhiteBackgroundChanged(checked: boolean) {
        this.backgroundThemeService.setWhiteBackground(checked)
    }

    handleExperimentalFeaturesEnabledChanged(checked: boolean) {
        this.experimentalFeaturesService.setExperimentalFeaturesEnabled(checked)
    }

    handleScreenshotToClipboardEnabledChanged(checked: boolean) {
        this.screenshotDestinationService.setScreenshotToClipboard(checked)
    }
}
