import "./state.module"
import { EdgeMetricService } from "./edgeMetric.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FileStateService } from "./fileState.service"
import { MetricData, CodeMapNode } from "../codeCharta.model"
import { FILE_STATES, VALID_NODE_WITH_PATH } from "../util/dataMocks"
import { HierarchyNode } from "d3"
import { StoreService } from "./store.service"

describe("EdgeMetricService", () => {
	let edgeMetricService: EdgeMetricService
	let $rootScope: IRootScopeService
	let fileStateService: FileStateService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		fileStateService = getService<FileStateService>("fileStateService")
	}

	function rebuildService() {
		edgeMetricService = new EdgeMetricService($rootScope, fileStateService)
	}

	function withMockedFileStateService() {
		FILE_STATES[0].file.map = VALID_NODE_WITH_PATH
		fileStateService.getFileStates = jest.fn().mockReturnValue(FILE_STATES)
	}

	function withMockedEventMethods() {
		$rootScope.$on = edgeMetricService["$rootScope"].$on = jest.fn()
		$rootScope.$broadcast = edgeMetricService["$rootScope"].$broadcast = jest.fn()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
			StoreService.subscribeToBlacklist = jest.fn()
		})

		it("should subscribe to FileStateService", () => {
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
		})

		it("should subscribe to Blacklist-Events", () => {
			rebuildService()

			expect(StoreService.subscribeToBlacklist).toHaveBeenCalledWith($rootScope, edgeMetricService)
		})
	})

	describe("getMetricNames", () => {
		it("should return metric names", () => {
			const metric_1: MetricData = { name: "pairing_rate" } as MetricData
			const metric_2: MetricData = { name: "average_commits" } as MetricData
			edgeMetricService["edgeMetricData"] = [metric_1, metric_2]

			const metricNames = edgeMetricService.getMetricNames()

			expect(metricNames).toEqual(["pairing_rate", "average_commits"])
		})
	})

	describe("getAmountOfAffectedBuildings", () => {
		beforeEach(() => {
			const filesForPairingRate = new Map()
			filesForPairingRate.set("foo", 2)
			edgeMetricService["nodeEdgeMetricsMap"] = new Map()
			edgeMetricService["nodeEdgeMetricsMap"].set("pairing_rate", filesForPairingRate)
		})

		it("should return 0 if metric is non-existent", () => {
			const affectedNodes = edgeMetricService.getAmountOfAffectedBuildings("bar")

			expect(affectedNodes).toEqual(0)
		})

		it("should return number of affected buildings", () => {
			const affectedNodes = edgeMetricService.getAmountOfAffectedBuildings("pairing_rate")

			expect(affectedNodes).toEqual(1)
		})
	})

	describe("getNodesWithHighestValues", () => {
		beforeEach(() => {
			const filesForPairingRate = new Map()
			filesForPairingRate.set("foo", 2)
			filesForPairingRate.set("bar", 4)
			filesForPairingRate.set("foobar", 1)

			edgeMetricService["nodeEdgeMetricsMap"] = new Map()
			edgeMetricService["nodeEdgeMetricsMap"].set("pairing_rate", filesForPairingRate)
			edgeMetricService["sortNodeEdgeMetricsMap"]()
		})

		it("should return empty if metric is non-existent", () => {
			const nodePaths = edgeMetricService.getNodesWithHighestValue("something", 11)

			expect(nodePaths).toEqual([])
		})

		it("should return the correct nodes", () => {
			const nodePaths = edgeMetricService.getNodesWithHighestValue("pairing_rate", 2)

			expect(nodePaths).toEqual(["foo", "bar"])
		})
	})

	describe("onFileSelectionChanged", () => {
		beforeEach(() => {
			withMockedFileStateService()
		})

		it("should create correct edge Metrics", () => {
			FILE_STATES[0].file.map = VALID_NODE_WITH_PATH

			edgeMetricService.onFileSelectionStatesChanged(FILE_STATES)

			expect(edgeMetricService.getMetricData().map(x => x.name)).toContain("pairingRate")
			expect(edgeMetricService.getMetricData().map(x => x.name)).toContain("otherMetric")
		})

		it("should calculate correct maximum value for edge Metrics", () => {
			FILE_STATES[0].file.map = VALID_NODE_WITH_PATH

			edgeMetricService.onFileSelectionStatesChanged(FILE_STATES)

			expect(edgeMetricService.getMetricData().find(x => x.name === "pairingRate").maxValue).toEqual(2)
			expect(edgeMetricService.getMetricData().find(x => x.name === "otherMetric").maxValue).toEqual(1)
		})

		it("metrics Map should contain correct entries entries", () => {
			FILE_STATES[0].file.map = VALID_NODE_WITH_PATH
			edgeMetricService.onFileSelectionStatesChanged(FILE_STATES)

			const pairingRateMapKeys = edgeMetricService["nodeEdgeMetricsMap"].get("pairingRate").keys()
			expect(pairingRateMapKeys.next().value).toEqual("/root/Parent Leaf/small leaf")
			expect(pairingRateMapKeys.next().value).toEqual("/root/big leaf")
			expect(pairingRateMapKeys.next().value).toEqual("/root/Parent Leaf/other small leaf")
		})

		it("metrics Map should be sorted entries", () => {
			FILE_STATES[0].file.map = VALID_NODE_WITH_PATH
			edgeMetricService.onFileSelectionStatesChanged(FILE_STATES)

			const pairingRateMap = edgeMetricService["nodeEdgeMetricsMap"].get("pairingRate")
			expect(pairingRateMap.get("/root/Parent Leaf/small leaf")).toEqual({ incoming: 2, outgoing: 0 })
			const avgCommitsMap = edgeMetricService["nodeEdgeMetricsMap"].get("avgCommits")
			expect(avgCommitsMap.get("/root/big leaf")).toEqual({ incoming: 0, outgoing: 1 })
		})
	})

	describe("getMetricValuesForNode", () => {
		it("should return Edge Metric counts for node", () => {
			FILE_STATES[0].file.map = VALID_NODE_WITH_PATH
			edgeMetricService.onFileSelectionStatesChanged(FILE_STATES)
			const node = { data: { path: "/root/big leaf" } } as HierarchyNode<CodeMapNode>

			const metricsForNode = edgeMetricService.getMetricValuesForNode(node)
			expect(metricsForNode.get("pairingRate")).toEqual({ incoming: 0, outgoing: 1 })
		})
	})
})
