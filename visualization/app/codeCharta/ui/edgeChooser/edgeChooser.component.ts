import "./edgeChooser.component.scss"
import { MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService, EdgeMetricServiceSubscriber } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { SettingsService } from "../../state/settings.service"
import { MetricChooserController } from "../metricChooser/metricChooser.component"

export class EdgeChooserController implements EdgeMetricServiceSubscriber {
	private noMetricsAvailable: string = "No Edge Metrics available"

	private _viewModel: {
		edgeMetricData: MetricData[]
		edgeMetric: string
	} = {
		edgeMetricData: [],
		edgeMetric: "None"
	}

	constructor(
		$rootScope: IRootScopeService,
		private edgeMetricService: EdgeMetricService,
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService
	) {
		EdgeMetricService.subscribe($rootScope, this)
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

	public onEdgeMetricSelected() {
		this.codeMapActionsService.showEdgesForMetric(this._viewModel.edgeMetric)
		this.settingsService.updateSettings({ dynamicSettings: { edgeMetric: this._viewModel.edgeMetric } })
	}
}

export const edgeChooserComponent = {
	selector: "edgeChooserComponent",
	template: require("./edgeChooser.component.html"),
	controller: EdgeChooserController
}
