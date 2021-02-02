'use strict'
import { GlobalSettings, LocalStorageGlobalSettings } from '../codeCharta.model'
import { StoreService } from '../state/store.service'
import { setExperimentalFeaturesEnabled } from '../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions'
import { setHideFlatBuildings } from '../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions'
import { setIsWhiteBackground } from '../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions'
import { setLayoutAlgorithm } from '../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions'
import { setMaxTreeMapFiles } from '../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions'
import { setResetCameraIfNewFileIsLoaded } from '../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions'
import packageJson from '../../../package.json'

export class GlobalSettingsHelper {
	static readonly GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT = 'globalSettings'

	static setGlobalSettingsInLocalStorage(globalSettings: GlobalSettings) {
		const newLocalStorageElement: LocalStorageGlobalSettings = {
			version: packageJson.version,
			globalSettings
		}
		localStorage.setItem(this.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement))
	}

	static setGlobalSettingsOfLocalStorageIfExists(storeService: StoreService) {
		if (GlobalSettingsHelper.getGlobalSettings()) {
			const globalSettings: GlobalSettings = JSON.parse(localStorage.getItem(this.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT))
				.globalSettings
			const { appSettings } = storeService.getState()

			if (appSettings.hideFlatBuildings !== globalSettings.hideFlatBuildings) {
				storeService.dispatch(setHideFlatBuildings(globalSettings.hideFlatBuildings))
			}
			if (appSettings.isWhiteBackground !== globalSettings.isWhiteBackground) {
				storeService.dispatch(setIsWhiteBackground(globalSettings.isWhiteBackground))
			}
			if (appSettings.resetCameraIfNewFileIsLoaded !== globalSettings.resetCameraIfNewFileIsLoaded) {
				storeService.dispatch(setResetCameraIfNewFileIsLoaded(globalSettings.resetCameraIfNewFileIsLoaded))
			}
			if (appSettings.experimentalFeaturesEnabled !== globalSettings.experimentalFeaturesEnabled) {
				storeService.dispatch(setExperimentalFeaturesEnabled(globalSettings.experimentalFeaturesEnabled))
			}
			if (appSettings.layoutAlgorithm !== globalSettings.layoutAlgorithm) {
				storeService.dispatch(setLayoutAlgorithm(globalSettings.layoutAlgorithm))
			}
			if (appSettings.maxTreeMapFiles !== globalSettings.maxTreeMapFiles) {
				storeService.dispatch(setMaxTreeMapFiles(globalSettings.maxTreeMapFiles))
			}
		}
	}

	static getGlobalSettings() {
		let ccLocalStorage: LocalStorageGlobalSettings
		try {
			ccLocalStorage = JSON.parse(localStorage.getItem(this.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT))
		} catch {
			ccLocalStorage = null
		}
		if (ccLocalStorage) {
			return ccLocalStorage.globalSettings
		}
	}
}
