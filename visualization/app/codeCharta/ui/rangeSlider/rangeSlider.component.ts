import "./rangeSlider.component.scss"
import { ColorRange } from "../../codeCharta.model"
import { IRootScopeService, RzSlider } from "angular"
import { StoreService } from "../../state/store.service"
import debounce from "lodash.debounce"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { MapColorsService, MapColorsSubscriber } from "../../state/store/appSettings/mapColors/mapColors.service"
import { trackEventUsageData } from "../../util/usageDataTracker"

export class RangeSliderController
	implements ColorMetricSubscriber, ColorRangeSubscriber, FilesSelectionSubscriber, BlacklistSubscriber, MapColorsSubscriber
{
	private static DEBOUNCE_TIME = 400

	private DIGIT_WIDTH = 11
	private MIN_DIGITS = 4
	private MAX_DIGITS = 6
	private FULL_WIDTH_SLIDER = 235

	private _viewModel: {
		colorRangeFrom: number
		colorRangeTo: number
		sliderOptions: RzSlider.RzOptions
	} = {
		colorRangeFrom: null,
		colorRangeTo: null,
		sliderOptions: { disabled: false }
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService,
		private colorRangeService: ColorRangeService
	) {
		"ngInject"
		ColorMetricService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		MapColorsService.subscribe(this.$rootScope, this)
		this.applyColorRange()
	}

	onMapColorsChanged() {
		this.updateSliderColors()
	}

	onBlacklistChanged() {
		if (this.isMaxMetricValueChanged()) {
			this.updateMaxMetricValue()
			this.colorRangeService.reset()
		}
	}

	onColorMetricChanged() {
		this.updateMaxMetricValue()
	}

	onColorRangeChanged(colorRange: ColorRange) {
		this.updateViewModel(colorRange)
		this.initSliderOptions()
		this.updateSliderColors()
		this.updateInputFieldWidth()
	}

	onFilesSelectionChanged() {
		this.updateMaxMetricValue()
		this.updateDisabledSliderOption()
	}

	onFromSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.sliderOptions.ceil - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.max(this._viewModel.colorRangeTo, this._viewModel.colorRangeFrom + 1)
		this.applyColorRange()
	}

	onToSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.colorRangeTo - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.min(this._viewModel.sliderOptions.ceil, Math.max(1, this._viewModel.colorRangeTo))
		this.applyColorRange()
	}

	private updateViewModel(colorRange: ColorRange) {
		this._viewModel.colorRangeFrom = colorRange.from
		this._viewModel.colorRangeTo = colorRange.to
	}

	private updateMaxMetricValue() {
		this._viewModel.sliderOptions.ceil = this.nodeMetricDataService.getMaxValueOfMetric(
			this.storeService.getState().dynamicSettings.colorMetric
		)
	}

	private isMaxMetricValueChanged() {
		const newMaxValue = this.nodeMetricDataService.getMaxValueOfMetric(this.storeService.getState().dynamicSettings.colorMetric)
		return this._viewModel.sliderOptions.ceil !== newMaxValue
	}

	private initSliderOptions() {
		this._viewModel.sliderOptions = {
			ceil: this.nodeMetricDataService.getMaxValueOfMetric(this.storeService.getState().dynamicSettings.colorMetric),
			onChange: () => this.applySliderChange(),
			onEnd: (_, modelValue, highValue, pointerType) => this.applySliderUpdateDone(modelValue, highValue, pointerType),
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

	private applyColorRange = debounce(() => {
		this.storeService.dispatch(
			setColorRange({
				to: this._viewModel.colorRangeTo,
				from: this._viewModel.colorRangeFrom,
				min: this._viewModel.sliderOptions.floor,
				max: this._viewModel.sliderOptions.ceil
			})
		)
	}, RangeSliderController.DEBOUNCE_TIME)

	private applySliderUpdateDone(modelValue, highValue, pointerType) {
		if (pointerType === "min") {
			trackEventUsageData("color-range-from-updated", this.storeService.getState().files, {
				colorMetric: this.storeService.getState().dynamicSettings.colorMetric,
				fromValue: modelValue
			})
		} else if (pointerType === "max") {
			trackEventUsageData("color-range-to-updated", this.storeService.getState().files, {
				colorMetric: this.storeService.getState().dynamicSettings.colorMetric,
				toValue: highValue
			})
		}
	}

	private updateInputFieldWidth() {
		const fromLength = this._viewModel.colorRangeFrom.toFixed(0).length + 1
		const toLength = this._viewModel.colorRangeTo.toFixed(0).length + 1
		const fromWidth = Math.min(Math.max(this.MIN_DIGITS, fromLength), this.MAX_DIGITS) * this.DIGIT_WIDTH
		const toWidth = Math.min(Math.max(this.MIN_DIGITS, toLength), this.MAX_DIGITS) * this.DIGIT_WIDTH

		document.getElementById("rangeFromInputField").style.width = `${fromWidth}px`
		document.getElementById("rangeToInputField").style.width = `${toWidth}px`
		document.getElementById("colorSlider").style.width = `${this.FULL_WIDTH_SLIDER - fromWidth - toWidth}px`
	}

	private updateSliderColors() {
		const rangeFromPercentage = (100 / this._viewModel.sliderOptions.ceil) * this._viewModel.colorRangeFrom
		const rangeColors = this._viewModel.sliderOptions.disabled ? this.getGreyRangeColors() : this.getColoredRangeColors()
		this.applyCssColors(rangeColors, rangeFromPercentage)
	}

	private getGreyRangeColors() {
		const { lightGrey } = this.storeService.getState().appSettings.mapColors
		return {
			left: lightGrey,
			middle: lightGrey,
			right: lightGrey
		}
	}

	private getColoredRangeColors() {
		const mapColors = this.storeService.getState().appSettings.mapColors

		return {
			left: mapColors.positive,
			middle: mapColors.neutral,
			right: mapColors.negative
		}
	}

	private applyCssColors(rangeColors, rangeFromPercentage) {
		const slider = document.querySelector("range-slider-component .rzslider")
		const leftSection = <HTMLElement>slider.querySelector(".rz-bar-wrapper:nth-child(3) .rz-bar")
		const middleSection = <HTMLElement>slider.querySelector(".rz-selection")
		const rightSection = <HTMLElement>slider.querySelector(".rz-right-out-selection .rz-bar")

		leftSection.style.cssText = `background: ${rangeColors.left} !important; width: ${rangeFromPercentage}%;`
		middleSection.style.cssText = `background: ${rangeColors.middle} !important;`
		rightSection.style.cssText = `background: ${rangeColors.right};`
	}
}

export const rangeSliderComponent = {
	selector: "rangeSliderComponent",
	template: require("./rangeSlider.component.html"),
	controller: RangeSliderController
}
