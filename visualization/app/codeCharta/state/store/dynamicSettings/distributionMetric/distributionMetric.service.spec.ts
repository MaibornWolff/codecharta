import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { DistributionMetricService } from "./distributionMetric.service"
import { DistributionMetricAction, DistributionMetricActions, setDistributionMetric } from "./distributionMetric.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { NodeMetricDataService } from "../../metricData/nodeMetricData/nodeMetricData.service"

describe("DistributionMetricService", () => {
	let distributionMetricService: DistributionMetricService
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
		distributionMetricService = new DistributionMetricService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, distributionMetricService)
		})

		it("should subscribe to NodeMetricDataService", () => {
			NodeMetricDataService.subscribe = jest.fn()

			rebuildService()

			expect(NodeMetricDataService.subscribe).toHaveBeenCalledWith($rootScope, distributionMetricService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new distributionMetric value", () => {
			const action: DistributionMetricAction = {
				type: DistributionMetricActions.SET_DISTRIBUTION_METRIC,
				payload: "another_distribution_metric"
			}
			storeService["store"].dispatch(action)

			distributionMetricService.onStoreChanged(DistributionMetricActions.SET_DISTRIBUTION_METRIC)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("distribution-metric-changed", {
				distributionMetric: "another_distribution_metric"
			})
		})

		it("should not notify anything on non-distribution-metric-events", () => {
			distributionMetricService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onMetricDataAdded", () => {
		it("should update distributionMetric if current distributionMetric is not available", () => {
			const metricData = [
				{ name: "loc", maxValue: 2 },
				{ name: "comment_lines", maxValue: 2 },
				{ name: "blank_lines", maxValue: 2 }
			]

			distributionMetricService.onNodeMetricDataChanged(metricData)

			expect(storeService.getState().dynamicSettings.distributionMetric).toEqual("loc")
		})

		it("should not reset to default if current metric is available", () => {
			storeService.dispatch(setDistributionMetric("mcc"))
			storeService.dispatch = jest.fn()
			const metricData = [
				{ name: "mcc", maxValue: 1 },
				{ name: "rloc", maxValue: 2 }
			]

			distributionMetricService.onNodeMetricDataChanged(metricData)

			expect(storeService.getState().dynamicSettings.distributionMetric).toEqual("mcc")
		})

		it("should not update distributionMetric, if no metric is available", () => {
			storeService.dispatch = jest.fn()
			const metricData = []

			distributionMetricService.onNodeMetricDataChanged(metricData)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})
	})

	describe("reset", () => {
		it("should reset to rloc if available", () => {
			const metricData = [
				{ name: "loc", maxValue: 11 },
				{ name: "rloc", maxValue: 4 },
				{ name: "comment_lines", maxValue: 7 }
			]

			distributionMetricService.reset(metricData)

			expect(storeService.getState().dynamicSettings.distributionMetric).toEqual("rloc")
		})

		it("should reset to the first metric if rloc unavailable", () => {
			const metricData = [
				{ name: "loc", maxValue: 21 },
				{ name: "empty_lines", maxValue: 11 },
				{ name: "comment_lines", maxValue: 7 }
			]

			distributionMetricService.reset(metricData)

			expect(storeService.getState().dynamicSettings.distributionMetric).toEqual("loc")
		})
	})
})
