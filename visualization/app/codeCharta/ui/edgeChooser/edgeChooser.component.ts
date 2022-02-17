import "./edgeChooser.component.scss"
import { EdgeMetricCount, EdgeMetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapMouseEventService, BuildingHoveredSubscriber, BuildingUnhoveredSubscriber } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { StoreService } from "../../state/store.service"
import { setEdgeMetric } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { EdgeMetricService, EdgeMetricSubscriber } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { EdgeMetricDataService, EdgeMetricDataSubscriber } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { onStoreChanged } from "../../state/angular-redux/onStoreChanged/onStoreChanged"
import { toggleEdgeMetricSelector } from "../../state/store/appSettings/toggleEdgeMetric/toggleEdgeMetric.selector"

export class EdgeChooserController
	implements EdgeMetricDataSubscriber, EdgeMetricSubscriber, BuildingHoveredSubscriber, BuildingUnhoveredSubscriber
{
	private originalEdgeMetricData: EdgeMetricData[]

	private _viewModel: {
		edgeMetricData: EdgeMetricData[]
		edgeMetric: string
		hoveredEdgeValue: EdgeMetricCount
		searchTerm: string
		edgeMetricToggle: boolean
	} = {
		edgeMetricData: [],
		edgeMetric: null,
		hoveredEdgeValue: null,
		searchTerm: "",
		edgeMetricToggle: false
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapActionsService: CodeMapActionsService
	) {
		"ngInject"
		EdgeMetricDataService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
		onStoreChanged(toggleEdgeMetricSelector, this.onEdgeMetricTogglerChanged)
	}

	onEdgeMetricTogglerChanged = (_old: boolean, newValue: boolean) => {
		this._viewModel.edgeMetricToggle = newValue
	}

	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[]) {
		this._viewModel.edgeMetricData = edgeMetricData
		this.originalEdgeMetricData = edgeMetricData
	}

	onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this._viewModel.hoveredEdgeValue = hoveredBuilding.node?.edgeAttributes
			? hoveredBuilding.node.edgeAttributes[this._viewModel.edgeMetric]
			: null
	}

	onBuildingUnhovered() {
		this._viewModel.hoveredEdgeValue = null
	}

	onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.edgeMetric = edgeMetric
		this.codeMapActionsService.updateEdgePreviews()
	}

	onEdgeMetricSelected() {
		this.storeService.dispatch(setEdgeMetric(this._viewModel.edgeMetric))
	}

	noEdgesAvailable() {
		return this._viewModel.edgeMetricData.length <= 1
	}

	filterMetricData() {
		const searchTerm = this._viewModel.searchTerm.toLowerCase()
		this._viewModel.edgeMetricData = this.originalEdgeMetricData.filter(({ name }) => name.toLowerCase().includes(searchTerm))
	}

	focusInputField(idName) {
		setTimeout(() => {
			document.getElementById(`${idName}-selector`).focus()
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
