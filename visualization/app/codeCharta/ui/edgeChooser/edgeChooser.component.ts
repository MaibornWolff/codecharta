import "./edgeChooser.component.scss"
import { MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService, EdgeMetricServiceSubscriber } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"

export class EdgeChooserController implements EdgeMetricServiceSubscriber {
	private noMetricsAvailable: string = "No Edge Metrics available"

	private _viewModel: {
		edgeMetricData: MetricData[]
		edgeMetric: string
		hoveredEdgeValue: number
	} = {
		edgeMetricData: [],
		edgeMetric: "None",
		hoveredEdgeValue: null
	}

	constructor(
		$rootScope: IRootScopeService,
		private edgeMetricService: EdgeMetricService,
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService
	) {
		EdgeMetricService.subscribe($rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents($rootScope, this)
	}

	public onEdgeMetricDataUpdated(edgeMetrics: MetricData[]) {
		this._viewModel.edgeMetricData = edgeMetrics
		this._viewModel.edgeMetricData.push({ name: "None", maxValue: 0, availableInVisibleMaps: false })

		let edgeMetricNames = this.edgeMetricService.getMetricNames()

		if (!edgeMetricNames.includes(this._viewModel.edgeMetric)) {
			if (edgeMetricNames.length > 0) {
				this._viewModel.edgeMetric = edgeMetricNames[0]
			} else {
				this._viewModel.edgeMetric = this.noMetricsAvailable
			}
		}
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data && data.to && data.to.node && data.to.node.attributes) {
			//this._viewModel.hoveredEdgeValue = this.edgeMetricService.getMetricValueForNode(data.to.node)

			this._viewModel.hoveredEdgeValue = data.to.node.attributes[this._viewModel.edgeMetric]
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
