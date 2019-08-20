import { SettingsService } from "../../state/settingsService/settings.service"
import "./rangeSlider.component.scss"
import $ from "jquery"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { MetricService } from "../../state/metric.service"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { FileStateHelper } from "../../util/fileStateHelper"
import { SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"

export class RangeSliderController implements SettingsServiceSubscriber {
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
		private settingsService: SettingsService,
		private fileStateService: FileStateService,
		private metricService: MetricService,
		private $rootScope: IRootScopeService
	) {
		SettingsService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		if (this.metricService.getMetricData()) {
			this.initSliderOptions(settings)
		}

		if (settings.dynamicSettings.colorRange.from && settings.dynamicSettings.colorRange.to) {
			this.updateViewModel(settings)
			this.updateSliderColors(settings)
			this.updateInputFieldWidth(settings)
		}
	}

	private updateViewModel(settings: Settings) {
		this._viewModel.colorRangeFrom = settings.dynamicSettings.colorRange.from
		this._viewModel.colorRangeTo = settings.dynamicSettings.colorRange.to
	}

	public initSliderOptions(settings: Settings = this.settingsService.getSettings()) {
		this.maxMetricValue = this.metricService.getMaxMetricByMetricName(settings.dynamicSettings.colorMetric)

		this._viewModel.sliderOptions = {
			ceil: this.maxMetricValue,
			onChange: this.applySettings.bind(this),
			pushRange: true,
			onToChange: this.onToSliderChange.bind(this),
			onFromChange: this.onFromSliderChange.bind(this),
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
	}

	private updateInputFieldWidth(s: Settings) {
		let fromLength = s.dynamicSettings.colorRange.from.toFixed().toString().length + 1
		let toLength = s.dynamicSettings.colorRange.to.toFixed().toString().length + 1
		let fromWidth = Math.min(Math.max(this.MIN_DIGITS, fromLength), this.MAX_DIGITS) * this.DIGIT_WIDTH
		let toWidth = Math.min(Math.max(this.MIN_DIGITS, toLength), this.MAX_DIGITS) * this.DIGIT_WIDTH

		$("range-slider-component #rangeFromInputField").css("width", fromWidth + "px")
		$("range-slider-component #rangeToInputField").css("width", toWidth + "px")
		$("range-slider-component #colorSlider").css("width", this.FULL_WIDTH_SLIDER - fromWidth - toWidth + "px")
	}

	private updateSliderColors(s: Settings) {
		const rangeFromPercentage = (100 / this.maxMetricValue) * this._viewModel.colorRangeFrom
		let rangeColors = this._viewModel.sliderOptions.disabled ? this.getGreyRangeColors(s) : this.getColoredRangeColors(s)
		this.applyCssColors(rangeColors, rangeFromPercentage)
	}

	private getGreyRangeColors(s: Settings) {
		return {
			left: s.appSettings.mapColors.lightGrey,
			middle: s.appSettings.mapColors.lightGrey,
			right: s.appSettings.mapColors.lightGrey
		}
	}

	private getColoredRangeColors(s: Settings) {
		let mapColorPositive = s.appSettings.whiteColorBuildings ? s.appSettings.mapColors.lightGrey : s.appSettings.mapColors.positive

		let rangeColors = {
			left: s.appSettings.invertColorRange ? s.appSettings.mapColors.negative : mapColorPositive,
			middle: s.appSettings.mapColors.neutral,
			right: s.appSettings.invertColorRange ? mapColorPositive : s.appSettings.mapColors.negative
		}
		return rangeColors
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
