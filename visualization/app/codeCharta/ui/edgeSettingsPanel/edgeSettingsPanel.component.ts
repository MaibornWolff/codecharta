import "./edgeSettingsPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService } from "../../state/edgeMetric.service"

export class EdgeSettingsPanelController implements SettingsServiceSubscriber {
	private _viewModel: {
		amountOfEdgePreviews: number
		totalAffectedBuildings: number
	} = {
		amountOfEdgePreviews: 1,
		totalAffectedBuildings: 1
	}

	/* @ngInject */
	constructor($rootScope: IRootScopeService, private settingsService: SettingsService, private edgeMetricService: EdgeMetricService) {
		SettingsService.subscribe($rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		if (update.appSettings && update.appSettings.amountOfEdgePreviews) {
			this._viewModel.amountOfEdgePreviews = update.appSettings.amountOfEdgePreviews
		}
		if (update.dynamicSettings && update.dynamicSettings.edgeMetric) {
			this._viewModel.totalAffectedBuildings = this.edgeMetricService.getAmountOfAffectedBuildings(update.dynamicSettings.edgeMetric)
		}
	}

	public applySettingsAmountOfEdgePreviews() {
		this.settingsService.updateSettings({ appSettings: { amountOfEdgePreviews: this._viewModel.amountOfEdgePreviews } })
	}
}

export const edgeSettingsPanelComponent = {
	selector: "edgeSettingsPanelComponent",
	template: require("./edgeSettingsPanel.component.html"),
	controller: EdgeSettingsPanelController
}
