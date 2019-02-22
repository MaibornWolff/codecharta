import { SettingsService, SettingsServiceSubscriber } from "../../core/settings/settings.service"
import "./rangeSlider.component.scss"
import { MapColors } from "../codeMap/rendering/renderSettings"
import $ from "jquery"
import { Settings, RenderMode, RecursivePartial } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { MetricCalculator } from "../../MetricCalculator";

export class RangeSliderController implements SettingsServiceSubscriber {
	public sliderOptions: any
	private maxMetricValue: number

	/* @ngInject */
	constructor(private settingsService: SettingsService, private codeChartaService: CodeChartaService, $timeout, $scope) {
		SettingsService.subscribe($scope, this)
		this.initSliderOptions()

		$timeout(() => {
			$scope.$broadcast("rzSliderForceRender")
		})
	}

	public onSettingsChanged(settings: Settings) {
		// TODO circle ?
		this.initSliderOptions(settings)
		this.updateSliderColors()
	}

	public initSliderOptions(settings: Settings = this.settingsService.settings) {
		this.maxMetricValue = MetricCalculator.getMaxMetricInAllRevisions(
			this.codeChartaService.getImportedFiles(),
			settings.dynamicSettings.colorMetric
		)

		this.sliderOptions = {
			ceil: this.maxMetricValue,
			onChange: this.onSliderChange.bind(this),
			pushRange: true,
			onToChange: this.onToSliderChange.bind(this),
			onFromChange: this.onFromSliderChange.bind(this),
			disabled: this.settingsService.settings.dynamicSettings.renderMode == RenderMode.Delta
		}
	}

	private onToSliderChange() {
		const update: RecursivePartial<Settings> = {
			appSettings: {
				neutralColorRange: {
					to: Math.min(
						MetricCalculator.getMaxMetricInAllRevisions(
							this.codeChartaService.getImportedFiles(),
							this.settingsService.settings.dynamicSettings.colorMetric
						),
						Math.max(1, this.settingsService.getSettings().appSettings.neutralColorRange.to)
					),
					from: Math.min(
						this.settingsService.settings.appSettings.neutralColorRange.to - 1,
						this.settingsService.settings.appSettings.neutralColorRange.from
					)
				}
			}
		}

		this.settingsService.updateSettings(update)
	}

	private onFromSliderChange() {
		const update: RecursivePartial<Settings> = {
			appSettings: {
				neutralColorRange: {
					to: Math.max(
						this.settingsService.settings.appSettings.neutralColorRange.to,
						this.settingsService.settings.appSettings.neutralColorRange.from + 1
					),
					from: Math.min(
						MetricCalculator.getMaxMetricInAllRevisions(
							this.codeChartaService.getImportedFiles(),
							this.settingsService.settings.dynamicSettings.colorMetric
						) - 1,
						this.settingsService.settings.appSettings.neutralColorRange.from
					)
				}
			}
		}

		this.settingsService.updateSettings(update)
	}

	private onSliderChange() {
		//TODO noch nötig ? this.settingsService.applySettings()
	}

	private updateSliderColors() {
		const rangeFromPercentage = (100 / this.maxMetricValue) * this.settingsService.settings.appSettings.neutralColorRange.from
		let rangeColors = this.sliderOptions.disabled ? this.getGreyRangeColors() : this.getColoredRangeColors()
		this.applyCssSettings(rangeColors, rangeFromPercentage)
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
			left: s.appSettings.neutralColorRange.flipped ? MapColors.negative : mapColorPositive,
			middle: MapColors.neutral,
			right: s.appSettings.neutralColorRange.flipped ? mapColorPositive : MapColors.negative
		}
		return rangeColors
	}

	private applyCssSettings(rangeColors, rangeFromPercentage) {
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
