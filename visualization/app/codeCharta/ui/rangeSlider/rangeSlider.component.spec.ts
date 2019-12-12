import "./rangeSlider.module"

import { RangeSliderController } from "./rangeSlider.component"
import { SettingsService } from "../../state/settingsService/settings.service"
import { MetricService } from "../../state/metric.service"
import { FileStateService } from "../../state/fileState.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { setWhiteColorBuildings } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.actions"
import { setInvertColorRange } from "../../state/store/appSettings/invertColorRange/invertColorRange.actions"
import { MapColors } from "../../codeCharta.model"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"

describe("RangeSliderController", () => {
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService
	let fileStateService: FileStateService
	let metricService: MetricService
	let rangeSliderController: RangeSliderController

	let mapColors: MapColors

	function rebuildController() {
		rangeSliderController = new RangeSliderController($rootScope, settingsService, storeService, fileStateService, metricService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.rangeSlider")

		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
		fileStateService = getService<FileStateService>("fileStateService")
		metricService = getService<MetricService>("metricService")
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedMetricService()

		mapColors = storeService.getState().appSettings.mapColors
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function withMockedMetricService() {
		metricService = rangeSliderController["metricService"] = jest.fn().mockReturnValue({
			getMaxMetricByMetricName: jest.fn().mockReturnValue(100),
			getMetricData: jest.fn().mockReturnValue({})
		})()
	}

	describe("constructor", () => {
		it("should subscribe to Color-Metric-Change", () => {
			ColorMetricService.subscribe = jest.fn()

			rebuildController()

			expect(ColorMetricService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})

		it("should subscribe to Color-Range-Change", () => {
			ColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(ColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})
	})

	describe("onSettingsChanged", () => {
		it("should init the slider options when metric data is available", () => {
			const expected = {
				ceil: 100,
				onChange: () => rangeSliderController["applySettings"],
				pushRange: true,
				onToChange: () => rangeSliderController["onToSliderChange"],
				onFromChange: () => rangeSliderController["onFromSliderChange"],
				disabled: false
			}

			rangeSliderController.onColorMetricChanged("mcc")

			expect(JSON.stringify(rangeSliderController["_viewModel"].sliderOptions)).toEqual(JSON.stringify(expected))
		})
	})

	describe("onMetricDataAdded", () => {
		it("should adapt colorRange", () => {
			settingsService.updateSettings = jest.fn()
			rangeSliderController["maxMetricValue"] = 100

			rangeSliderController.onMetricDataAdded([])

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: {
					colorRange: {
						from: 33.33,
						to: 66.66
					}
				}
			})
			expect(storeService.getState().dynamicSettings.colorRange).toEqual({ from: 33.33, to: 66.66 })
		})
	})

	describe("onColorRangeChanged", () => {
		beforeEach(() => {
			rangeSliderController["maxMetricValue"] = 100
		})

		it("should update the viewModel", () => {
			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			expect(rangeSliderController["_viewModel"].colorRangeFrom).toBe(10)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toBe(30)
		})

		it("should set grey colors when slider is disabled", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			rangeSliderController["_viewModel"].sliderOptions.disabled = true
			const expected = { left: mapColors.lightGrey, middle: mapColors.lightGrey, right: mapColors.lightGrey }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
		})

		it("should set standard colors", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			const expected = { left: mapColors.positive, middle: mapColors.neutral, right: mapColors.negative }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
		})

		it("should set grey positive color when positive buildings are white", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			storeService.dispatch(setWhiteColorBuildings(true))
			const expected = { left: mapColors.lightGrey, middle: mapColors.neutral, right: mapColors.negative }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
		})

		it("should set inverted color slider", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			storeService.dispatch(setInvertColorRange(true))
			const expected = { left: mapColors.negative, middle: mapColors.neutral, right: mapColors.positive }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
		})

		it("should set adapted ColorRange in thirds for given metricValues", () => {
			settingsService.updateSettings = jest.fn()

			rangeSliderController.onColorMetricChanged("rloc")

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: { colorRange: { from: 33.33, to: 66.66 } }
			})
			expect(storeService.getState().dynamicSettings.colorRange).toEqual({ from: 33.33, to: 66.66 })
		})
	})
})
