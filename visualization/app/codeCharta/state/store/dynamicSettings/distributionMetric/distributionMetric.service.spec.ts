import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { DistributionMetricService } from "./distributionMetric.service"
import { DistributionMetricAction, DistributionMetricActions } from "./distributionMetric.actions"

describe("DistributionMetricService", () => {
	let distributionMetricService: DistributionMetricService
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
		distributionMetricService = new DistributionMetricService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, distributionMetricService)
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
})
