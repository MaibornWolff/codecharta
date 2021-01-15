"use strict"
import {GlobalSettings, LocalStorageGlobalSettings } from "../codeCharta.model"
import { StoreService } from "../state/store.service"
import { setExperimentalFeaturesEnabled } from "../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setHideFlatBuildings } from "../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setIsWhiteBackground } from "../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setLayoutAlgorithm } from "../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setResetCameraIfNewFileIsLoaded } from "../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"


export class GlobalSettingsHelper {
    static readonly GLOBALSETTINGS_LOCAL_STORAGE_VERSION = "1.0.0"
	static readonly GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT = "globalSettings"
	
	static setGlobalSettingsInLocalStorage(globalSettings: GlobalSettings){
            const newLocalStorageElement: LocalStorageGlobalSettings = {
                version: this.GLOBALSETTINGS_LOCAL_STORAGE_VERSION,
                globalSettings
            }
            localStorage.setItem(this.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement))
	}

	static setGlobalSettingsOfLocalStorageIfExists(storeService: StoreService){
		if(GlobalSettingsHelper.getGlobalSettings()){

		const ccLocalStorage: LocalStorageGlobalSettings = JSON.parse(localStorage.getItem(this.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT))
			storeService.dispatch(setLayoutAlgorithm(ccLocalStorage.globalSettings.layoutAlgorithm))
			storeService.dispatch(setIsWhiteBackground(ccLocalStorage.globalSettings.isWhiteBackground))
			storeService.dispatch(setResetCameraIfNewFileIsLoaded(ccLocalStorage.globalSettings.resetCameraIfNewFileIsLoaded))
			storeService.dispatch(setExperimentalFeaturesEnabled(ccLocalStorage.globalSettings.experimentalFeaturesEnabled))
			storeService.dispatch(setHideFlatBuildings(ccLocalStorage.globalSettings.hideFlatBuilding))
			storeService.dispatch(setMaxTreeMapFiles(ccLocalStorage.globalSettings.maxTreeMapFiles))
		}
	}

	static getGlobalSettings() {
		const ccLocalStorage: LocalStorageGlobalSettings = JSON.parse(localStorage.getItem(this.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT))
		if (ccLocalStorage) {
			return ccLocalStorage.globalSettings
		}
	}

}
