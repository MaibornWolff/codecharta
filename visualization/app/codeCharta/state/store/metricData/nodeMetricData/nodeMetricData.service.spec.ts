import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { NodeMetricDataAction, NodeMetricDataActions } from "./nodeMetricData.actions"
import { NodeMetricDataService } from "./nodeMetricData.service"
import { METRIC_DATA, withMockedEventMethods } from "../../../../util/dataMocks"

describe("NodeMetricDataService", () => {
	let nodeMetricDataService: NodeMetricDataService
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
		nodeMetricDataService = new NodeMetricDataService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, nodeMetricDataService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new nodeMetricData value", () => {
			const action: NodeMetricDataAction = {
				type: NodeMetricDataActions.SET_NODE_METRIC_DATA,
				payload: METRIC_DATA
			}
			storeService["store"].dispatch(action)

			nodeMetricDataService.onStoreChanged(NodeMetricDataActions.SET_NODE_METRIC_DATA)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("node-metric-data-changed", { nodeMetricData: METRIC_DATA })
		})

		it("should not notify anything on non-node-metric-data-events", () => {
			nodeMetricDataService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
