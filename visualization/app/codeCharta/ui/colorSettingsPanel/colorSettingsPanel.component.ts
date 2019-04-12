import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./colorSettingsPanel.component.scss"
import { FileState, Settings } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { FileStateHelper } from "../../util/fileStateHelper"

export class ColorSettingsPanelController implements SettingsServiceSubscriber, FileStateServiceSubscriber {
	private lastColorMetric = null

	private _viewModel: {
		neutralColorRangeFlipped: boolean
		deltaColorFlipped: boolean
		whiteColorBuildings: boolean
		isDeltaState: boolean
	} = {
		neutralColorRangeFlipped: null,
		deltaColorFlipped: null,
		whiteColorBuildings: null,
		isDeltaState: null
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private metricService: MetricService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
		this._viewModel.deltaColorFlipped = settings.appSettings.deltaColorFlipped
		this._viewModel.whiteColorBuildings = settings.appSettings.whiteColorBuildings

		if (this.lastColorMetric != settings.dynamicSettings.colorMetric) {
			this.lastColorMetric = settings.dynamicSettings.colorMetric
			this.adaptColorRange(settings)
		} else if (settings.dynamicSettings.neutralColorRange) {
			this._viewModel.neutralColorRangeFlipped = settings.dynamicSettings.neutralColorRange.flipped
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {}

	public applySettings() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				neutralColorRange: {
					flipped: this._viewModel.neutralColorRangeFlipped
				}
			},
			appSettings: {
				deltaColorFlipped: this._viewModel.deltaColorFlipped,
				whiteColorBuildings: this._viewModel.whiteColorBuildings
			}
		})
	}

	private adaptColorRange(s: Settings) {
		const maxMetricValue = this.metricService.getMaxMetricByMetricName(s.dynamicSettings.colorMetric)

		const flipped = s.dynamicSettings.neutralColorRange ? s.dynamicSettings.neutralColorRange.flipped : false
		const firstThird = Math.round((maxMetricValue / 3) * 100) / 100
		const secondThird = Math.round(firstThird * 2 * 100) / 100

		this.settingsService.updateSettings({
			dynamicSettings: {
				neutralColorRange: {
					flipped: flipped,
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
