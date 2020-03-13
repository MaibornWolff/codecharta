import "./state.module"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { MetricData, AttributeTypeValue, State } from "../codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, withMockedEventMethods, STATE } from "../util/dataMocks"
import { MetricService } from "./metric.service"
import { NodeDecorator } from "../util/nodeDecorator"
import _ from "lodash"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "./store.service"
import { addFile, resetFiles, setSingle } from "./store/files/files.actions"
import { FilesService } from "./store/files/files.service"

describe("MetricService", () => {
	let metricService: MetricService
	let $rootScope: IRootScopeService
	let storeService: StoreService

	let metricData: MetricData[]
	let state: State

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		const deltaA = _.cloneDeep(TEST_DELTA_MAP_A)
		const deltaB = _.cloneDeep(TEST_DELTA_MAP_B)

		NodeDecorator.preDecorateFile(deltaA)
		NodeDecorator.preDecorateFile(deltaB)

		storeService.dispatch(resetFiles())
		storeService.dispatch(addFile(deltaA))
		storeService.dispatch(addFile(deltaB))

		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
		state = _.cloneDeep(STATE)
	}

	function rebuildService() {
		metricService = new MetricService($rootScope, storeService)
		metricService["metricData"] = metricData
	}

	describe("constructor", () => {
		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, metricService)
		})

		it("should subscribe to BlacklistService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildService()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, metricService)
		})
	})

	describe("onFilesSelectionChanged", () => {
		beforeEach(() => {
			metricService["calculateMetrics"] = jest.fn().mockReturnValue(metricData)
		})

		it("should set metricData to new calculated metricData", () => {
			metricService.onFilesSelectionChanged(undefined)

			expect(metricService["metricData"]).toEqual(metricData)
		})

		it("should broadcast a METRIC_DATA_ADDED_EVENT", () => {
			metricService.onFilesSelectionChanged(undefined)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("metric-data-added", metricService.getMetricData())
		})

		it("should add unary metric to metricData", () => {
			metricService.onFilesSelectionChanged(undefined)

			expect(metricService.getMetricData().filter(x => x.name === "unary").length).toBe(1)
		})
	})

	describe("onBlacklistChanged", () => {
		beforeEach(() => {
			metricService["calculateMetrics"] = jest.fn().mockReturnValue(metricData)
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
			const actual = metricService.getAttributeTypeByMetric("rloc", state)

			expect(actual).toBe(AttributeTypeValue.absolute)
		})

		it("should return relative", () => {
			const actual = metricService.getAttributeTypeByMetric("coverage", state)

			expect(actual).toBe(AttributeTypeValue.relative)
		})

		it("should return null", () => {
			const actual = metricService.getAttributeTypeByMetric("notfound", state)

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
		it("should return an empty array if there are no visible fileStates", () => {
			storeService.dispatch(resetFiles())

			const result = metricService["calculateMetrics"]()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array of metricData sorted by name calculated from visibleFileStates", () => {
			storeService.dispatch(setSingle(TEST_DELTA_MAP_A))
			const expected = [
				{ availableInVisibleMaps: true, maxValue: 1000, name: "functions" },
				{ availableInVisibleMaps: true, maxValue: 100, name: "mcc" },
				{ availableInVisibleMaps: true, maxValue: 100, name: "rloc" }
			]

			const result = metricService["calculateMetrics"]()

			expect(result).toEqual(expected)
		})
	})
})
