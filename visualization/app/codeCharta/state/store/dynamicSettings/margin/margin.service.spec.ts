import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { MarginAction, MarginActions, setMargin } from "./margin.actions"
import { MarginService } from "./margin.service"
import { TEST_FILE_WITH_PATHS, withMockedEventMethods } from "../../../../util/dataMocks"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"
import { AreaMetricService } from "../areaMetric/areaMetric.service"
import { DynamicMarginService } from "../../appSettings/dynamicMargin/dynamicMargin.service"
import { setDynamicMargin } from "../../appSettings/dynamicMargin/dynamicMargin.actions"
import { setAreaMetric } from "../areaMetric/areaMetric.actions"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import _ from "lodash"

describe("MarginService", () => {
	let marginService: MarginService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapPreRenderService: CodeMapPreRenderService

	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")

		map = _.cloneDeep(TEST_FILE_WITH_PATHS.map)
	}

	function rebuildService() {
		marginService = new MarginService($rootScope, storeService, codeMapPreRenderService)
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService = marginService["codeMapPreRenderService"] = jest.fn().mockReturnValue({
			getRenderMap: jest.fn().mockReturnValue(map)
		})()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, marginService)
		})

		it("should subscribe to AreaMetricService", () => {
			AreaMetricService.subscribe = jest.fn()

			rebuildService()

			expect(AreaMetricService.subscribe).toHaveBeenCalledWith($rootScope, marginService)
		})

		it("should subscribe to DynamicMarginService", () => {
			DynamicMarginService.subscribe = jest.fn()

			rebuildService()

			expect(DynamicMarginService.subscribe).toHaveBeenCalledWith($rootScope, marginService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new margin value", () => {
			const action: MarginAction = {
				type: MarginActions.SET_MARGIN,
				payload: 42
			}
			storeService["store"].dispatch(action)

			marginService.onStoreChanged(MarginActions.SET_MARGIN)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("margin-changed", { margin: 42 })
		})

		it("should not notify anything on non-margin-events", () => {
			marginService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("reset", () => {
		beforeEach(() => {
			withMockedCodeMapPreRenderService()
		})

		it("should not call dispatch if dynamicMargin is false", () => {
			storeService.dispatch(setDynamicMargin(false))
			storeService.dispatch = jest.fn()

			marginService.reset()

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should set new calculated margin correctly", () => {
			storeService.dispatch(setDynamicMargin(true))
			storeService.dispatch(setAreaMetric("rloc"))

			marginService.reset()

			expect(storeService.getState().dynamicSettings.margin).toEqual(28)
		})

		it("should call dispatch after setting new margin", () => {
			storeService.dispatch(setDynamicMargin(true))
			storeService.dispatch(setAreaMetric("rloc"))
			storeService.dispatch = jest.fn()

			marginService.reset()

			expect(storeService.dispatch).toHaveBeenCalled()
		})

		it("should not call applySettings if margin and new calculated margin are the same", () => {
			storeService.dispatch(setMargin(28))
			storeService.dispatch(setDynamicMargin(true))
			storeService.dispatch(setAreaMetric("rloc"))
			storeService.dispatch = jest.fn()

			marginService.reset()

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})
	})
})
