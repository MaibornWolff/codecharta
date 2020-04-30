import "./state.module"
import { EdgeMetricDataService } from "./edgeMetricData.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { MetricData, CodeMapNode } from "../codeCharta.model"
import { FILE_STATES, VALID_NODE_WITH_PATH, withMockedEventMethods } from "../util/dataMocks"
import { HierarchyNode } from "d3"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "./store.service"
import { setFiles } from "./store/files/files.actions"
import { FilesService } from "./store/files/files.service"
import _ from "lodash"
import { FileState } from "../model/files/files"

describe("EdgeMetricDataService", () => {
	let edgeMetricDataService: EdgeMetricDataService
	let $rootScope: IRootScopeService
	let storeService: StoreService

	let files: FileState[]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		files = _.cloneDeep(FILE_STATES)
		FILE_STATES[0].file.map = _.cloneDeep(VALID_NODE_WITH_PATH)
	}

	function rebuildService() {
		edgeMetricDataService = new EdgeMetricDataService($rootScope, storeService)
	}

	describe("constructor", () => {
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
	})

	describe("getMetricNames", () => {
		it("should return metric names", () => {
			const pairingRate: MetricData = { name: "pairing_rate" } as MetricData
			const avgCommits: MetricData = { name: "average_commits" } as MetricData
			edgeMetricDataService["edgeMetricData"] = [pairingRate, avgCommits]

			const metricNames = edgeMetricDataService.getMetricNames()

			expect(metricNames).toEqual(["pairing_rate", "average_commits"])
		})
	})

	describe("getAmountOfAffectedBuildings", () => {
		beforeEach(() => {
			const filesForPairingRate = new Map()
			filesForPairingRate.set("foo", 2)
			edgeMetricDataService["nodeEdgeMetricsMap"] = new Map()
			edgeMetricDataService["nodeEdgeMetricsMap"].set("pairing_rate", filesForPairingRate)
		})

		it("should return 0 if metric is non-existent", () => {
			const affectedNodes = edgeMetricDataService.getAmountOfAffectedBuildings("bar")

			expect(affectedNodes).toEqual(0)
		})

		it("should return number of affected buildings", () => {
			const affectedNodes = edgeMetricDataService.getAmountOfAffectedBuildings("pairing_rate")

			expect(affectedNodes).toEqual(1)
		})
	})

	describe("getNodesWithHighestValues", () => {
		beforeEach(() => {
			const filesForPairingRate = new Map()
			filesForPairingRate.set("foo", 2)
			filesForPairingRate.set("bar", 4)
			filesForPairingRate.set("foobar", 1)

			edgeMetricDataService["nodeEdgeMetricsMap"] = new Map()
			edgeMetricDataService["nodeEdgeMetricsMap"].set("pairing_rate", filesForPairingRate)
			edgeMetricDataService["sortNodeEdgeMetricsMap"]()
		})

		it("should return empty if metric is non-existent", () => {
			const nodePaths = edgeMetricDataService.getNodesWithHighestValue("something", 11)

			expect(nodePaths).toEqual([])
		})

		it("should return the correct nodes", () => {
			const nodePaths = edgeMetricDataService.getNodesWithHighestValue("pairing_rate", 2)

			expect(nodePaths).toEqual(["foo", "bar"])
		})
	})

	describe("onFileSelectionChanged", () => {
		beforeEach(() => {
			storeService.dispatch(setFiles(files))
		})

		it("should create correct edge Metrics", () => {
			edgeMetricDataService.onFilesSelectionChanged(files)

			expect(edgeMetricDataService.getMetricData().map(x => x.name)).toContain("pairingRate")
			expect(edgeMetricDataService.getMetricData().map(x => x.name)).toContain("otherMetric")
		})

		it("should calculate correct maximum value for edge Metrics", () => {
			edgeMetricDataService.onFilesSelectionChanged(files)

			expect(edgeMetricDataService.getMetricData().find(x => x.name === "pairingRate").maxValue).toEqual(2)
			expect(edgeMetricDataService.getMetricData().find(x => x.name === "otherMetric").maxValue).toEqual(1)
		})

		it("metrics Map should contain correct entries entries", () => {
			edgeMetricDataService.onFilesSelectionChanged(files)

			const pairingRateMapKeys = edgeMetricDataService["nodeEdgeMetricsMap"].get("pairingRate").keys()
			expect(pairingRateMapKeys.next().value).toEqual("/root/Parent Leaf/small leaf")
			expect(pairingRateMapKeys.next().value).toEqual("/root/big leaf")
			expect(pairingRateMapKeys.next().value).toEqual("/root/Parent Leaf/other small leaf")
		})

		it("metrics Map should be sorted entries", () => {
			edgeMetricDataService.onFilesSelectionChanged(files)

			const pairingRateMap = edgeMetricDataService["nodeEdgeMetricsMap"].get("pairingRate")
			expect(pairingRateMap.get("/root/Parent Leaf/small leaf")).toEqual({ incoming: 2, outgoing: 0 })
			const avgCommitsMap = edgeMetricDataService["nodeEdgeMetricsMap"].get("avgCommits")
			expect(avgCommitsMap.get("/root/big leaf")).toEqual({ incoming: 0, outgoing: 1 })
		})
	})

	describe("getMetricValuesForNode", () => {
		it("should return Edge Metric counts for node", () => {
			storeService.dispatch(setFiles(files))
			edgeMetricDataService.onFilesSelectionChanged(files)
			const node = { data: { path: "/root/big leaf" } } as HierarchyNode<CodeMapNode>

			const metricsForNode = edgeMetricDataService.getMetricValuesForNode(node)
			expect(metricsForNode.get("pairingRate")).toEqual({ incoming: 0, outgoing: 1 })
		})
	})
})
