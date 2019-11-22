import "./attributeSideBar.component.scss"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { Node } from "../../codeCharta.model"
import _ from "lodash"
import {
	AreaMetricSubscriber,
	HeightMetricSubscriber,
	ColorMetricSubscriber,
	EdgeMetricSubscriber
} from "../../state/settingsService/settings.service.events"
import { SettingsService } from "../../state/settingsService/settings.service"
import { AttributeSideBarService, AttributeSideBarVisibilitySubscriber } from "./attributeSideBar.service"
import { BuildingSelectedEventSubscriber, ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"

export interface PrimaryMetrics {
	node: {
		area: string
		color: string
		height: string
	}
	edge: {
		edge: string
	}
}

export class AttributeSideBarController
	implements
		BuildingSelectedEventSubscriber,
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber,
		EdgeMetricSubscriber,
		AttributeSideBarVisibilitySubscriber {
	private _viewModel: {
		node: Node
		fileName: string
		primaryMetricKeys: PrimaryMetrics
		secondaryMetricKeys: string[]
		isSideBarVisible: boolean
	} = {
		node: null,
		fileName: null,
		primaryMetricKeys: { node: {}, edge: {} } as PrimaryMetrics,
		secondaryMetricKeys: null,
		isSideBarVisible: null
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private attributeSideBarService: AttributeSideBarService
	) {
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		SettingsService.subscribeToAreaMetric(this.$rootScope, this)
		SettingsService.subscribeToHeightMetric(this.$rootScope, this)
		SettingsService.subscribeToColorMetric(this.$rootScope, this)
		SettingsService.subscribeToEdgeMetric(this.$rootScope, this)
		AttributeSideBarService.subscribe(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this._viewModel.node = selectedBuilding.node
		this._viewModel.fileName = this.codeMapPreRenderService.getRenderFileMeta().fileName
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onAreaMetricChanged(areaMetric: string) {
		this._viewModel.primaryMetricKeys.node.area = areaMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.primaryMetricKeys.node.height = heightMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onColorMetricChanged(colorMetric: string) {
		this._viewModel.primaryMetricKeys.node.color = colorMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.primaryMetricKeys.edge.edge = edgeMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onAttributeSideBarVisibilityChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	public onClickCloseSideBar() {
		this.attributeSideBarService.closeSideBar()
	}

	private updateSortedMetricKeysWithoutPrimaryMetrics() {
		if (this._viewModel.node) {
			this._viewModel.secondaryMetricKeys = _.keys(this._viewModel.node.attributes)
				.filter(x => !_.values(this._viewModel.primaryMetricKeys.node).includes(x))
				.sort()
		}
	}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
