import { getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CCFile, FileState, FileSelectionState, MetricData } from "../codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"
import { MetricService } from "./metric.service"

describe("MetricService", () => {
	let metricService: MetricService
	let $rootScope: IRootScopeService
	let fileStates: FileState[]
	let files: CCFile[]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		$rootScope = getService<IRootScopeService>("$rootScope")
		files = [TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]
		fileStates = [
			{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.None },
			{ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.None }
		]
	}

	function rebuildService() {
		metricService = new MetricService($rootScope)
		metricService["metricData"] = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = metricService["$rootScope"].$broadcast = jest.fn((event, data) => {})
	}

	describe("onFileSelectionStatesChanged", () => {
		it("should set calculated metrics and trigger METRIC_DATA_CHANGED_EVENT", () => {
			metricService.calculateMetrics = jest.fn((fileStates: FileState[], visibleFileStates: FileState[]) => {
				return []
			})

			metricService.onFileSelectionStatesChanged(fileStates, undefined)

			const result = metricService.getMetricData()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
			expect($rootScope.$broadcast).toHaveBeenCalledTimes(1)
			expect($rootScope.$broadcast).toHaveBeenCalledWith(MetricService["METRIC_DATA_CHANGED_EVENT"], result)
		})
	})

	describe("onImportedFilesChanged", () => {
		it("should ", () => {})
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

	describe("getMaxMetricInAllRevisions", () => {
		it("should return the highest value of a metric found in the leaves of some CCFiles", () => {
			const result = metricService.getMaxMetricInAllRevisions(files, "rloc")
			const expected = 100

			expect(result).toBe(expected)
		})

		it("should return 0 if metric is not found in a leaf of some CCFiles", () => {
			const result = metricService.getMaxMetricInAllRevisions(files, "some metric")
			const expected = 0

			expect(result).toBe(expected)
		})
	})

	describe("calculateMetrics", () => {
		it("should return an empty array if there are no fileStates", () => {
			const result = metricService.calculateMetrics([], [])

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array of metricData sorted by name calculated from fileStats and visibleFileStates", () => {
			const visibleFileStates = [fileStates[0]]
			const result = metricService.calculateMetrics(fileStates, visibleFileStates)
			const expected = [
				{ availableInVisibleMaps: true, maxValue: 1000, name: "functions" },
				{ availableInVisibleMaps: true, maxValue: 100, name: "mcc" },
				{ availableInVisibleMaps: false, maxValue: 20, name: "more" },
				{ availableInVisibleMaps: true, maxValue: 100, name: "rloc" }
			]

			expect(result).toEqual(expected)
		})

		it("should return an array of fileState metrics sorted by name calculated", () => {
			const visibleFileStates = []
			const result = metricService.calculateMetrics(fileStates, visibleFileStates)
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
