import "./state.module"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CCFile, FileState, FileSelectionState, MetricData } from "../codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"
import { MetricService } from "./metric.service"
import { FileStateService } from "./fileState.service"
import { NodeDecorator } from "../util/nodeDecorator"
import { SettingsService } from "./settings.service"

describe("MetricService", () => {
	let metricService: MetricService
	let $rootScope: IRootScopeService
	let fileStateService: FileStateService
	let fileStates: FileState[]
	let files: CCFile[]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		fileStateService = getService<FileStateService>("fileStateService")

		files = [TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]
		fileStates = [
			{ file: NodeDecorator.preDecorateFile(TEST_DELTA_MAP_A), selectedAs: FileSelectionState.None },
			{ file: NodeDecorator.preDecorateFile(TEST_DELTA_MAP_B), selectedAs: FileSelectionState.None }
		]
	}

	function rebuildService() {
		metricService = new MetricService($rootScope, fileStateService)
		metricService["metricData"] = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
		metricService["fileStates"] = fileStates
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = metricService["$rootScope"].$broadcast = jest.fn((event, data) => {})
	}

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
			SettingsService.subscribe = jest.fn()
		})

		it("should subscribe to FileStateService", () => {
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, metricService)
		})

		it("should subscribe to SettingsService", () => {
			rebuildService()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, metricService)
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		beforeEach(() => {
			metricService["calculateMetrics"] = jest.fn().mockReturnValue([])
		})

		it("should set unary metric into metricData", () => {
			metricService.onFileSelectionStatesChanged(fileStates, undefined)

			expect(metricService.getMetrics()).toContain("unary")
			const unary: MetricData = metricService.getMetricData().find(x => x.name == "unary")
			expect(unary.maxValue).toBe(1)
			expect(unary.availableInVisibleMaps).toBe(true)
		})

		it("should trigger METRIC_DATA_ADDED_EVENT", () => {
			const expected = [{ availableInVisibleMaps: true, maxValue: 1, name: "unary" }]

			metricService.onFileSelectionStatesChanged(fileStates, undefined)

			expect($rootScope.$broadcast).toHaveBeenCalledTimes(1)
			expect($rootScope.$broadcast).toHaveBeenCalledWith(MetricService["METRIC_DATA_ADDED_EVENT"], expected)
		})
	})

	describe("onSettingsChanged", () => {
		beforeEach(() => {
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)
			metricService["calculateMetrics"] = jest.fn().mockReturnValue({})
		})

		it("should not call getFileStates when update object is not a blacklist", () => {
			metricService.onSettingsChanged(null, { fileSettings: { blacklist: null } }, null)

			expect(fileStateService.getFileStates).not.toHaveBeenCalled()
		})

		it("should call calculateMetrics", () => {
			metricService.onSettingsChanged(null, { fileSettings: { blacklist: [] } }, null)

			expect(metricService["calculateMetrics"]).toHaveBeenCalledWith(fileStates, [], [])
		})

		it("should set metricData to new calculated metricData", () => {
			metricService.onSettingsChanged(null, { fileSettings: { blacklist: [] } }, null)

			expect(metricService["metricData"]).toEqual({})
		})

		it("should broadcast a METRIC_DATA_ADDED_EVENT", () => {
			metricService.onSettingsChanged(null, { fileSettings: { blacklist: [] } }, null)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("metric-data-added", metricService.getMetricData())
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
