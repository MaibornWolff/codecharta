import "./rangeSlider.module"

import { RangeSliderController } from "./rangeSlider.component"
import { SettingsService } from "../../state/settingsService/settings.service"
import { MetricService } from "../../state/metric.service"
import { FileStateService } from "../../state/fileState.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { Settings } from "../../codeCharta.model"
import { SETTINGS } from "../../util/dataMocks"
import { FileStateHelper } from "../../util/fileStateHelper"

describe("RangeSliderController", () => {
	let settingsService: SettingsService
	let fileStateService: FileStateService
	let metricService: MetricService
	let $rootScope: IRootScopeService
	let rangeSliderController: RangeSliderController

	function rebuildController() {
		rangeSliderController = new RangeSliderController(settingsService, fileStateService, metricService, $rootScope)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.rangeSlider")

		settingsService = getService<SettingsService>("settingsService")
		fileStateService = getService<FileStateService>("fileStateService")
		metricService = getService<MetricService>("metricService")
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("onSettingsChanged", () => {
		it("should only call initSliderOptions when settings.dynamicSettings.colorRange is undefined", () => {
			rangeSliderController.initSliderOptions = jest.fn()
			rangeSliderController["updateViewModel"] = jest.fn()

			const settings = { dynamicSettings: { colorRange: { from: null, to: null } } } as Settings

			rangeSliderController.onSettingsChanged(settings, undefined)

			expect(rangeSliderController.initSliderOptions).toHaveBeenCalledWith(settings)
			expect(rangeSliderController["updateViewModel"]).not.toHaveBeenCalled()
		})

		it("should only call initSliderOptions when settings.dynamicSettings.colorRange is null", () => {
			rangeSliderController.initSliderOptions = jest.fn()
			rangeSliderController["updateViewModel"] = jest.fn()

			const settings = { dynamicSettings: { colorRange: { from: null, to: null } } } as Settings

			rangeSliderController.onSettingsChanged(settings, undefined)

			expect(rangeSliderController.initSliderOptions).toHaveBeenCalledWith(settings)
			expect(rangeSliderController["updateViewModel"]).not.toHaveBeenCalled()
		})

		it("should call initSliderOptions and update the viewModel, set colored range colors and inputfield width", () => {
			rangeSliderController.initSliderOptions = jest.fn()

			rangeSliderController.onSettingsChanged(SETTINGS, undefined)

			expect(rangeSliderController.initSliderOptions).toHaveBeenCalledWith(SETTINGS)
			expect(rangeSliderController["_viewModel"].colorRangeFrom).toBe(SETTINGS.dynamicSettings.colorRange.from)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toBe(SETTINGS.dynamicSettings.colorRange.to)
		})

		it("should call initSliderOptions and update the viewModel, set grey range colors and inputfield width", () => {
			rangeSliderController.initSliderOptions = jest.fn()

			rangeSliderController["_viewModel"].sliderOptions.disabled = true
			rangeSliderController.onSettingsChanged(SETTINGS, undefined)

			expect(rangeSliderController.initSliderOptions).toHaveBeenCalledWith(SETTINGS)
			expect(rangeSliderController["_viewModel"].colorRangeFrom).toBe(SETTINGS.dynamicSettings.colorRange.from)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toBe(SETTINGS.dynamicSettings.colorRange.to)
		})
	})

	describe("initSliderOptions", () => {
		it("should init the slider options correctly", () => {
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(true)

			const expected = { ceil: rangeSliderController["maxMetricValue"], pushRange: true, disabled: true }

			rangeSliderController.initSliderOptions(SETTINGS)

			expect(rangeSliderController["_viewModel"].sliderOptions.ceil).toEqual(expected.ceil)
			expect(rangeSliderController["_viewModel"].sliderOptions.pushRange).toBeTruthy()
			expect(rangeSliderController["_viewModel"].sliderOptions.disabled).toBeTruthy()
			expect(rangeSliderController["_viewModel"].sliderOptions.onChange).not.toBeUndefined()
			expect(rangeSliderController["_viewModel"].sliderOptions.onToChange).not.toBeUndefined()
			expect(rangeSliderController["_viewModel"].sliderOptions.onFromChange).not.toBeUndefined()
		})

		it("should be able to call onFromChange and set the color range correctly", () => {
			settingsService.updateSettings = jest.fn()
			metricService.getMaxMetricByMetricName = jest.fn().mockReturnValue(100)

			rangeSliderController.onSettingsChanged(SETTINGS, undefined)

			rangeSliderController["_viewModel"].sliderOptions.onFromChange()

			expect(rangeSliderController["_viewModel"].colorRangeFrom).toBe(19)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toBe(67)
			expect(metricService.getMaxMetricByMetricName).toBeCalledWith(SETTINGS.dynamicSettings.colorMetric)

			expect(settingsService.updateSettings).toHaveBeenCalled()
		})

		it("should be able to call onToChange and set the color range correctly", () => {
			settingsService.updateSettings = jest.fn()
			metricService.getMaxMetricByMetricName = jest.fn().mockReturnValue(100)

			rangeSliderController.onSettingsChanged(SETTINGS, undefined)

			rangeSliderController["_viewModel"].sliderOptions.onToChange()

			expect(rangeSliderController["_viewModel"].colorRangeFrom).toBe(19)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toBe(67)
			expect(metricService.getMaxMetricByMetricName).toBeCalledWith(SETTINGS.dynamicSettings.colorMetric)

			expect(settingsService.updateSettings).toHaveBeenCalled()
		})
	})
})
