import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ColorRangeService } from "./colorRange.service"
import { ColorRangeAction, ColorRangeActions } from "./colorRange.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { MetricService } from "../../../metric.service"
import { FilesService } from "../../files/files.service"

describe("ColorRangeService", () => {
	let colorRangeService: ColorRangeService
	let storeService: StoreService
	let $rootScope: IRootScopeService
	let metricService: MetricService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		metricService = getService<MetricService>("metricService")
	}

	function rebuildService() {
		colorRangeService = new ColorRangeService($rootScope, storeService, metricService)
	}

	function withMockedMetricService() {
		metricService = colorRangeService["metricService"] = jest.fn().mockReturnValue({
			getMaxMetricByMetricName: jest.fn().mockReturnValue(100)
		})()
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

			expect($rootScope.$broadcast).toHaveBeenCalledWith("color-range-changed", { colorRange: { from: 33, to: 66 } })
		})

		it("should not notify anything on non-color-range-events", () => {
			colorRangeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onFilesChanged", () => {
		it("should reset the color range", () => {
			withMockedMetricService()

			colorRangeService.onFilesSelectionChanged(undefined)

			expect(storeService.getState().dynamicSettings.colorRange).toEqual({ from: 33.33, to: 66.66 })
		})
	})
})
