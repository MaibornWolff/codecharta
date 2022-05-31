import { Inject, Injectable } from "@angular/core"
import { combineLatest, tap } from "rxjs"
import { GlobalSettingsHelper } from "../../../util/globalSettingsHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { screenshotToClipboardEnabledSelector } from "../../store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { experimentalFeaturesEnabledSelector } from "../../store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"
import { hideFlatBuildingsSelector } from "../../store/appSettings/hideFlatBuildings/hideFlatBuildings.selector"
import { isWhiteBackgroundSelector } from "../../store/appSettings/isWhiteBackground/isWhiteBackground.selector"
import { layoutAlgorithmSelector } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { maxTreeMapFilesSelector } from "../../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { sharpnessModeSelector } from "../../store/appSettings/sharpnessMode/sharpnessMode.selector"

@Injectable()
export class SyncGlobalSettingsInLocalStorageEffect {
	constructor(@Inject(Store) private store: Store) {}

	syncGlobalSettingsInLocalStorage$ = createEffect(
		() =>
			combineLatest([
				this.store.select(hideFlatBuildingsSelector),
				this.store.select(isWhiteBackgroundSelector),
				this.store.select(resetCameraIfNewFileIsLoadedSelector),
				this.store.select(maxTreeMapFilesSelector),
				this.store.select(sharpnessModeSelector),
				this.store.select(screenshotToClipboardEnabledSelector),
				this.store.select(experimentalFeaturesEnabledSelector),
				this.store.select(layoutAlgorithmSelector)
			]).pipe(
				tap(
					([
						hideFlatBuildings,
						isWhiteBackground,
						resetCameraIfNewFileIsLoaded,
						maxTreeMapFiles,
						sharpnessMode,
						screenshotToClipboardEnabled,
						experimentalFeaturesEnabled,
						layoutAlgorithm
					]) => {
						GlobalSettingsHelper.setGlobalSettingsInLocalStorage({
							hideFlatBuildings,
							isWhiteBackground,
							resetCameraIfNewFileIsLoaded,
							experimentalFeaturesEnabled,
							screenshotToClipboardEnabled,
							layoutAlgorithm,
							maxTreeMapFiles,
							sharpnessMode
						})
					}
				)
			),
		{ dispatch: false }
	)
}
