import "./state.module"
import { StoreService } from "./store.service"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { BlacklistItem, BlacklistType } from "../codeCharta.model"
import { BlacklistAction, BlacklistActions } from "./store/fileSettings/blacklist/blacklist.actions"
import { DEFAULT_STATE, STATE } from "../util/dataMocks"
import { setState } from "./store/state.actions"
import { setDynamicSettings } from "./store/dynamicSettings/dynamicSettings.actions"
import { setMargin } from "./store/dynamicSettings/margin/margin.actions"
import { setCamera } from "./store/appSettings/camera/camera.actions"
import { setIsLoadingMap } from "./store/appSettings/isLoadingMap/isLoadingMap.actions"
import { setIsLoadingFile } from "./store/appSettings/isLoadingFile/isLoadingFile.actions"

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

		it("should dispatch an action silently and not notify subscribers", () => {
			storeService.dispatch(setCamera(), true)

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})

		it("should dispatch an action silently and not show the loading-gif", () => {
			storeService.dispatch(setIsLoadingMap(false))

			storeService.dispatch(setCamera(), true)

			expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
		})

		it("should show not the loading-gif when an action is triggered, that changes the loading-gif state", () => {
			storeService.dispatch(setIsLoadingMap(false))
			storeService.dispatch(setIsLoadingFile(false))

			expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
		})
	})
})
