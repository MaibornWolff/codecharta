import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { EdgeMetricAction, EdgeMetricActions, setEdgeMetric } from "./edgeMetric.actions"
import { EdgeMetricService } from "./edgeMetric.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { EdgeMetricDataService } from "../../../edgeMetricData.service"

describe("EdgeMetricService", () => {
	let edgeMetricService: EdgeMetricService
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
		edgeMetricService = new EdgeMetricService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
		})

		it("should subscribe to EdgeMetricDataService", () => {
			EdgeMetricDataService.subscribe = jest.fn()

			rebuildService()

			expect(EdgeMetricDataService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
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

	describe("onEdgeMetricDataUpdated", () => {
		it("should not reset edgeMetric because current edgeMetric exists in metricData", () => {
			const metricData = [
				{ name: "validEdgeMetric", maxValue: 22, availableInVisibleMaps: true },
				{ name: "None", maxValue: 1, availableInVisibleMaps: true }
			]
			storeService.dispatch(setEdgeMetric("validEdgeMetric"))

			edgeMetricService.onEdgeMetricDataUpdated(metricData)

			expect(storeService.getState().dynamicSettings.edgeMetric).toEqual("validEdgeMetric")
		})
		it("should reset edgeMetric because current edgeMetric does not exists in metricData", () => {
			const metricData = [
				{ name: "someNewMetric", maxValue: 22, availableInVisibleMaps: true },
				{ name: "None", maxValue: 1, availableInVisibleMaps: true }
			]
			storeService.dispatch(setEdgeMetric("invalidEdgeMetric"))

			edgeMetricService.onEdgeMetricDataUpdated(metricData)

			expect(storeService.getState().dynamicSettings.edgeMetric).toEqual("None")
		})
	})
})
