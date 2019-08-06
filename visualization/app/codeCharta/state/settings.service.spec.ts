import "./state.module"
import { SettingsService } from "./settings.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { DEFAULT_SETTINGS, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"
import { AttributeTypeValue, FileSelectionState, FileState, RecursivePartial, Settings } from "../codeCharta.model"
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
	const SOME_EXTRA_TIME = 400

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

	describe("FileStateServiceSubscriber Methods", () => {
		beforeEach(() => {
			settingsService.updateSettings = jest.fn()
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)
			FileStateHelper.getVisibleFileStates = jest.fn().mockReturnValue(fileStates)
			SettingsMerger.getMergedFileSettings = jest.fn().mockReturnValue(DEFAULT_SETTINGS)
		})

		describe("onFileSelectionStateChanged", () => {
			it("should call updateSettings with newFileSettings", () => {
				settingsService.onFileSelectionStatesChanged(fileStates)

				expect(settingsService.updateSettings).toHaveBeenCalledWith({ fileSettings: DEFAULT_SETTINGS })
			})

			it("should call isPartialState with fileStates", () => {
				settingsService.onFileSelectionStatesChanged(fileStates)

				expect(FileStateHelper.isPartialState).toHaveBeenCalledWith(fileStates)
			})

			it("should call getVisibleFileStates with fileStates", () => {
				settingsService.onFileSelectionStatesChanged(fileStates)

				expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			})

			it("should call getMergedFileStates with visibleFiles and withUpdatedPath", () => {
				settingsService.onFileSelectionStatesChanged(fileStates)
				const visibleFiles = [fileStates[0].file, fileStates[1].file]

				expect(SettingsMerger.getMergedFileSettings).toHaveBeenCalledWith(visibleFiles, false)
			})
		})
	})

	describe("updateSettings", () => {
		it("should set settings correctly", () => {
			const expected = {
				...DEFAULT_SETTINGS,
				appSettings: { ...DEFAULT_SETTINGS.appSettings, invertHeight: true }
			}

			settingsService.updateSettings({ appSettings: { invertHeight: true } })

			expect(settingsService.getSettings()).toEqual(expected)
		})

		it("should call updateLoadingMapFlag", () => {
			settingsService.updateSettings({ appSettings: { invertHeight: true } })

			expect(loadingGifService.updateLoadingMapFlag).toHaveBeenCalledWith(true)
		})

		it("should set attributeTypes", () => {
			const nodeAttributeTypes = [
				{ rloc: AttributeTypeValue.absolute },
				{ mcc: AttributeTypeValue.absolute },
				{ coverage: AttributeTypeValue.relative }
			]

			settingsService.updateSettings({
				fileSettings: {
					attributeTypes: {
						nodes: nodeAttributeTypes
					}
				}
			})

			expect(settingsService.getSettings().fileSettings.attributeTypes.nodes).toEqual(nodeAttributeTypes)
		})

		it("should merge two objects with different root properties", () => {
			settingsService["update"] = { dynamicSettings: { areaMetric: "rloc" } }
			const update = { appSettings: { margin: 2 } } as RecursivePartial<Settings>
			const expected = {
				dynamicSettings: { areaMetric: "rloc" },
				appSettings: { margin: 2 }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects with different non-root properties", () => {
			settingsService["update"] = { dynamicSettings: { areaMetric: "rloc" } }
			const update: RecursivePartial<Settings> = { dynamicSettings: { colorMetric: "mcc" } }
			const expected = {
				dynamicSettings: { areaMetric: "rloc", colorMetric: "mcc" }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects and override one property", () => {
			settingsService["update"] = { dynamicSettings: { areaMetric: "rloc" } }
			const update: RecursivePartial<Settings> = { dynamicSettings: { areaMetric: "mcc" } }
			const expected = {
				dynamicSettings: { areaMetric: "mcc" }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects and override arrays", () => {
			settingsService["update"] = { fileSettings: { blacklist: [] } }
			const update: RecursivePartial<Settings> = { fileSettings: { blacklist: ["entry"] } }
			const expected = {
				fileSettings: { blacklist: ["entry"] }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should merge two objects and override arrays", () => {
			settingsService["update"] = { fileSettings: { blacklist: ["entry"] } }
			const update: RecursivePartial<Settings> = { fileSettings: { blacklist: [] } }
			const expected = {
				fileSettings: { blacklist: [] }
			}

			settingsService.updateSettings(update)

			expect(settingsService["update"]).toEqual(expected)
		})

		it("should reset update after 400ms", done => {
			settingsService["update"] = { fileSettings: { blacklist: ["entry"] } }
			const update: RecursivePartial<Settings> = { fileSettings: { blacklist: [] } }

			settingsService.updateSettings(update)

			setTimeout(() => {
				expect(settingsService["update"]).toEqual({})
				done()
			}, SettingsService["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
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
