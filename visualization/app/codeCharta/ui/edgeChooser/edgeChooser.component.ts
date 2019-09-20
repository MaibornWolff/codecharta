import "./edgeChooser.component.scss"
import { MetricData, EdgeMetricCount } from "../../codeCharta.model"
import { IRootScopeService, ITimeoutService } from "angular"
import { EdgeMetricService, EdgeMetricServiceSubscriber } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { EdgeMetricSubscriber } from "../../state/settingsService/settings.service.events"
import $ from "jquery"

export class EdgeChooserController implements EdgeMetricServiceSubscriber, EdgeMetricSubscriber {
	private originalEdgeMetricData: MetricData[]

	private _viewModel: {
		edgeMetricData: MetricData[]
		edgeMetric: string
		hoveredEdgeValue: EdgeMetricCount
		searchTerm: string
	} = {
		edgeMetricData: [],
		edgeMetric: null,
		hoveredEdgeValue: null,
		searchTerm: ""
	}

	constructor(
		private $rootScope: IRootScopeService,
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService,
		private $timeout: ITimeoutService
	) {
		EdgeMetricService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
		SettingsService.subscribeToEdgeMetric(this.$rootScope, this)
	}

	public onEdgeMetricDataUpdated(edgeMetrics: MetricData[]) {
		this._viewModel.edgeMetricData = edgeMetrics
		this.originalEdgeMetricData = edgeMetrics
		if (!this.originalEdgeMetricData.map(x => x.name).includes(this._viewModel.edgeMetric)) {
			this._viewModel.edgeMetric = "None"
		}
		this.onEdgeMetricSelected()
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data && data.to && data.to.node && data.to.node.edgeAttributes) {
			this._viewModel.hoveredEdgeValue = data.to.node.edgeAttributes[this._viewModel.edgeMetric]
		} else {
			this._viewModel.hoveredEdgeValue = null
		}
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.edgeMetric = edgeMetric == null ? "None" : edgeMetric
		this.codeMapActionsService.updateEdgePreviews()
	}

	public onEdgeMetricSelected() {
		this.settingsService.updateSettings({ dynamicSettings: { edgeMetric: this._viewModel.edgeMetric } })
	}

	public noEdgesAvailable() {
		return this._viewModel.edgeMetricData.length <= 1
	}

	public filterMetricData() {
		this._viewModel.edgeMetricData = this.originalEdgeMetricData.filter(metric =>
			metric.name.toLowerCase().includes(this._viewModel.searchTerm.toLowerCase())
		)
	}

	public focusInputField() {
		this.$timeout(() => {
			$(".metric-search").focus()
		}, 200)
	}

	public clearSearchTerm() {
		this._viewModel.searchTerm = ""
		this._viewModel.edgeMetricData = this.originalEdgeMetricData
	}
}

export const edgeChooserComponent = {
	selector: "edgeChooserComponent",
	template: require("./edgeChooser.component.html"),
	controller: EdgeChooserController
}
