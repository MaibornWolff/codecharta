import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { NodeMetricDataAction, NodeMetricDataActions, setNodeMetricData } from "./nodeMetricData.actions"
import { NodeMetricDataService } from "./nodeMetricData.service"
import { FILE_STATES, METRIC_DATA, STATE, withMockedEventMethods } from "../../../../util/dataMocks"
import { setState } from "../../state.actions"
import { AttributeTypeValue, NodeMetricData } from "../../../../codeCharta.model"
import { BlacklistService } from "../../fileSettings/blacklist/blacklist.service"
import { FilesService } from "../../files/files.service"
import { AttributeTypesService } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { DialogService } from "../../../../ui/dialog/dialog.service"
import { hierarchy } from "d3-hierarchy"
import { clone } from "../../../../util/clone"
import { ERROR_MESSAGES } from "../../../../util/fileValidator"

describe("NodeMetricDataService", () => {
	let nodeMetricDataService: NodeMetricDataService
	let storeService: StoreService
	let $rootScope: IRootScopeService
	let dialogService: DialogService

	const metricData: NodeMetricData[] = [
		{ name: "rloc", maxValue: 999999 },
		{ name: "functions", maxValue: 999999 },
		{ name: "mcc", maxValue: 999999 }
	]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedDialogService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")

		storeService.dispatch(setNodeMetricData(metricData))
	}

	function rebuildService() {
		nodeMetricDataService = new NodeMetricDataService($rootScope, storeService, dialogService)
	}

	function withMockedDialogService() {
		dialogService.showErrorDialog = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, nodeMetricDataService)
		})

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

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new nodeMetricData value", () => {
			const action: NodeMetricDataAction = {
				type: NodeMetricDataActions.SET_NODE_METRIC_DATA,
				payload: METRIC_DATA
			}
			storeService["store"].dispatch(action)

			nodeMetricDataService.onStoreChanged(NodeMetricDataActions.SET_NODE_METRIC_DATA)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("node-metric-data-changed", { nodeMetricData: METRIC_DATA })
		})

		it("should not notify anything on non-node-metric-data-events", () => {
			nodeMetricDataService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should show the error dialog if no metrics were found during metric calculation", () => {
			const fileState = clone(FILE_STATES[0])
			hierarchy(fileState.file.map).each(({ data }) => (data.attributes = {}))

			nodeMetricDataService.onFilesSelectionChanged([fileState])

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(ERROR_MESSAGES.metricDataUnavailable, "Could not load metrics")
		})
	})

	describe("getAttributeTypeByMetric", () => {
		beforeEach(() => {
			storeService.dispatch(setState(STATE))
		})

		it("should return absolute", () => {
			const actual = nodeMetricDataService.getAttributeTypeByMetric("rloc")

			expect(actual).toBe(AttributeTypeValue.absolute)
		})

		it("should return relative", () => {
			const actual = nodeMetricDataService.getAttributeTypeByMetric("coverage")

			expect(actual).toBe(AttributeTypeValue.relative)
		})

		it("should return undefined if attributeType not available", () => {
			const actual = nodeMetricDataService.getAttributeTypeByMetric("notfound")

			expect(actual).toBeUndefined()
		})
	})

	describe("getMetrics", () => {
		it("should return an empty array if metricData is empty", () => {
			storeService.dispatch(setNodeMetricData([]))

			const result = nodeMetricDataService.getMetrics()

			expect(result).toHaveLength(0)
		})

		it("should return an array of all metric names used in metricData", () => {
			const result = nodeMetricDataService.getMetrics()

			expect(result).toEqual(["rloc", "functions", "mcc"])
		})
	})

	describe("getMaxMetricByMetricName", () => {
		it("should return the possible maxValue of a metric by name", () => {
			const result = nodeMetricDataService.getMaxMetricByMetricName("rloc")
			const expected = 999999

			expect(result).toBe(expected)
		})

		it("should return undefined if metric doesn't exist in metricData", () => {
			const result = nodeMetricDataService.getMaxMetricByMetricName("some metric")

			expect(result).not.toBeDefined()
		})
	})
})
