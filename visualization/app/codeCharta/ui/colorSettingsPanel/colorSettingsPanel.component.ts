import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./colorSettingsPanel.component.scss"
import { FileState, MetricData, RecursivePartial, Settings } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import _ from "lodash"

export class ColorSettingsPanelController implements SettingsServiceSubscriber, FileStateServiceSubscriber, MetricServiceSubscriber {
	private lastColorMetric: string = null
	private lastMaxColorMetricValue: number = null

	private _viewModel: {
		invertColorRange: boolean
		invertDeltaColors: boolean
		whiteColorBuildings: boolean
		isDeltaState: boolean
	} = {
		invertColorRange: null,
		invertDeltaColors: null,
		whiteColorBuildings: null,
		isDeltaState: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private settingsService: SettingsService, private metricService: MetricService) {
		SettingsService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this._viewModel.invertDeltaColors = settings.appSettings.invertDeltaColors
		this._viewModel.whiteColorBuildings = settings.appSettings.whiteColorBuildings
		this._viewModel.invertColorRange = settings.appSettings.invertColorRange

		if (
			(this.lastColorMetric !== settings.dynamicSettings.colorMetric || !this.containsColorRangeValues(settings)) &&
			this.metricService.getMetricData()
		) {
			this.lastColorMetric = settings.dynamicSettings.colorMetric
			const maxMetricValue = this.metricService.getMaxMetricByMetricName(settings.dynamicSettings.colorMetric)
			this.adaptColorRange(settings, maxMetricValue)
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public onMetricDataAdded(metricData: MetricData[]) {
		const newMaxColorMetricValue: number = this.metricService.getMaxMetricByMetricName(
			this.settingsService.getSettings().dynamicSettings.colorMetric
		)
		if (this.lastMaxColorMetricValue !== newMaxColorMetricValue) {
			this.lastMaxColorMetricValue = newMaxColorMetricValue
			this.adaptColorRange(this.settingsService.getSettings(), newMaxColorMetricValue)
		}
	}

	public onMetricDataRemoved() {}

	public invertColorRange() {
		this.settingsService.updateSettings({
			appSettings: {
				invertColorRange: this._viewModel.invertColorRange
			}
		})
	}

	public invertDeltaColors() {
		const positiveDelta = this.settingsService.getSettings().appSettings.mapColors.positiveDelta
		const negativeDelta = this.settingsService.getSettings().appSettings.mapColors.negativeDelta

		this.settingsService.updateSettings({
			appSettings: {
				invertDeltaColors: this._viewModel.invertDeltaColors,
				mapColors: {
					negativeDelta: positiveDelta,
					positiveDelta: negativeDelta
				}
			}
		})
	}

	public applyWhiteColorBuildings() {
		this.settingsService.updateSettings({
			appSettings: {
				whiteColorBuildings: this._viewModel.whiteColorBuildings
			}
		})
	}

	private containsColorRangeValues(settings): boolean {
		return _.values(settings.dynamicSettings.colorRange).every(x => x != null)
	}

	private adaptColorRange(s: Settings, maxMetricValue: number) {
		const firstThird = Math.round((maxMetricValue / 3) * 100) / 100
		const secondThird = Math.round(firstThird * 2 * 100) / 100

		this.settingsService.updateSettings({
			dynamicSettings: {
				colorRange: {
					from: firstThird,
					to: secondThird
				}
			}
		})
	}
}

export const colorSettingsPanelComponent = {
	selector: "colorSettingsPanelComponent",
	template: require("./colorSettingsPanel.component.html"),
	controller: ColorSettingsPanelController
}
