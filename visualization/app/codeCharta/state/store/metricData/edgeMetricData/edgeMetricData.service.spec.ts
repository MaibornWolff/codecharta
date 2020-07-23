import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { EdgeMetricDataAction, EdgeMetricDataActions } from "./edgeMetricData.actions"
import { EdgeMetricDataService } from "./edgeMetricData.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("EdgeMetricDataService", () => {
	let edgeMetricDataService: EdgeMetricDataService
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
		edgeMetricDataService = new EdgeMetricDataService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricDataService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new edgeMetricData value", () => {
			const action: EdgeMetricDataAction = {
				type: EdgeMetricDataActions.SET_EDGE_METRIC_DATA,
				payload: EDGE_METRIC_DATA
			}
			storeService["store"].dispatch(action)

			edgeMetricDataService.onStoreChanged(EdgeMetricDataActions.SET_EDGE_METRIC_DATA)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("edge-metric-data-changed", { edgeMetricData: EDGE_METRIC_DATA })
		})

		it("should not notify anything on non-edge-metric-data-events", () => {
			edgeMetricDataService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
