import "./state.module"
import { EdgeMetricService } from "./edgeMetric.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FileStateService } from "./fileState.service"
import { MetricData, BlacklistType } from "../codeCharta.model"
import { FILE_STATES } from "../util/dataMocks"
import { SettingsService } from "./settingsService/settings.service"

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
			SettingsService.subscribeToBlacklist = jest.fn()
		})

		it("should subscribe to FileStateService", () => {
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
		})

		it("should subscribe to Blacklist-Events", () => {
			rebuildService()

			expect(SettingsService.subscribeToBlacklist).toHaveBeenCalledWith($rootScope, edgeMetricService)
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

	describe("onBlacklistChanged", () => {
		const blacklist = [
			{
				path: "/root/big leaf",
				type: BlacklistType.exclude
			},
			{ path: "/root/Parent Leaf/small leaf", type: BlacklistType.hide }
		]

		beforeEach(() => {
			withMockedFileStateService()
		})

		it("should create Edge Metric Data", () => {})

		it("should ignore edges to/from excluded nodes", () => {})

		it("should contain edges from/to hidden nodes")

		it("should notify that edge metric has been updated", () => {
			edgeMetricService.onBlacklistChanged(blacklist)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("edge-metric-data-updated", edgeMetricService["edgeMetricData"])
		})
	})
})
