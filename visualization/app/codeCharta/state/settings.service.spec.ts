import "./state.module"
import { SettingsService } from "./settings.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { DEFAULT_SETTINGS, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"
import { FileSelectionState, FileState, Settings } from "../codeCharta.model"
import { FileStateService } from "./fileState.service"
import { FileStateHelper } from "../util/fileStateHelper"
import { SettingsMerger } from "../util/settingsMerger"
import { LoadingGifService } from "../ui/loadingGif/loadingGif.service"

describe("settingService", () => {
	let settingsService: SettingsService
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let loadingGifService: LoadingGifService

	let settings: Settings
	let fileStates: FileState[]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
		withMockedLoadingGifService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		loadingGifService = getService<LoadingGifService>("loadingGifService")

		settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
		fileStates = [
			{ file: JSON.parse(JSON.stringify(TEST_DELTA_MAP_A)), selectedAs: FileSelectionState.Comparison },
			{ file: JSON.parse(JSON.stringify(TEST_DELTA_MAP_B)), selectedAs: FileSelectionState.Reference }
		]
	}

	function rebuildService() {
		settingsService = new SettingsService($rootScope, $timeout, loadingGifService)
	}

	function withMockedEventMethods() {
		$rootScope.$on = settingsService["$rootScope"].$on = jest.fn()
		$rootScope.$broadcast = settingsService["$rootScope"].$on = jest.fn()
	}

	function withMockedLoadingGifService() {
		loadingGifService = settingsService["loadingGifService"] = jest.fn().mockReturnValue({
			updateLoadingMapFlag: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should set settings to default settings", () => {
			rebuildService()

			expect(settingsService.getSettings()).toEqual(settings)
		})

		it("should subscribe to FileStateService", () => {
			FileStateService.subscribe = jest.fn()

			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, settingsService)
		})
	})

	describe("onFileSelectionStateChanged", () => {
		beforeEach(() => {
			settingsService.updateSettings = jest.fn()
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)
			FileStateHelper.getVisibleFileStates = jest.fn().mockReturnValue(fileStates)
			SettingsMerger.getMergedFileSettings = jest.fn().mockReturnValue(DEFAULT_SETTINGS)
		})

		it("should call updateSettings with newFileSettings", () => {
			settingsService.onFileSelectionStatesChanged(fileStates, undefined)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ fileSettings: DEFAULT_SETTINGS })
		})

		it("should call isPartialState with fileStates", () => {
			settingsService.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.isPartialState).toHaveBeenCalledWith(fileStates)
		})

		it("should call getVisibleFileStates with fileStates", () => {
			settingsService.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
		})

		it("should call getMergedFileStates with visibleFiles and withUpdatedPath", () => {
			settingsService.onFileSelectionStatesChanged(fileStates, undefined)
			const visibleFiles = [fileStates[0].file, fileStates[1].file]

			expect(SettingsMerger.getMergedFileSettings).toHaveBeenCalledWith(visibleFiles, false)
		})
	})

	describe("updateSettings", () => {
		it("should set settings correctly", () => {
			const expected = { ...DEFAULT_SETTINGS, appSettings: { ...DEFAULT_SETTINGS.appSettings, invertHeight: true } }

			settingsService.updateSettings({ appSettings: { invertHeight: true } })

			expect(settingsService.getSettings()).toEqual(expected)
		})

		it("should call updateLoadingMapFlag", () => {
			settingsService.updateSettings({ appSettings: { invertHeight: true } })

			expect(loadingGifService.updateLoadingMapFlag).toHaveBeenCalledWith(true)
		})
	})

	describe("getDefaultSettings", () => {
		it("should match snapshot", () => {
			expect(settingsService.getDefaultSettings()).toMatchSnapshot()
		})
	})

	describe("subscribe", () => {
		it("should setup one event listener", () => {
			SettingsService.subscribe($rootScope, undefined)

			expect($rootScope.$on).toHaveBeenCalledTimes(1)
		})
	})
})
