import "./edgeChooser.component.scss"
import { MetricData, EdgeMetricCount } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService, EdgeMetricServiceSubscriber } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"

export class EdgeChooserController implements EdgeMetricServiceSubscriber {
	private _viewModel: {
		edgeMetricData: MetricData[]
		edgeMetric: string
		hoveredEdgeValue: EdgeMetricCount
	} = {
		edgeMetricData: [],
		edgeMetric: null,
		hoveredEdgeValue: null
	}

	constructor(
		$rootScope: IRootScopeService,
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService
	) {
		EdgeMetricService.subscribe($rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents($rootScope, this)
	}

	public onEdgeMetricDataUpdated(edgeMetrics: MetricData[]) {
		this._viewModel.edgeMetricData = edgeMetrics

		let edgeMetricNames = edgeMetrics.map(x => x.name)

		if (!edgeMetricNames.includes(this._viewModel.edgeMetric)) {
			this._viewModel.edgeMetric = edgeMetricNames[0]
		}
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data && data.to && data.to.node && data.to.node.edgeAttributes) {
			this._viewModel.hoveredEdgeValue = data.to.node.edgeAttributes[this._viewModel.edgeMetric]
		} else {
			this._viewModel.hoveredEdgeValue = null
		}
	}

	public onEdgeMetricSelected() {
		this.settingsService.updateSettings({ dynamicSettings: { edgeMetric: this._viewModel.edgeMetric } })
		this.codeMapActionsService.updateEdgePreviews()
	}
}

export const edgeChooserComponent = {
	selector: "edgeChooserComponent",
	template: require("./edgeChooser.component.html"),
	controller: EdgeChooserController
}
