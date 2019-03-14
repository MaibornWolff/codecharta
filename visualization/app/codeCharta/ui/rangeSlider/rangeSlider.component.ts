import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./rangeSlider.component.scss"
import { MapColors } from "../codeMap/rendering/renderSettings"
import $ from "jquery"
import {Settings, RecursivePartial, FileSelectionState} from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { MetricStateService } from "../../state/metricState.service";
import {FileStateService} from "../../state/fileState.service";
import {ITimeoutService} from "angular";
import {FileStateHelper} from "../../util/fileStateHelper";

export class RangeSliderController implements SettingsServiceSubscriber {
	public sliderOptions: any
	private maxMetricValue: number

	private _viewModel = {
		colorRangeFrom: null,
		colorRangeTo: null
	}

	/* @ngInject */
	constructor(
		private settingsService: SettingsService,
		private fileStateService: FileStateService,
		private codeChartaService: CodeChartaService,
		private metricStateService: MetricStateService,
		private $timeout: ITimeoutService,
		private $scope
	) {
		SettingsService.subscribe($scope, this)
		this.initSliderOptions()

		this.$timeout(() => {
			this.$scope.$broadcast("rzSliderForceRender")
		})
	}

	public onSettingsChanged(settings: Settings) {
		// TODO circle ?
		this.initSliderOptions(settings)
		this.updateViewModel(settings)
		this.updateSliderColors()
	}

	private updateViewModel(settings: Settings) {
		if (settings.dynamicSettings.neutralColorRange) {
			this._viewModel.colorRangeFrom = settings.dynamicSettings.neutralColorRange.from
			this._viewModel.colorRangeTo = settings.dynamicSettings.neutralColorRange.to
		}
	}

	public initSliderOptions(settings: Settings = this.settingsService.getSettings()) {
		this.maxMetricValue = this.metricStateService.getMaxMetricByMetricName(settings.dynamicSettings.colorMetric)

		this.sliderOptions = {
			ceil: this.maxMetricValue,
			onChange: this.onSliderChange.bind(this),
			pushRange: true,
			onToChange: this.onToSliderChange.bind(this),
			onFromChange: this.onFromSliderChange.bind(this),
			disabled: FileStateHelper.isDeltaState(this.fileStateService.getFileStates())
		}
	}

	private onToSliderChange() {
		const colorMaxValue = this.metricStateService.getMaxMetricByMetricName(
			this.settingsService.getSettings().dynamicSettings.colorMetric)
		const update: RecursivePartial<Settings> = {
			dynamicSettings: {
				neutralColorRange: {
					to: Math.min(colorMaxValue, Math.max(1, this._viewModel.colorRangeTo)),
					from: Math.min(this._viewModel.colorRangeTo - 1, this._viewModel.colorRangeFrom)
				}
			}
		}

		this.settingsService.updateSettings(update)
	}

	private onFromSliderChange() {
		const colorMaxValue = this.metricStateService.getMaxMetricByMetricName(
			this.settingsService.getSettings().dynamicSettings.colorMetric)
		const update: RecursivePartial<Settings> = {
			dynamicSettings: {
				neutralColorRange: {
					to: Math.max(this._viewModel.colorRangeTo, this._viewModel.colorRangeFrom + 1),
					from: Math.min(colorMaxValue - 1, this._viewModel.colorRangeFrom)
				}
			}
		}

		this.settingsService.updateSettings(update)
	}

	private onSliderChange() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				neutralColorRange: {
					to: this._viewModel.colorRangeTo,
					from: this._viewModel.colorRangeFrom
				}
			}
		})
	}

	private updateSliderColors() {
		const rangeFromPercentage = (100 / this.maxMetricValue) * this._viewModel.colorRangeFrom
		let rangeColors = this.sliderOptions.disabled ? this.getGreyRangeColors() : this.getColoredRangeColors()
		this.applyCssColors(rangeColors, rangeFromPercentage)
	}

	private getGreyRangeColors() {
		return {
			left: MapColors.lightGrey,
			middle: MapColors.lightGrey,
			right: MapColors.lightGrey
		}
	}

	private getColoredRangeColors() {
		const s = this.settingsService.getSettings();
		let mapColorPositive = s.appSettings.whiteColorBuildings ? MapColors.lightGrey : MapColors.positive

		let rangeColors = {
			left: s.dynamicSettings.neutralColorRange.flipped ? MapColors.negative : mapColorPositive,
			middle: MapColors.neutral,
			right: s.dynamicSettings.neutralColorRange.flipped ? mapColorPositive : MapColors.negative
		}
		return rangeColors
	}

	private applyCssColors(rangeColors, rangeFromPercentage) {
		const slider = $("range-slider-component .rzslider")
		const leftSection = slider.find(".rz-bar-wrapper:nth-child(3) .rz-bar")
		const middleSection = slider.find(".rz-selection")
		const rightSection = slider.find(".rz-right-out-selection .rz-bar")

        leftSection.css("cssText", "background: " + rangeColors.left + " !important; width: " + rangeFromPercentage + "%;");
        middleSection.css("cssText", "background: " + rangeColors.middle + " !important;");
        rightSection.css("cssText", "background: " + rangeColors.right + ";");
    }

}

export const rangeSliderComponent = {
	selector: "rangeSliderComponent",
	template: require("./rangeSlider.component.html"),
	controller: RangeSliderController
}
