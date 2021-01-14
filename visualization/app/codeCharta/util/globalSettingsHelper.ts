"use strict"
import {GlobalSettings, LocalStorageGlobalSettings } from "../codeCharta.model"


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

	static getGlobalSettings() {
		const ccLocalStorage: LocalStorageGlobalSettings = JSON.parse(localStorage.getItem(this.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT))
		if (ccLocalStorage) {
			return ccLocalStorage.globalSettings
		}
	}

}
