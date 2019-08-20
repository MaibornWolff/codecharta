import "./edgeSettingsPanel.component.scss"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { EdgeMetricSubscriber, SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"
import { SettingsService } from "../../state/settingsService/settings.service"

export enum VisualEdgeState {
	Show_All_Buildings = "showAllBuildings",
	Show_Buildings_With_Edges = "showOnlyBuildingsWithEdges",
	Show_All_Buildings_Without_Edges = "showBuildings"
}

export class EdgeSettingsPanelController implements SettingsServiceSubscriber, EdgeMetricSubscriber {
	private _viewModel: {
		amountOfEdgePreviews: number
		totalAffectedBuildings: number
		visualMapEdgeState: VisualEdgeState
	} = {
		amountOfEdgePreviews: 1,
		totalAffectedBuildings: 1,
		visualMapEdgeState: VisualEdgeState.Show_All_Buildings
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private edgeMetricService: EdgeMetricService,
		private codeMapActionsService: CodeMapActionsService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		SettingsService.subscribeToEdgeMetric(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		if (update.appSettings && update.appSettings.amountOfEdgePreviews) {
			this._viewModel.amountOfEdgePreviews = update.appSettings.amountOfEdgePreviews
		}
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.totalAffectedBuildings = this.edgeMetricService.getAmountOfAffectedBuildings(edgeMetric)
	}

	public applySettingsAmountOfEdgePreviews() {
		this.settingsService.updateSettings({ appSettings: { amountOfEdgePreviews: this._viewModel.amountOfEdgePreviews } })
		this.codeMapActionsService.updateEdgePreviews()
	}

	public applyEdgesVisualChange(chosenVisualEdgeState: VisualEdgeState) {
		switch (chosenVisualEdgeState) {
			case VisualEdgeState.Show_All_Buildings:
				this._viewModel.visualMapEdgeState = VisualEdgeState.Show_All_Buildings
				this.codeMapActionsService.updateEdgePreviews()
				this.settingsService.updateSettings({ appSettings: { showOnlyBuildingsWithEdges: false } })
				break
			case VisualEdgeState.Show_Buildings_With_Edges:
				this._viewModel.visualMapEdgeState = VisualEdgeState.Show_Buildings_With_Edges
				this.codeMapActionsService.updateEdgePreviews()
				this.settingsService.updateSettings({ appSettings: { showOnlyBuildingsWithEdges: true } })
				break
			case VisualEdgeState.Show_All_Buildings_Without_Edges:
				this._viewModel.visualMapEdgeState = VisualEdgeState.Show_All_Buildings_Without_Edges
				this.codeMapActionsService.hideAllEdges()
				break
		}
	}
}

export const edgeSettingsPanelComponent = {
	selector: "edgeSettingsPanelComponent",
	template: require("./edgeSettingsPanel.component.html"),
	controller: EdgeSettingsPanelController
}
