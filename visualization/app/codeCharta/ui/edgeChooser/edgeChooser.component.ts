import "./edgeChooser.component.scss"
import { EdgeMetricCount, EdgeMetricData } from "../../codeCharta.model"
import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapMouseEventService, BuildingHoveredSubscriber, BuildingUnhoveredSubscriber } from "../codeMap/codeMap.mouseEvent.service"
import $ from "jquery"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { StoreService } from "../../state/store.service"
import { setEdgeMetric } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { EdgeMetricService, EdgeMetricSubscriber } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { EdgeMetricDataService, EdgeMetricDataSubscriber } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

export class EdgeChooserController
	implements EdgeMetricDataSubscriber, EdgeMetricSubscriber, BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private originalEdgeMetricData: EdgeMetricData[]

	private _viewModel: {
		edgeMetricData: EdgeMetricData[]
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

	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[]) {
		this._viewModel.edgeMetricData = edgeMetricData
		this.originalEdgeMetricData = edgeMetricData
	}

	onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		if (hoveredBuilding.node?.edgeAttributes) {
			this._viewModel.hoveredEdgeValue = hoveredBuilding.node.edgeAttributes[this._viewModel.edgeMetric]
		} else {
			this._viewModel.hoveredEdgeValue = null
		}
	}

	onBuildingUnhovered() {
		this._viewModel.hoveredEdgeValue = null
	}

	onEdgeMetricChanged(edgeMetric?: string) {
		this._viewModel.edgeMetric = edgeMetric || EdgeMetricDataService.NONE_METRIC
		this.codeMapActionsService.updateEdgePreviews()
	}

	onEdgeMetricSelected() {
		this.storeService.dispatch(setEdgeMetric(this._viewModel.edgeMetric))
	}

	noEdgesAvailable() {
		return this._viewModel.edgeMetricData.length <= 1
	}

	filterMetricData() {
		this._viewModel.edgeMetricData = this.originalEdgeMetricData.filter(metric =>
			metric.name.toLowerCase().includes(this._viewModel.searchTerm.toLowerCase())
		)
	}

	focusInputField() {
		this.$timeout(() => {
			$(".metric-search").focus()
		}, 200)
	}

	clearSearchTerm() {
		this._viewModel.searchTerm = ""
		this._viewModel.edgeMetricData = this.originalEdgeMetricData
	}
}

export const edgeChooserComponent = {
	selector: "edgeChooserComponent",
	template: require("./edgeChooser.component.html"),
	controller: EdgeChooserController
}
