import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { NodeMetricDataService } from "./nodeMetricData.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { BlacklistService } from "../../fileSettings/blacklist/blacklist.service"
import { FilesService } from "../../files/files.service"
import { AttributeTypesService } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { nodeMetricDataSelector } from "../../../selectors/accumulatedData/metricData/nodeMetricData.selector"

const mockedNodeMetricDataSelector = nodeMetricDataSelector as unknown as jest.Mock
jest.mock("../../../selectors/accumulatedData/metricData/nodeMetricData.selector", () => ({
	nodeMetricDataSelector: jest.fn(() => [
		{ name: "rloc", maxValue: 999_999, minValue: 1 },
		{ name: "functions", maxValue: 999_999, minValue: 1 },
		{ name: "mcc", maxValue: 999_999, minValue: 1 }
	])
}))

describe("NodeMetricDataService", () => {
	let nodeMetricDataService: NodeMetricDataService
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
		nodeMetricDataService = new NodeMetricDataService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, nodeMetricDataService)
		})

		it("should subscribe to BlacklistService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildService()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, nodeMetricDataService)
		})

		it("should subscribe to AttributeTypesService", () => {
			AttributeTypesService.subscribe = jest.fn()

			rebuildService()

			expect(AttributeTypesService.subscribe).toHaveBeenCalledWith($rootScope, nodeMetricDataService)
		})
	})

	describe("getMetrics", () => {
		it("should return an empty array if metricData is empty", () => {
			mockedNodeMetricDataSelector.mockImplementationOnce(() => [])
			nodeMetricDataService["updateNodeMetricData"]()

			const result = nodeMetricDataService.getMetrics()

			expect(result).toHaveLength(0)
		})

		it("should return an array of all metric names used in metricData", () => {
			nodeMetricDataService["updateNodeMetricData"]()

			const result = nodeMetricDataService.getMetrics()

			expect(result).toEqual(["rloc", "functions", "mcc"])
		})
	})

	describe("getMaxMetricByMetricName", () => {
		beforeEach(() => {
			nodeMetricDataService["updateNodeMetricData"]()
		})

		it("should return the possible maxValue of a metric by name", () => {
			const result = nodeMetricDataService.getMaxValueOfMetric("rloc")
			const expected = 999_999

			expect(result).toBe(expected)
		})

		it("should return undefined if metric doesn't exist in metricData", () => {
			const result = nodeMetricDataService.getMaxValueOfMetric("some metric")

			expect(result).not.toBeDefined()
		})
	})
})
