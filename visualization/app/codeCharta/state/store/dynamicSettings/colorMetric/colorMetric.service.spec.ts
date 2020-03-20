import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ColorMetricService } from "./colorMetric.service"
import { ColorMetricAction, ColorMetricActions, setColorMetric } from "./colorMetric.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { MetricService } from "../../../metric.service"

describe("ColorMetricService", () => {
	let colorMetricService: ColorMetricService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		colorMetricService = new ColorMetricService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, colorMetricService)
		})

		it("should subscribe to MetricService", () => {
			MetricService.subscribe = jest.fn()

			rebuildService()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, colorMetricService)
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

	describe("onMetricDataAdded", () => {
		it("should update colorMetric if current colorMetric is not available", () => {
			const metricData = [
				{ name: "a", maxValue: 1 },
				{ name: "b", maxValue: 2 },
				{ name: "c", maxValue: 2 },
				{ name: "d", maxValue: 2 }
			]

			colorMetricService.onMetricDataAdded(metricData)

			expect(storeService.getState().dynamicSettings.colorMetric).toEqual("c")
		})

		it("should use first available metric, if less than 2 metrics are available", () => {
			const metricData = [{ name: "a", maxValue: 1 }]

			colorMetricService.onMetricDataAdded(metricData)

			expect(storeService.getState().dynamicSettings.colorMetric).toEqual("a")
		})

		it("should not update if current colorMetric is available", () => {
			storeService.dispatch(setColorMetric("mcc"))
			storeService.dispatch = jest.fn()
			const metricData = [{ name: "mcc", maxValue: 1 }, { name: "rloc", maxValue: 2 }]

			colorMetricService.onMetricDataAdded(metricData)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should not update colorMetric, if no metric is available", () => {
			storeService.dispatch = jest.fn()
			const metricData = []

			colorMetricService.onMetricDataAdded(metricData)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})
	})
})
