import "./state.module"
import { StoreService } from "./store.service"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { BlacklistItem, BlacklistType } from "../model/codeCharta.model"
import { BlacklistAction, BlacklistActions } from "./store/fileSettings/blacklist/blacklist.actions"
import { DEFAULT_STATE, STATE, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"
import { setState } from "./store/state.actions"
import { setDynamicSettings } from "./store/dynamicSettings/dynamicSettings.actions"
import { setMargin } from "./store/dynamicSettings/margin/margin.actions"
import { SettingsMerger } from "../util/settingsMerger"
import { setIsLoadingMap } from "./store/appSettings/isLoadingMap/isLoadingMap.actions"
import { setDynamicMargin } from "./store/appSettings/dynamicMargin/dynamicMargin.actions"
import { FilesService } from "./store/files/files.service"
import { addFile, resetFiles, setDeltaByNames } from "./store/files/files.actions"

describe("StoreService", () => {
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		storeService = new StoreService($rootScope)
	}

	describe("constructor", () => {
		it("should initialize the store", () => {
			rebuildService()

			expect(storeService["store"]).not.toBeNull()
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, storeService)
		})
	})

	describe("onFilesChanged", () => {
		beforeEach(() => {
			SettingsMerger.getMergedFileSettings = jest.fn().mockReturnValue(DEFAULT_STATE)
			storeService.dispatch(resetFiles())
			storeService.dispatch(addFile(TEST_DELTA_MAP_A))
			storeService.dispatch(addFile(TEST_DELTA_MAP_B))
			storeService.dispatch(setDeltaByNames(TEST_DELTA_MAP_B.fileMeta.fileName, TEST_DELTA_MAP_A.fileMeta.fileName))
		})

		it("should update store with default dynamicSettings and newFileSettings", () => {
			storeService.onFilesChanged(storeService.getState().files)

			expect(storeService.getState().dynamicSettings.focusedNodePath).toEqual("")
			expect(storeService.getState().dynamicSettings.searchedNodePaths).toEqual([])
			expect(storeService.getState().dynamicSettings.searchPattern).toEqual("")
			expect(storeService.getState().dynamicSettings.margin).toBeNull()
			expect(storeService.getState().dynamicSettings.colorRange).toEqual({ from: null, to: null })
			expect(storeService.getState().fileSettings).toEqual(DEFAULT_STATE.fileSettings)
		})
	})

	describe("dispatch", () => {
		it("should update the whole state", () => {
			storeService.dispatch(setState(STATE))

			expect(storeService.getState()).toEqual(STATE)
		})

		it("should notify store change and update the store", () => {
			$rootScope.$broadcast = jest.fn()

			const item: BlacklistItem = { type: BlacklistType.exclude, path: "foo/bar" }
			const action: BlacklistAction = { type: BlacklistActions.ADD_BLACKLIST_ITEM, payload: item }

			storeService.dispatch(action)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("store-changed", { actionType: BlacklistActions.ADD_BLACKLIST_ITEM })
			expect(storeService.getState().fileSettings.blacklist).toEqual([item])
		})

		it("should update partial state (all metrics) with setState()", () => {
			const partialState = {
				areaMetric: "another_area_metric",
				heightMetric: "another_height_metric",
				colorMetric: "another_color_metric"
			}

			storeService.dispatch(setState({ dynamicSettings: partialState }))
			const result = storeService.getState()

			expect(result.appSettings).toEqual(DEFAULT_STATE.appSettings)
			expect(result.fileSettings).toEqual(DEFAULT_STATE.fileSettings)
			expect(result.dynamicSettings.areaMetric).toEqual(partialState.areaMetric)
			expect(result.dynamicSettings.heightMetric).toEqual(partialState.heightMetric)
			expect(result.dynamicSettings.colorMetric).toEqual(partialState.colorMetric)
			expect(result.dynamicSettings.margin).toEqual(DEFAULT_STATE.dynamicSettings.margin)
		})

		it("should update partial state (all metrics) with setDynamicSettings()", () => {
			const partialState = {
				areaMetric: "another_area_metric",
				heightMetric: "another_height_metric",
				colorMetric: "another_color_metric"
			}

			storeService.dispatch(setDynamicSettings(partialState))
			const result = storeService.getState()

			expect(result.appSettings).toEqual(DEFAULT_STATE.appSettings)
			expect(result.fileSettings).toEqual(DEFAULT_STATE.fileSettings)
			expect(result.dynamicSettings.areaMetric).toEqual(partialState.areaMetric)
			expect(result.dynamicSettings.heightMetric).toEqual(partialState.heightMetric)
			expect(result.dynamicSettings.colorMetric).toEqual(partialState.colorMetric)
			expect(result.dynamicSettings.margin).toEqual(DEFAULT_STATE.dynamicSettings.margin)
		})

		it("should update a single property", () => {
			storeService.dispatch(setMargin(20))

			expect(storeService.getState().dynamicSettings.margin).toEqual(20)
		})

		it("should reset the state to default", () => {
			storeService.dispatch(setState())
			storeService.dispatch(setState(STATE))

			expect(storeService.getState()).toEqual(STATE)
		})

		it("should show loading map gif when state changes", () => {
			storeService.dispatch(setIsLoadingMap(false))

			storeService.dispatch(setState())

			expect(storeService.getState().appSettings.isLoadingMap).toBeTruthy()
		})

		it("should not set state, if triggered silently", () => {
			storeService.dispatch(setIsLoadingMap(false))

			storeService.dispatch(setDynamicMargin(true), true)

			expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
		})
	})
})
