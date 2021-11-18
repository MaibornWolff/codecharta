import "./rangeSlider.module"

import { RangeSliderController } from "./rangeSlider.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { MapColors } from "../../codeCharta.model"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { addFile, resetFiles, setDelta, setSingle } from "../../state/store/files/files.actions"
import { FilesService } from "../../state/store/files/files.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"

describe("RangeSliderController", () => {
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let nodeMetricDataService: NodeMetricDataService
	let colorRangeService: ColorRangeService
	let rangeSliderController: RangeSliderController

	let mapColors: MapColors

	function rebuildController() {
		rangeSliderController = new RangeSliderController($rootScope, storeService, nodeMetricDataService, colorRangeService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.rangeSlider")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		nodeMetricDataService = getService<NodeMetricDataService>("nodeMetricDataService")
		colorRangeService = getService<ColorRangeService>("colorRangeService")

		mapColors = storeService.getState().appSettings.mapColors
	}

	beforeEach(() => {
		restartSystem()
		withMockedMetricService()
		rebuildController()
		initFiles()
	})

	function withMockedMetricService() {
		nodeMetricDataService.getMaxValueOfMetric = jest.fn().mockReturnValue(100)
	}

	function initFiles() {
		storeService.dispatch(resetFiles())
		storeService.dispatch(addFile(TEST_DELTA_MAP_A))
		storeService.dispatch(addFile(TEST_DELTA_MAP_B))
		storeService.dispatch(setSingle(TEST_DELTA_MAP_A))
	}

	describe("constructor", () => {
		it("should subscribe to ColorMetricService", () => {
			ColorMetricService.subscribe = jest.fn()

			rebuildController()

			expect(ColorMetricService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})

		it("should subscribe to ColorRangeService", () => {
			ColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(ColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})
	})

	describe("onBlacklistChanged", () => {
		it("should call reset the colorRange", () => {
			rangeSliderController["_viewModel"].sliderOptions.ceil = 19
			colorRangeService.reset = jest.fn()

			rangeSliderController.onBlacklistChanged()

			expect(colorRangeService.reset).toHaveBeenCalled()
		})
		it("should not reset the colorRange if maxValue has not changed", () => {
			rangeSliderController["_viewModel"].sliderOptions.ceil = 100
			colorRangeService.reset = jest.fn()

			rangeSliderController.onBlacklistChanged()

			expect(colorRangeService.reset).not.toHaveBeenCalled()
		})
	})

	describe("onColorMetricChanged", () => {
		it("should set maxMetricValue", () => {
			rangeSliderController["_viewModel"].sliderOptions.ceil = undefined

			rangeSliderController.onColorMetricChanged()

			expect(rangeSliderController["_viewModel"].sliderOptions.ceil).toEqual(100)

			rangeSliderController["_viewModel"].sliderOptions.ceil = 50

			rangeSliderController.onColorMetricChanged()

			expect(rangeSliderController["_viewModel"].sliderOptions.ceil).toEqual(100)
		})
	})

	describe("onColorRangeChanged", () => {
		beforeEach(() => {
			rangeSliderController["applyCssColors"] = jest.fn()
			rangeSliderController["updateInputFieldWidth"] = jest.fn()
		})

		it("should update the viewModel", () => {
			rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

			expect(rangeSliderController["_viewModel"].colorRangeFrom).toBe(10)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toBe(30)
		})

		it("should set grey colors when slider is disabled", () => {
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			rangeSliderController["applyCssColors"] = jest.fn()
			const expected = { left: mapColors.lightGrey, middle: mapColors.lightGrey, right: mapColors.lightGrey }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

			expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
		})

		it("should set standard colors", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			const expected = { left: mapColors.positive, middle: mapColors.neutral, right: mapColors.negative }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

			expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
		})

		describe("updateSliderColors", () => {
			beforeEach(() => {
				rangeSliderController["getColoredRangeColors"] = jest.fn()
				rangeSliderController["getGreyRangeColors"] = jest.fn()
			})

			describe("single state", () => {
				it("should set sliderOptions.disabled to false", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

					expect(rangeSliderController["_viewModel"].sliderOptions.disabled).toBeFalsy()
				})

				it("should set sliders with range colors", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

					expect(rangeSliderController["getColoredRangeColors"]).toHaveBeenCalled()
					expect(rangeSliderController["getGreyRangeColors"]).not.toHaveBeenCalled()
				})
			})

			describe("delta state", () => {
				beforeEach(() => {
					storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))
				})

				it("should set sliderOptions.disabled to true", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

					expect(rangeSliderController["_viewModel"].sliderOptions.disabled).toBeTruthy()
				})

				it("should set sliders with grey colors", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

					expect(rangeSliderController["getColoredRangeColors"]).not.toHaveBeenCalled()
					expect(rangeSliderController["getGreyRangeColors"]).toHaveBeenCalled()
				})
			})
		})

		it("should call updateSliderColors", () => {
			rangeSliderController["updateSliderColors"] = jest.fn()

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30, min: 1, max: 100 })

			expect(rangeSliderController["updateSliderColors"]).toBeCalled()
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should set maxMetricValue", () => {
			rangeSliderController["_viewModel"].sliderOptions.ceil = undefined

			rangeSliderController.onFilesSelectionChanged()

			expect(rangeSliderController["_viewModel"].sliderOptions.ceil).toEqual(100)
		})

		it("should set sliderOptions.disabled", () => {
			rangeSliderController["_viewModel"].sliderOptions.disabled = undefined

			rangeSliderController.onFilesSelectionChanged()

			expect(rangeSliderController["_viewModel"].sliderOptions.disabled).toEqual(false)
		})
	})

	describe("onFromSliderChange", () => {
		it("should update the colorRange values for onFromSliderChange", () => {
			rangeSliderController.onFromSliderChange()

			expect(rangeSliderController["_viewModel"].colorRangeFrom).toEqual(
				Math.min(
					rangeSliderController["_viewModel"].sliderOptions.ceil,
					Math.max(1, rangeSliderController["_viewModel"].colorRangeTo)
				)
			)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toEqual(
				Math.min(rangeSliderController["_viewModel"].colorRangeTo - 1, rangeSliderController["_viewModel"].colorRangeFrom)
			)
		})
	})

	describe("onToSliderChange", () => {
		it("should update the colorRange values for onToSliderChange", () => {
			rangeSliderController.onToSliderChange()

			expect(rangeSliderController["_viewModel"].colorRangeFrom).toEqual(-1)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toEqual(
				Math.min(
					rangeSliderController["_viewModel"].sliderOptions.ceil,
					Math.max(1, rangeSliderController["_viewModel"].colorRangeTo)
				)
			)
		})
	})
})
