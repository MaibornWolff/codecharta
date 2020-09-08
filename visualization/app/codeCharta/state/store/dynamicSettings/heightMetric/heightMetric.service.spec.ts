import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { HeightMetricAction, HeightMetricActions, setHeightMetric } from "./heightMetric.actions"
import { HeightMetricService } from "./heightMetric.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { NodeMetricDataService } from "../../metricData/nodeMetricData/nodeMetricData.service"

describe("HeightMetricService", () => {
	let heightMetricService: HeightMetricService
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
		heightMetricService = new HeightMetricService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, heightMetricService)
		})

		it("should subscribe to NodeMetricDataService", () => {
			NodeMetricDataService.subscribe = jest.fn()

			rebuildService()

			expect(NodeMetricDataService.subscribe).toHaveBeenCalledWith($rootScope, heightMetricService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new heightMetric value", () => {
			const action: HeightMetricAction = {
				type: HeightMetricActions.SET_HEIGHT_METRIC,
				payload: "another_height_metric"
			}
			storeService["store"].dispatch(action)

			heightMetricService.onStoreChanged(HeightMetricActions.SET_HEIGHT_METRIC)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("height-metric-changed", {
				heightMetric: "another_height_metric"
			})
		})

		it("should not notify anything on non-height-metric-events", () => {
			heightMetricService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onMetricDataAdded", () => {
		it("should update heightMetric if current heightMetric is not available", () => {
			const metricData = [
				{ name: "a", maxValue: 1 },
				{ name: "b", maxValue: 2 },
				{ name: "c", maxValue: 2 },
				{ name: "d", maxValue: 2 }
			]

			heightMetricService.onNodeMetricDataChanged(metricData)

			expect(storeService.getState().dynamicSettings.heightMetric).toEqual("b")
		})

		it("should use first available metric, if less than 3 metrics are available", () => {
			const metricData = [{ name: "a", maxValue: 1 }]

			heightMetricService.onNodeMetricDataChanged(metricData)

			expect(storeService.getState().dynamicSettings.heightMetric).toEqual("a")
		})

		it("should not update if current heightMetric is available", () => {
			storeService.dispatch(setHeightMetric("mcc"))
			storeService.dispatch = jest.fn()
			const metricData = [
				{ name: "mcc", maxValue: 1 },
				{ name: "rloc", maxValue: 2 }
			]

			heightMetricService.onNodeMetricDataChanged(metricData)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should not update heightMetric, if no metric is available", () => {
			storeService.dispatch = jest.fn()
			const metricData = []

			heightMetricService.onNodeMetricDataChanged(metricData)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})
	})
})
