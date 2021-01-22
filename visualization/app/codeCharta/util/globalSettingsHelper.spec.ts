import { GlobalSettings, LayoutAlgorithm, LocalStorageGlobalSettings } from "../codeCharta.model"
import { GLOBAL_SETTINGS } from "./dataMocks"

import { GlobalSettingsHelper } from "./globalSettingsHelper"

describe("globalSettingsHelper", () => {
	beforeEach(() => {
		localStorage.clear()
	})

	describe("setGlobalSettingsInLocalStorage", () => {
		it("should set the globalSetting into the localStorage", () => {
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)
			const ccLocalStorage: LocalStorageGlobalSettings = JSON.parse(
				localStorage.getItem(GlobalSettingsHelper.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT)
			)

			expect(ccLocalStorage.globalSettings.hideFlatBuildings).toBeTruthy()
			expect(ccLocalStorage.globalSettings.isWhiteBackground).toBeTruthy()
			expect(ccLocalStorage.globalSettings.resetCameraIfNewFileIsLoaded).toBeTruthy()
			expect(ccLocalStorage.globalSettings.experimentalFeaturesEnabled).toBeTruthy()
			expect(ccLocalStorage.globalSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
			expect(ccLocalStorage.globalSettings.maxTreeMapFiles).toEqual(50)
		})
	})

	describe("getGlobalSettings", () => {
		it("should return the globalSettings from localStorage", () => {
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)

			const result: GlobalSettings = GlobalSettingsHelper.getGlobalSettings()

			expect(result.hideFlatBuildings).toBeTruthy()
			expect(result.isWhiteBackground).toBeTruthy()
			expect(result.resetCameraIfNewFileIsLoaded).toBeTruthy()
			expect(result.experimentalFeaturesEnabled).toBeTruthy()
			expect(result.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
			expect(result.maxTreeMapFiles).toEqual(50)
		})

		it("should return nothing if no globalSettings are stored in localStorage", () => {
			const result: GlobalSettings = GlobalSettingsHelper.getGlobalSettings()

			expect(result).toBeUndefined()
		})
	})
})
