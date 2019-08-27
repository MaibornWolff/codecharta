import "./edgeSettingsPanel.component.scss"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { EdgeMetricSubscriber, SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"
import { SettingsService } from "../../state/settingsService/settings.service"

export class EdgeSettingsPanelController implements SettingsServiceSubscriber, EdgeMetricSubscriber {
	private _viewModel: {
		amountOfEdgePreviews: number
		totalAffectedBuildings: number
		edgeHeight: number
		showOnlyBuildingsWithEdges: boolean
	} = {
		amountOfEdgePreviews: 1,
		totalAffectedBuildings: 1,
		edgeHeight: 4,
		showOnlyBuildingsWithEdges: null
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
		if (update.appSettings) {
			if (update.appSettings.amountOfEdgePreviews !== undefined) {
				this._viewModel.amountOfEdgePreviews = update.appSettings.amountOfEdgePreviews
			}

			if (update.appSettings.edgeHeight !== undefined) {
				this._viewModel.edgeHeight = update.appSettings.edgeHeight
			}

			if (update.appSettings.showOnlyBuildingsWithEdges) {
				this._viewModel.showOnlyBuildingsWithEdges = update.appSettings.showOnlyBuildingsWithEdges
			}

			if (
				update.appSettings.amountOfEdgePreviews !== undefined ||
				update.appSettings.edgeHeight !== undefined ||
				update.appSettings.showOnlyBuildingsWithEdges
			) {
				this.codeMapActionsService.updateEdgePreviews()
			}
		}
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.totalAffectedBuildings = this.edgeMetricService.getAmountOfAffectedBuildings(edgeMetric)
		if (edgeMetric === "None") {
			this._viewModel.amountOfEdgePreviews = 0
		} else {
			this._viewModel.amountOfEdgePreviews = this.settingsService.getDefaultSettings().appSettings.amountOfEdgePreviews
		}
		this.applySettingsAmountOfEdgePreviews()
	}

	public applySettingsAmountOfEdgePreviews() {
		this.settingsService.updateSettings({ appSettings: { amountOfEdgePreviews: this._viewModel.amountOfEdgePreviews } })
	}

	public applySettingsEdgeHeight() {
		this.settingsService.updateSettings({ appSettings: { edgeHeight: this._viewModel.edgeHeight } })
	}

	public applyShowOnlyBuildingsWithEdges() {
		this.settingsService.updateSettings({ appSettings: { showOnlyBuildingsWithEdges: this._viewModel.showOnlyBuildingsWithEdges } })
	}
}

export const edgeSettingsPanelComponent = {
	selector: "edgeSettingsPanelComponent",
	template: require("./edgeSettingsPanel.component.html"),
	controller: EdgeSettingsPanelController
}
