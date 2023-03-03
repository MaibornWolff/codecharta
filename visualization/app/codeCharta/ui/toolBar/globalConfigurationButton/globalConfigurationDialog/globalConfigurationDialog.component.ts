import { Component, ViewEncapsulation } from "@angular/core"
import { MatSlideToggleChange } from "@angular/material/slide-toggle"
import { Store } from "../../../../state/angular-redux/store"
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
import { GlobalSettingsHelper } from "../../../../util/globalSettingsHelper"

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

	constructor(private store: Store) {}

	handleResetCameraIfNewFileIsLoadedChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setResetCameraIfNewFileIsLoaded(event.checked))
		GlobalSettingsHelper.setGlobalSettingsInLocalStorage({ resetCameraIfNewFileIsLoaded: event.checked })
	}

	handleHideFlatBuildingsChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setHideFlatBuildings(event.checked))
		GlobalSettingsHelper.setGlobalSettingsInLocalStorage({ hideFlatBuildings: event.checked })
	}

	handleIsWhiteBackgroundChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setIsWhiteBackground(event.checked))
		GlobalSettingsHelper.setGlobalSettingsInLocalStorage({ isWhiteBackground: event.checked })
	}

	handleExperimentalFeaturesEnabledChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setExperimentalFeaturesEnabled(event.checked))
		GlobalSettingsHelper.setGlobalSettingsInLocalStorage({ experimentalFeaturesEnabled: event.checked })
	}

	handleScreenshotToClipboardEnabledChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setScreenshotToClipboardEnabled(event.checked))
		GlobalSettingsHelper.setGlobalSettingsInLocalStorage({ screenshotToClipboardEnabled: event.checked })
	}
}
