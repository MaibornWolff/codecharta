import "./state.module"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FileState, FileSelectionState, MetricData, Settings, AttributeTypeValue } from "../codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, SETTINGS } from "../util/dataMocks"
import { MetricService } from "./metric.service"
import { FileStateService } from "./fileState.service"
import { NodeDecorator } from "../util/nodeDecorator"
import { StoreService } from "./store.service"

describe("MetricService", () => {
	let metricService: MetricService
	let $rootScope: IRootScopeService
	let fileStateService: FileStateService

	let fileStates: FileState[]
	let metricData: MetricData[]
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		fileStateService = getService<FileStateService>("fileStateService")

		fileStates = [
			{ file: NodeDecorator.preDecorateFile(TEST_DELTA_MAP_A), selectedAs: FileSelectionState.None },
			{ file: NodeDecorator.preDecorateFile(TEST_DELTA_MAP_B), selectedAs: FileSelectionState.None }
		]
		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildService() {
		metricService = new MetricService($rootScope, fileStateService)
		metricService["metricData"] = metricData
		metricService["fileStates"] = fileStates
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = metricService["$rootScope"].$broadcast = jest.fn((event, data) => {})
	}

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
			StoreService.subscribeToBlacklist = jest.fn()
		})

		it("should subscribe to FileStateService", () => {
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, metricService)
		})

		it("should subscribe to Blacklist-Events", () => {
			rebuildService()

			expect(StoreService.subscribeToBlacklist).toHaveBeenCalledWith($rootScope, metricService)
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		beforeEach(() => {
			metricService["calculateMetrics"] = jest.fn().mockReturnValue(metricData)
		})

		it("should trigger METRIC_DATA_ADDED_EVENT", () => {
			metricService.onFileSelectionStatesChanged(fileStates)

			expect($rootScope.$broadcast).toHaveBeenCalledTimes(1)
			expect($rootScope.$broadcast).toHaveBeenCalledWith(MetricService["METRIC_DATA_ADDED_EVENT"], metricData)
		})
	})

	describe("onBlacklistChanged", () => {
		beforeEach(() => {
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)
			metricService["calculateMetrics"] = jest.fn().mockReturnValue(metricData)
		})

		it("should call calculateMetrics", () => {
			metricService.onBlacklistChanged([])

			expect(metricService["calculateMetrics"]).toHaveBeenCalledWith(fileStates, [], [])
		})

		it("should set metricData to new calculated metricData", () => {
			metricService.onBlacklistChanged([])

			expect(metricService["metricData"]).toEqual(metricData)
		})

		it("should broadcast a METRIC_DATA_ADDED_EVENT", () => {
			metricService.onBlacklistChanged([])

			expect($rootScope.$broadcast).toHaveBeenCalledWith("metric-data-added", metricService.getMetricData())
		})

		it("should add unary metric to metricData", () => {
			metricService.onBlacklistChanged([])

			expect(metricService.getMetricData().filter(x => x.name === "unary").length).toBeGreaterThan(0)
		})
	})

	describe("getAttributeTypeByMetric", () => {
		it("should return absolute", () => {
			const actual = metricService.getAttributeTypeByMetric("rloc", settings)

			expect(actual).toBe(AttributeTypeValue.absolute)
		})

		it("should return relative", () => {
			const actual = metricService.getAttributeTypeByMetric("coverage", settings)

			expect(actual).toBe(AttributeTypeValue.relative)
		})

		it("should return null", () => {
			const actual = metricService.getAttributeTypeByMetric("notfound", settings)

			expect(actual).toBeNull()
		})
	})

	describe("getMetrics", () => {
		it("should return an empty array if metricData is empty", () => {
			metricService["metricData"] = []
			const result = metricService.getMetrics()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array of all metric names used in metricData", () => {
			const result = metricService.getMetrics()

			expect(result).toEqual(["rloc", "functions", "mcc"])
			expect(result.length).toBe(3)
		})
	})

	describe("getMaxMetricByMetricName", () => {
		it("should return the possible maxValue of a metric by name", () => {
			const result = metricService.getMaxMetricByMetricName("rloc")
			const expected = 999999

			expect(result).toBe(expected)
		})

		it("should return undefined if metric doesn't exist in metricData", () => {
			const result = metricService.getMaxMetricByMetricName("some metric")

			expect(result).not.toBeDefined()
		})
	})

	describe("calculateMetrics", () => {
		it("should return an empty array if there are no fileStates", () => {
			const result = metricService["calculateMetrics"]([], [], [])

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array of metricData sorted by name calculated from fileStats and visibleFileStates", () => {
			const visibleFileStates = [fileStates[0]]
			const result = metricService["calculateMetrics"](fileStates, visibleFileStates, [])
			const expected = [
				{ availableInVisibleMaps: true, maxValue: 1000, name: "functions" },
				{ availableInVisibleMaps: true, maxValue: 100, name: "mcc" },
				{ availableInVisibleMaps: false, maxValue: 20, name: "more" },
				{ availableInVisibleMaps: true, maxValue: 100, name: "rloc" }
			]

			expect(result).toEqual(expected)
		})

		it("should return an array of fileState metrics sorted by name", () => {
			const visibleFileStates = []
			const result = metricService["calculateMetrics"](fileStates, visibleFileStates, [])
			const expected = [
				{ availableInVisibleMaps: false, maxValue: 1000, name: "functions" },
				{ availableInVisibleMaps: false, maxValue: 100, name: "mcc" },
				{ availableInVisibleMaps: false, maxValue: 20, name: "more" },
				{ availableInVisibleMaps: false, maxValue: 100, name: "rloc" }
			]

			expect(result).toEqual(expected)
		})
	})
})
