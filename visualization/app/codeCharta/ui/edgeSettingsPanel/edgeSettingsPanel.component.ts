import "./edgeSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
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
import {
	EdgeMetricService,
	EdgeMetricSubscriber
} from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"

export class EdgeSettingsPanelController
	implements
		EdgeMetricSubscriber,
		AmountOfEdgePreviewsSubscriber,
		EdgeHeightSubscriber,
		ShowOnlyBuildingsWithEdgesSubscriber {
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

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private edgeMetricDataService: EdgeMetricDataService,
		private codeMapActionsService: CodeMapActionsService
	) {
		AmountOfEdgePreviewsService.subscribe(this.$rootScope, this)
		EdgeHeightService.subscribe(this.$rootScope, this)
		ShowOnlyBuildingsWithEdgesService.subscribe(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
	}

	public onAmountOfEdgePreviewsChanged(amountOfEdgePreviews: number) {
		this._viewModel.amountOfEdgePreviews = amountOfEdgePreviews
		this.codeMapActionsService.updateEdgePreviews()
	}

	public onEdgeHeightChanged(edgeHeight: number) {
		this._viewModel.edgeHeight = edgeHeight
		this.codeMapActionsService.updateEdgePreviews()
	}

	public onShowOnlyBuildingsWithEdgesChanged(showOnlyBuildingsWithEdges: boolean) {
		this._viewModel.showOnlyBuildingsWithEdges = showOnlyBuildingsWithEdges
		this.codeMapActionsService.updateEdgePreviews()
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.totalAffectedBuildings = this.edgeMetricDataService.getAmountOfAffectedBuildings(edgeMetric)
		if (edgeMetric === "None") {
			this._viewModel.amountOfEdgePreviews = 0
			this._viewModel.showOnlyBuildingsWithEdges = false
		} else {
			this._viewModel.amountOfEdgePreviews = defaultAmountOfEdgePreviews
		}
		this.applySettingsAmountOfEdgePreviews()
		this.applyShowOnlyBuildingsWithEdges()
	}

	public applySettingsAmountOfEdgePreviews() {
		this.storeService.dispatch(setAmountOfEdgePreviews(this._viewModel.amountOfEdgePreviews))
	}

	public applySettingsEdgeHeight() {
		this.storeService.dispatch(setEdgeHeight(this._viewModel.edgeHeight))
	}

	public applyShowOnlyBuildingsWithEdges() {
		this.storeService.dispatch(setShowOnlyBuildingsWithEdges(this._viewModel.showOnlyBuildingsWithEdges))
	}
}

export const edgeSettingsPanelComponent = {
	selector: "edgeSettingsPanelComponent",
	template: require("./edgeSettingsPanel.component.html"),
	controller: EdgeSettingsPanelController
}
