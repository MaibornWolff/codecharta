import { GlobalSettings, LayoutAlgorithm, LocalStorageGlobalSettings } from "../codeCharta.model"
import { GLOBAL_SETTINGS } from "./dataMocks"
import packageJson from "../../../package.json"

import { GlobalSettingsHelper } from "./globalSettingsHelper"

describe("globalSettingsHelper", () => {
	beforeEach(() => {
		localStorage.clear()
	})

	describe("setGlobalSettingsInLocalStorage", () => {
		it("should set the globalSetting into the localStorage", () => {
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)
			const localStorageGlobalSettings: LocalStorageGlobalSettings = JSON.parse(
				localStorage.getItem(GlobalSettingsHelper.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT)
			)

			expect(localStorageGlobalSettings.globalSettings.hideFlatBuildings).toBeTruthy()
			expect(localStorageGlobalSettings.globalSettings.isWhiteBackground).toBeTruthy()
			expect(localStorageGlobalSettings.globalSettings.resetCameraIfNewFileIsLoaded).toBeTruthy()
			expect(localStorageGlobalSettings.globalSettings.experimentalFeaturesEnabled).toBeTruthy()
			expect(localStorageGlobalSettings.globalSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
			expect(localStorageGlobalSettings.globalSettings.maxTreeMapFiles).toEqual(50)
		})
		it("have the recent version of CodeCharta Visualization", () => {
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)
			const localStorageGlobalSettings: LocalStorageGlobalSettings = JSON.parse(
				localStorage.getItem(GlobalSettingsHelper.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT)
			)

			expect(localStorageGlobalSettings.version).toEqual(packageJson.version)
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
