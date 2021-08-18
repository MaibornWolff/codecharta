import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SecondaryMetricsAction, SecondaryMetricsActions } from "./secondaryMetrics.actions"
import { SecondaryMetricsService } from "./secondaryMetrics.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("SecondaryMetricsService", () => {
	let secondaryMetricsService: SecondaryMetricsService
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
		secondaryMetricsService = new SecondaryMetricsService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, secondaryMetricsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new secondaryMetrics value", () => {
			const action: SecondaryMetricsAction = {
				type: SecondaryMetricsActions.SET_SECONDARY_METRICS,
				payload: [{ name: "functions", type: "absolute" }]
			}
			storeService["store"].dispatch(action)

			secondaryMetricsService.onStoreChanged(SecondaryMetricsActions.SET_SECONDARY_METRICS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("secondary-metrics-changed", {
				secondaryMetrics: [{ name: "functions", type: "absolute" }]
			})
		})

		it("should not notify anything on non-secondary-metrics-events", () => {
			secondaryMetricsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
