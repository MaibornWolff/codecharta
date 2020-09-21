import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { calculateNewEdgeMetricData, EdgeMetricDataAction, EdgeMetricDataActions } from "./edgeMetricData.actions"
import { EdgeMetricDataService } from "./edgeMetricData.service"
import { EDGE_METRIC_DATA, FILE_STATES, VALID_NODE_WITH_PATH, withMockedEventMethods } from "../../../../util/dataMocks"
import { CodeMapNode } from "../../../../codeCharta.model"
import { HierarchyNode } from "d3"
import { FilesService } from "../../files/files.service"
import { BlacklistService } from "../../fileSettings/blacklist/blacklist.service"
import { AttributeTypesService } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { FileState } from "../../../../model/files/files"
import { clone } from "../../../../util/clone"

describe("EdgeMetricDataService", () => {
	let edgeMetricDataService: EdgeMetricDataService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	let files: FileState[]

	beforeEach(() => {
		restartSystem()
		rebuildService()

		storeService.dispatch(calculateNewEdgeMetricData(files, []))

		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		files = clone(FILE_STATES)
		files[0].file.map = clone(VALID_NODE_WITH_PATH)
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

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricDataService)
		})

		it("should subscribe to BlacklistService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildService()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricDataService)
		})

		it("should subscribe to AttributeTypesService", () => {
			AttributeTypesService.subscribe = jest.fn()

			rebuildService()

			expect(AttributeTypesService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricDataService)
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

	describe("getMetricNames", () => {
		it("should return metric names", () => {
			const metricNames = edgeMetricDataService.getMetricNames()

			expect(metricNames).toEqual(["avgCommits", EdgeMetricDataService.NONE_METRIC, "otherMetric", "pairingRate"])
		})
	})

	describe("getAmountOfAffectedBuildings", () => {
		it("should return 0 if metric is non-existent", () => {
			const affectedNodes = edgeMetricDataService.getAmountOfAffectedBuildings("bar")

			expect(affectedNodes).toEqual(0)
		})

		it("should return number of affected buildings", () => {
			const affectedNodes = edgeMetricDataService.getAmountOfAffectedBuildings("pairingRate")

			expect(affectedNodes).toEqual(3)
		})
	})

	describe("getNodesWithHighestValues", () => {
		it("should return empty if metric is non-existent", () => {
			const nodePaths = edgeMetricDataService.getNodesWithHighestValue("something", 11)

			expect(nodePaths).toEqual([])
		})

		it("should return the correct nodes", () => {
			const nodePaths = edgeMetricDataService.getNodesWithHighestValue("pairingRate", 2)

			expect(nodePaths).toEqual(["/root/big leaf", "/root/Parent Leaf/small leaf"])
		})
	})

	describe("getMetricValuesForNode", () => {
		it("should return Edge Metric counts for node", () => {
			const node = { data: { path: "/root/big leaf" } } as HierarchyNode<CodeMapNode>

			const metricsForNode = edgeMetricDataService.getMetricValuesForNode(node)

			expect(metricsForNode.get("pairingRate")).toEqual({ incoming: 0, outgoing: 1 })
		})
	})
})
