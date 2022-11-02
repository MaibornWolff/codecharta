import { GlobalSettings, LayoutAlgorithm, LocalStorageGlobalSettings, SharpnessMode } from "../codeCharta.model"
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
			expect(localStorageGlobalSettings.globalSettings.sharpnessMode).toEqual(SharpnessMode.Standard)
		})

		it("should not dispatch a global setting from localStorage if the setting is currently the same", () => {
			const mockedStore = { dispatch: jest.fn() }
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)

			GlobalSettingsHelper.setGlobalSettingsOfLocalStorageIfExists(mockedStore, GLOBAL_SETTINGS)

			expect(mockedStore.dispatch).not.toHaveBeenCalled()
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
			expect(result.sharpnessMode).toEqual(SharpnessMode.Standard)
		})

		it("should return nothing if no globalSettings are stored in localStorage", () => {
			const result: GlobalSettings = GlobalSettingsHelper.getGlobalSettings()

			expect(result).toBeUndefined()
		})
	})
})
