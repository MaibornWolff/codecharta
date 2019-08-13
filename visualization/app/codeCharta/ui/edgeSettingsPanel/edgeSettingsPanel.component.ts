import "./edgeSettingsPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"

export class EdgeSettingsPanelController implements SettingsServiceSubscriber {
	private _viewModel: {
		amountOfEdgePreviews: number
		totalAffectedBuildings: number
	} = {
		amountOfEdgePreviews: 1,
		totalAffectedBuildings: 1
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private edgeMetricService: EdgeMetricService,
		private codeMapActionsService: CodeMapActionsService
	) {
		SettingsService.subscribe(this.$rootScope, this)
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
		this.codeMapActionsService.updateEdgePreviews()
	}
}

export const edgeSettingsPanelComponent = {
	selector: "edgeSettingsPanelComponent",
	template: require("./edgeSettingsPanel.component.html"),
	controller: EdgeSettingsPanelController
}
