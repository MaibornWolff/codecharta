import "./rangeSlider.component.scss"
import $ from "jquery"
import { ColorRange } from "../../codeCharta.model"
import { MetricService } from "../../state/metric.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { StoreService } from "../../state/store.service"
import { setColorRange, SetColorRangeAction } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import _ from "lodash"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import {
	InvertColorRangeService,
	InvertColorRangeSubscriber
} from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import {
	WhiteColorBuildingsService,
	WhiteColorBuildingsSubscriber
} from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"

export class RangeSliderController
	implements
		ColorMetricSubscriber,
		ColorRangeSubscriber,
		InvertColorRangeSubscriber,
		WhiteColorBuildingsSubscriber,
		FilesSelectionSubscriber,
		BlacklistSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedColorRange: (action: SetColorRangeAction) => void

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
		private $timeout: ITimeoutService,
		private storeService: StoreService,
		private metricService: MetricService,
		private colorRangeService: ColorRangeService
	) {
		ColorMetricService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		InvertColorRangeService.subscribe(this.$rootScope, this)
		WhiteColorBuildingsService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)

		this.applyDebouncedColorRange = _.debounce((action: SetColorRangeAction) => {
			this.storeService.dispatch(action)
		}, RangeSliderController.DEBOUNCE_TIME)
	}

	onBlacklistChanged() {
		if (this.isMaxMetricValueChanged()) {
			this.updateMaxMetricValue()
			this.colorRangeService.reset()
		}
	}

	public onColorMetricChanged(colorMetric: string) {
		this.updateMaxMetricValue()
	}

	public onColorRangeChanged(colorRange: ColorRange) {
		this.updateViewModel(colorRange)

		this.$timeout(() => {
			this.initSliderOptions()
			this.updateSliderColors()
			this.updateInputFieldWidth()
		}, 0)
	}

	public onFilesSelectionChanged(files: FileState[]) {
		this.updateMaxMetricValue()
		this.updateDisabledSliderOption()
	}

	public onInvertColorRangeChanged(invertColorRange: boolean) {
		this.updateSliderColors()
	}

	public onWhiteColorBuildingsChanged(whiteColorBuildings: boolean) {
		this.updateSliderColors()
	}

	public onFromSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.sliderOptions.ceil - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.max(this._viewModel.colorRangeTo, this._viewModel.colorRangeFrom + 1)
		this.applyColorRange()
	}

	public onToSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.colorRangeTo - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.min(this._viewModel.sliderOptions.ceil, Math.max(1, this._viewModel.colorRangeTo))
		this.applyColorRange()
	}

	private updateViewModel(colorRange: ColorRange) {
		this._viewModel.colorRangeFrom = colorRange.from
		this._viewModel.colorRangeTo = colorRange.to
	}

	private updateMaxMetricValue() {
		this._viewModel.sliderOptions.ceil = this.metricService.getMaxMetricByMetricName(
			this.storeService.getState().dynamicSettings.colorMetric
		)
	}

	private isMaxMetricValueChanged() {
		const newMaxValue: number = this.metricService.getMaxMetricByMetricName(this.storeService.getState().dynamicSettings.colorMetric)
		return this._viewModel.sliderOptions.ceil !== newMaxValue
	}

	private initSliderOptions() {
		this._viewModel.sliderOptions = {
			ceil: this.metricService.getMaxMetricByMetricName(this.storeService.getState().dynamicSettings.colorMetric),
			onChange: () => this.applySliderChange(),
			pushRange: true,
			disabled: isDeltaState(this.storeService.getState().files)
		}
	}

	private updateDisabledSliderOption() {
		this._viewModel.sliderOptions.disabled = isDeltaState(this.storeService.getState().files)
	}

	private applySliderChange() {
		this.applyColorRange()
		this.updateSliderColors()
	}

	private applyColorRange() {
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
		const rangeFromPercentage = (100 / this._viewModel.sliderOptions.ceil) * this._viewModel.colorRangeFrom
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
