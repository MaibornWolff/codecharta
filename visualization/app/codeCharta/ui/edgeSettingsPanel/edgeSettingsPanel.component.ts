import "./edgeSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import {
	defaultAmountOfEdgePreviews,
	setAmountOfEdgePreviews
} from "../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { setEdgeHeight } from "../../state/store/appSettings/edgeHeight/edgeHeight.actions"
import { setShowOnlyBuildingsWithEdges } from "../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import {
	AmountOfEdgePreviewsService,
	AmountOfEdgePreviewsSubscriber
} from "../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { EdgeHeightService, EdgeHeightSubscriber } from "../../state/store/appSettings/edgeHeight/edgeHeight.service"
import {
	ShowOnlyBuildingsWithEdgesService,
	ShowOnlyBuildingsWithEdgesSubscriber
} from "../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"
import { EdgeMetricService, EdgeMetricSubscriber } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

export class EdgeSettingsPanelController
	implements EdgeMetricSubscriber, AmountOfEdgePreviewsSubscriber, EdgeHeightSubscriber, ShowOnlyBuildingsWithEdgesSubscriber
{
	private _viewModel: {
		amountOfEdgePreviews: number
		totalAffectedBuildings: number
		edgeHeight: number
		showOnlyBuildingsWithEdges: boolean
	} = {
		amountOfEdgePreviews: null,
		totalAffectedBuildings: null,
		edgeHeight: null,
		showOnlyBuildingsWithEdges: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private edgeMetricDataService: EdgeMetricDataService
	) {
		"ngInject"
		AmountOfEdgePreviewsService.subscribe(this.$rootScope, this)
		EdgeHeightService.subscribe(this.$rootScope, this)
		ShowOnlyBuildingsWithEdgesService.subscribe(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
	}

	onAmountOfEdgePreviewsChanged(amountOfEdgePreviews: number) {
		this._viewModel.amountOfEdgePreviews = amountOfEdgePreviews
	}

	onEdgeHeightChanged(edgeHeight: number) {
		this._viewModel.edgeHeight = edgeHeight
	}

	onShowOnlyBuildingsWithEdgesChanged(showOnlyBuildingsWithEdges: boolean) {
		this._viewModel.showOnlyBuildingsWithEdges = showOnlyBuildingsWithEdges
	}

	onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.totalAffectedBuildings = this.edgeMetricDataService.getAmountOfAffectedBuildings(edgeMetric)

		this._viewModel.amountOfEdgePreviews = defaultAmountOfEdgePreviews
		this.applySettingsAmountOfEdgePreviews()
		this.applyShowOnlyBuildingsWithEdges()
	}

	applySettingsAmountOfEdgePreviews() {
		this.storeService.dispatch(setAmountOfEdgePreviews(this._viewModel.amountOfEdgePreviews))
	}

	applySettingsEdgeHeight() {
		this.storeService.dispatch(setEdgeHeight(this._viewModel.edgeHeight))
	}

	applyShowOnlyBuildingsWithEdges() {
		this.storeService.dispatch(setShowOnlyBuildingsWithEdges(this._viewModel.showOnlyBuildingsWithEdges))
	}
}

export const edgeSettingsPanelComponent = {
	selector: "ccEdgeSettingsPanel",
	template: require("./edgeSettingsPanel.component.html"),
	controller: EdgeSettingsPanelController
}
