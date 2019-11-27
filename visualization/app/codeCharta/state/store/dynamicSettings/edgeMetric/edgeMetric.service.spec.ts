import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { EdgeMetricAction, EdgeMetricActions } from "./edgeMetric.actions"
import { EdgeMetricService } from "./edgeMetric.service"

describe("EdgeMetricService", () => {
	let edgeMetricService: EdgeMetricService
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
		edgeMetricService = new EdgeMetricService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new edgeMetric value", () => {
			const action: EdgeMetricAction = {
				type: EdgeMetricActions.SET_EDGE_METRIC,
				payload: "mcc"
			}
			storeService["store"].dispatch(action)

			edgeMetricService.onStoreChanged(EdgeMetricActions.SET_EDGE_METRIC)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("edge-metric-changed", { edgeMetric: "mcc" })
		})

		it("should not notify anything on non-edge-metric-events", () => {
			edgeMetricService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
