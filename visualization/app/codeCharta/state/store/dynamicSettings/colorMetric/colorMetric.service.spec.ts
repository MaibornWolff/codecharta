import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ColorMetricService } from "./colorMetric.service"
import { ColorMetricAction, ColorMetricActions } from "./colorMetric.actions"

describe("ColorMetricService", () => {
	let colorMetricService: ColorMetricService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		colorMetricService = new ColorMetricService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, colorMetricService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new colorMetric value", () => {
			const action: ColorMetricAction = {
				type: ColorMetricActions.SET_COLOR_METRIC,
				payload: "another_color_metric"
			}
			storeService["store"].dispatch(action)

			colorMetricService.onStoreChanged(ColorMetricActions.SET_COLOR_METRIC)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("color-metric-changed", { colorMetric: "another_color_metric" })
		})

		it("should not notify anything on non-color-metric-events", () => {
			colorMetricService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
