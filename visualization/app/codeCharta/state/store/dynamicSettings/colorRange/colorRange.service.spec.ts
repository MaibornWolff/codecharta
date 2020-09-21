import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ColorRangeService } from "./colorRange.service"
import { ColorRangeAction, ColorRangeActions } from "./colorRange.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { FilesService } from "../../files/files.service"
import { NodeMetricDataService } from "../../metricData/nodeMetricData/nodeMetricData.service"

describe("ColorRangeService", () => {
	let colorRangeService: ColorRangeService
	let storeService: StoreService
	let $rootScope: IRootScopeService
	let nodeMetricDataService: NodeMetricDataService

	beforeEach(() => {
		restartSystem()
		withMockedMetricService()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		nodeMetricDataService = getService<NodeMetricDataService>("nodeMetricDataService")
	}

	function rebuildService() {
		colorRangeService = new ColorRangeService($rootScope, storeService, nodeMetricDataService)
	}

	function withMockedMetricService() {
		nodeMetricDataService.getMaxMetricByMetricName = jest.fn().mockReturnValue(100)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, colorRangeService)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, colorRangeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new colorRange value", () => {
			const action: ColorRangeAction = {
				type: ColorRangeActions.SET_COLOR_RANGE,
				payload: { from: 33, to: 66 }
			}
			storeService["store"].dispatch(action)

			colorRangeService.onStoreChanged(ColorRangeActions.SET_COLOR_RANGE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("color-range-changed", {
				colorRange: { from: 33, to: 66 }
			})
		})

		it("should not notify anything on non-color-range-events", () => {
			colorRangeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should reset the color range", () => {
			colorRangeService.onFilesSelectionChanged()

			expect(storeService.getState().dynamicSettings.colorRange).toEqual({ from: 33.33, to: 66.66 })
		})
	})
})
