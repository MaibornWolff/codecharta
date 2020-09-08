import "../../state.module"
import { IRootScopeService } from "angular"
import { MetricDataService } from "./metricData.service"
import { EdgeMetricDataService } from "./edgeMetricData/edgeMetricData.service"
import { setEdgeMetricData } from "./edgeMetricData/edgeMetricData.actions"
import { setNodeMetricData } from "./nodeMetricData/nodeMetricData.actions"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { EDGE_METRIC_DATA, METRIC_DATA, VALID_EDGE, withMockedEventMethods } from "../../../util/dataMocks"
import { NodeMetricDataService } from "./nodeMetricData/nodeMetricData.service"
import { StoreService } from "../../store.service"
import { setEdges } from "../fileSettings/edges/edges.actions"

describe("MetricDataService", () => {
	let metricDataService: MetricDataService
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
		metricDataService = new MetricDataService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to EdgeMetricDataService", () => {
			EdgeMetricDataService.subscribe = jest.fn()

			rebuildService()

			expect(EdgeMetricDataService.subscribe).toHaveBeenCalledWith($rootScope, metricDataService)
		})

		it("should subscribe to NodeMetricDataService", () => {
			NodeMetricDataService.subscribe = jest.fn()

			rebuildService()

			expect(NodeMetricDataService.subscribe).toHaveBeenCalledWith($rootScope, metricDataService)
		})
	})

	describe("onEdgeMetricDataChanged", () => {
		it("should notify that metric data is complete if node metric data exists", () => {
			storeService["store"].dispatch(setNodeMetricData(METRIC_DATA))

			metricDataService.onEdgeMetricDataChanged()

			expect($rootScope.$broadcast).toHaveBeenCalledWith(MetricDataService["METRIC_DATA_COMPLETE"])
		})

		it("should not notify if node metric data does not exist", () => {
			storeService["store"].dispatch(setNodeMetricData())

			metricDataService.onEdgeMetricDataChanged()

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onNodeMetricDataChanged", () => {
		it("should notify that metric data is complete if edge metric data exists", () => {
			storeService["store"].dispatch(setEdgeMetricData(EDGE_METRIC_DATA))

			metricDataService.onNodeMetricDataChanged()

			expect($rootScope.$broadcast).toHaveBeenCalledWith(MetricDataService["METRIC_DATA_COMPLETE"])
		})

		it("should not notify if edge metric data does not exist and there are edges in the file", () => {
			storeService["store"].dispatch(setEdges([VALID_EDGE]))
			storeService["store"].dispatch(setEdgeMetricData())

			metricDataService.onNodeMetricDataChanged()

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})

		it("should notify if edges are not available in the files", () => {
			storeService["store"].dispatch(setEdgeMetricData())

			metricDataService.onNodeMetricDataChanged()

			expect($rootScope.$broadcast).toHaveBeenCalled()
		})
	})
})
