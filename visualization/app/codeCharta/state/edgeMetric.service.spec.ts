import "./state.module"
import { EdgeMetricService } from "./edgeMetric.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FileStateService } from "./fileState.service"
import { SettingsService } from "./settings.service"
import { MetricData, BlacklistItem, BlacklistType, RecursivePartial, Settings } from "../codeCharta.model"
import { FILE_STATES } from "../util/dataMocks"

describe("EdgeMetricService", () => {
	let edgeMetricService: EdgeMetricService
	let $rootScope: IRootScopeService
	let fileStateService: FileStateService

	beforeEach(() => {
		restartSystem()
		rebuildService()
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
		fileStateService.getFileStates = jest.fn().mockReturnValue(FILE_STATES)
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
			SettingsService.subscribe = jest.fn()
		})

		it("should subscribe to FileStateService", () => {
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
		})

		it("should subscribe to SettingsService", () => {
			rebuildService()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
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

			expect(nodePaths).toEqual(["bar", "foo"])
		})
	})

	describe("onFileSelectionChanged", () => {})

	describe("onSettingsChanged", () => {
		let update: RecursivePartial<Settings>

		beforeEach(() => {
			withMockedFileStateService()
			const exclude: BlacklistItem = { path: "/root/big leaf", type: BlacklistType.exclude }
			const hide: BlacklistItem = { path: "/root/Parent Leaf/small leaf", type: BlacklistType.hide }
			update = { fileSettings: { blacklist: [exclude, hide] } }
		})

		it("should create Edge Metric Data", () => {
			edgeMetricService.onSettingsChanged(null, update)

			expect(edgeMetricService["edgeMetricData"].keys()).toContain("pairingRate")
			expect(edgeMetricService["edgeMetricData"].keys()).toContain("avgComits")
		})

		it("should ignore edges to/from excluded nodes", () => {})

		it("should contain edges from/to hidden nodes")
	})
})
