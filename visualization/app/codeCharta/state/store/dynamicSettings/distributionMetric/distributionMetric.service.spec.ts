import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { DistributionMetricService } from "./distributionMetric.service"
import { DistributionMetricAction, DistributionMetricActions, setDistributionMetric } from "./distributionMetric.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { MetricService } from "../../../metric.service"

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

		it("should subscribe to MetricService", () => {
			MetricService.subscribe = jest.fn()

			rebuildService()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, distributionMetricService)
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
				{ name: "a", maxValue: 1 },
				{ name: "b", maxValue: 2 },
				{ name: "c", maxValue: 2 },
				{ name: "d", maxValue: 2 }
			]

			distributionMetricService.onMetricDataAdded(metricData)

			expect(storeService.getState().dynamicSettings.distributionMetric).toEqual("a")
		})

		it("should not update if current distributionMetric is available", () => {
			storeService.dispatch(setDistributionMetric("mcc"))
			storeService.dispatch = jest.fn()
			const metricData = [
				{ name: "mcc", maxValue: 1 },
				{ name: "rloc", maxValue: 2 }
			]

			distributionMetricService.onMetricDataAdded(metricData)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should not update distributionMetric, if no metric is available", () => {
			storeService.dispatch = jest.fn()
			const metricData = []

			distributionMetricService.onMetricDataAdded(metricData)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})
	})
})
