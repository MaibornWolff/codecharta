import { SettingsService } from "../../state/settingsService/settings.service"
import "./rangeSlider.component.scss"
import $ from "jquery"
import { ColorRange, MetricData } from "../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { FileStateHelper } from "../../util/fileStateHelper"
import { StoreService } from "../../state/store.service"
import { setColorRange, SetColorRangeAction } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import _ from "lodash"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"

export class RangeSliderController implements ColorMetricSubscriber, ColorRangeSubscriber, MetricServiceSubscriber, ColorMetricSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedColorRange: (action: SetColorRangeAction) => void

	private maxMetricValue: number
	private DIGIT_WIDTH: number = 11
	private MIN_DIGITS: number = 4
	private MAX_DIGITS: number = 6
	private FULL_WIDTH_SLIDER: number = 235

	private _viewModel: {
		colorRangeFrom: number
		colorRangeTo: number
		sliderOptions: any
	} = {
		colorRangeFrom: null,
		colorRangeTo: null,
		sliderOptions: { disabled: false }
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private storeService: StoreService,
		private fileStateService: FileStateService,
		private metricService: MetricService
	) {
		ColorMetricService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)

		this.applyDebouncedColorRange = _.debounce((action: SetColorRangeAction) => {
			this.storeService.dispatch(action)
		}, RangeSliderController.DEBOUNCE_TIME)
	}

	public onColorMetricChanged(colorMetric: string) {
		if (this.metricService.getMetricData()) {
			const colorRange = this.storeService.getState().dynamicSettings.colorRange
			if (colorRange.from === null || colorRange.to === null) {
				this.applyAdaptedColorRange()
			}
			this.setMaxMetricValue()
			this.initSliderOptions()
		}
	}

	public onColorRangeChanged(colorRange: ColorRange) {
		if (colorRange.from === null || colorRange.to === null) {
			this.applyAdaptedColorRange()
		} else {
			this.updateViewModel(colorRange)
			this.updateSliderColors()
			this.updateInputFieldWidth()
		}
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		this.applyAdaptedColorRange()
	}

	public onMetricDataRemoved() {}

	private applyAdaptedColorRange() {
		const firstThird = Math.round((this.maxMetricValue / 3) * 100) / 100
		const secondThird = Math.round(firstThird * 2 * 100) / 100

		this.settingsService.updateSettings({
			dynamicSettings: {
				colorRange: {
					from: firstThird,
					to: secondThird
				}
			}
		})
		this.storeService.dispatch(setColorRange({ from: firstThird, to: secondThird }))
	}

	private updateViewModel(colorRange: ColorRange) {
		this._viewModel.colorRangeFrom = colorRange.from
		this._viewModel.colorRangeTo = colorRange.to
	}

	private setMaxMetricValue() {
		this.maxMetricValue = this.metricService.getMaxMetricByMetricName(this.storeService.getState().dynamicSettings.colorMetric)
	}

	private initSliderOptions() {
		this._viewModel.sliderOptions = {
			ceil: this.maxMetricValue,
			onChange: () => this.applySettings(),
			pushRange: true,
			onToChange: () => this.onToSliderChange(),
			onFromChange: () => this.onFromSliderChange(),
			disabled: FileStateHelper.isDeltaState(this.fileStateService.getFileStates())
		}
	}

	private onFromSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this.maxMetricValue - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.max(this._viewModel.colorRangeTo, this._viewModel.colorRangeFrom + 1)
		this.applySettings()
	}

	private onToSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.colorRangeTo - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.min(this.maxMetricValue, Math.max(1, this._viewModel.colorRangeTo))
		this.applySettings()
	}

	private applySettings() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				colorRange: {
					to: this._viewModel.colorRangeTo,
					from: this._viewModel.colorRangeFrom
				}
			}
		})
		this.applyDebouncedColorRange(
			setColorRange({
				to: this._viewModel.colorRangeTo,
				from: this._viewModel.colorRangeFrom
			})
		)
	}

	private updateInputFieldWidth() {
		const fromLength = this._viewModel.colorRangeFrom.toFixed().toString().length + 1
		const toLength = this._viewModel.colorRangeTo.toFixed().toString().length + 1
		const fromWidth = Math.min(Math.max(this.MIN_DIGITS, fromLength), this.MAX_DIGITS) * this.DIGIT_WIDTH
		const toWidth = Math.min(Math.max(this.MIN_DIGITS, toLength), this.MAX_DIGITS) * this.DIGIT_WIDTH

		$("range-slider-component #rangeFromInputField").css("width", fromWidth + "px")
		$("range-slider-component #rangeToInputField").css("width", toWidth + "px")
		$("range-slider-component #colorSlider").css("width", this.FULL_WIDTH_SLIDER - fromWidth - toWidth + "px")
	}

	private updateSliderColors() {
		const rangeFromPercentage = (100 / this.maxMetricValue) * this._viewModel.colorRangeFrom
		const rangeColors = this._viewModel.sliderOptions.disabled ? this.getGreyRangeColors() : this.getColoredRangeColors()
		this.applyCssColors(rangeColors, rangeFromPercentage)
	}

	private getGreyRangeColors() {
		const lightGrey = this.storeService.getState().appSettings.mapColors.lightGrey
		return {
			left: lightGrey,
			middle: lightGrey,
			right: lightGrey
		}
	}

	private getColoredRangeColors() {
		const appSettings = this.storeService.getState().appSettings
		const mapColorPositive = appSettings.whiteColorBuildings ? appSettings.mapColors.lightGrey : appSettings.mapColors.positive

		return {
			left: appSettings.invertColorRange ? appSettings.mapColors.negative : mapColorPositive,
			middle: appSettings.mapColors.neutral,
			right: appSettings.invertColorRange ? mapColorPositive : appSettings.mapColors.negative
		}
	}

	private applyCssColors(rangeColors, rangeFromPercentage) {
		const slider = $("range-slider-component .rzslider")
		const leftSection = slider.find(".rz-bar-wrapper:nth-child(3) .rz-bar")
		const middleSection = slider.find(".rz-selection")
		const rightSection = slider.find(".rz-right-out-selection .rz-bar")

		leftSection.css("cssText", "background: " + rangeColors.left + " !important; width: " + rangeFromPercentage + "%;")
		middleSection.css("cssText", "background: " + rangeColors.middle + " !important;")
		rightSection.css("cssText", "background: " + rangeColors.right + ";")
	}
}

export const rangeSliderComponent = {
	selector: "rangeSliderComponent",
	template: require("./rangeSlider.component.html"),
	controller: RangeSliderController
}
