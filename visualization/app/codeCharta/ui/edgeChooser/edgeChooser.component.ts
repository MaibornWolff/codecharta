import "./edgeChooser.component.scss"
import { MetricData, EdgeMetricCount } from "../../codeCharta.model"
import { IRootScopeService, ITimeoutService } from "angular"
import { EdgeMetricDataService, EdgeMetricDataServiceSubscriber } from "../../state/edgeMetricData.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import {
	CodeMapMouseEventService,
	BuildingHoveredSubscriber,
	BuildingUnhoveredSubscriber
} from "../codeMap/codeMap.mouseEvent.service"
import $ from "jquery"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { StoreService } from "../../state/store.service"
import { setEdgeMetric } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import {
	EdgeMetricService,
	EdgeMetricSubscriber
} from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"

export class EdgeChooserController
	implements
		EdgeMetricDataServiceSubscriber,
		EdgeMetricSubscriber,
		BuildingHoveredSubscriber,
		BuildingUnhoveredSubscriber {
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
		private storeService: StoreService,
		private codeMapActionsService: CodeMapActionsService,
		private $timeout: ITimeoutService
	) {
		EdgeMetricDataService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
	}

	public onEdgeMetricDataUpdated(edgeMetrics: MetricData[]) {
		this._viewModel.edgeMetricData = edgeMetrics
		this.originalEdgeMetricData = edgeMetrics
	}

	public onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		if (hoveredBuilding.node && hoveredBuilding.node.edgeAttributes) {
			this._viewModel.hoveredEdgeValue = hoveredBuilding.node.edgeAttributes[this._viewModel.edgeMetric]
		} else {
			this._viewModel.hoveredEdgeValue = null
		}
	}

	public onBuildingUnhovered() {
		this._viewModel.hoveredEdgeValue = null
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.edgeMetric = edgeMetric == null ? "None" : edgeMetric
		this.codeMapActionsService.updateEdgePreviews()
	}

	public onEdgeMetricSelected() {
		this.storeService.dispatch(setEdgeMetric(this._viewModel.edgeMetric))
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
