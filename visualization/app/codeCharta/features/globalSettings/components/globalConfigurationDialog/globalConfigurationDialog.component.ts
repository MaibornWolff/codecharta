import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { GlobalSettingsWriteStore } from "../../stores/globalSettings.write.store"
import { ExternalLinksComponent } from "./externalLinks/externalLinks.component"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection/mapLayoutSelection.component"
import { ResetMapButtonComponent } from "./resetMapButton/resetMapButton.component"
import { ResetSettingsButtonComponent } from "./resetSettingsButton/resetSettingsButton.component"
import { SettingToggleComponent } from "./settingToggle/settingToggle.component"

@Component({
    selector: "cc-global-configuration-dialog",
    templateUrl: "./globalConfigurationDialog.component.html",
    imports: [
        MapLayoutSelectionComponent,
        ResetMapButtonComponent,
        ResetSettingsButtonComponent,
        SettingToggleComponent,
        ExternalLinksComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalConfigurationDialogComponent {
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly globalSettingsWriteStore = inject(GlobalSettingsWriteStore)

    dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    screenshotToClipboardEnabled = toSignal(this.preferencesReadWindow.screenshotToClipboardEnabled$, {
        requireSync: true
    })
    experimentalFeaturesEnabled = toSignal(this.preferencesReadWindow.experimentalFeaturesEnabled$, {
        requireSync: true
    })
    isWhiteBackground = toSignal(this.mapStateReadWindow.isWhiteBackground$, { requireSync: true })
    hideFlatBuildings = toSignal(this.mapStateReadWindow.hideFlatBuildings$, { requireSync: true })
    resetCameraIfNewFileIsLoaded = toSignal(this.preferencesReadWindow.resetCameraIfNewFileIsLoaded$, {
        requireSync: true
    })

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    handleResetCameraIfNewFileIsLoadedChanged(checked: boolean) {
        this.globalSettingsWriteStore.setResetCameraIfNewFileIsLoaded(checked)
    }

    handleHideFlatBuildingsChanged(checked: boolean) {
        this.globalSettingsWriteStore.setHideFlatBuildings(checked)
    }

    handleIsWhiteBackgroundChanged(checked: boolean) {
        this.globalSettingsWriteStore.setWhiteBackground(checked)
    }

    handleExperimentalFeaturesEnabledChanged(checked: boolean) {
        this.globalSettingsWriteStore.setExperimentalFeaturesEnabled(checked)
    }

    handleScreenshotToClipboardEnabledChanged(checked: boolean) {
        this.globalSettingsWriteStore.setScreenshotToClipboard(checked)
    }
}
