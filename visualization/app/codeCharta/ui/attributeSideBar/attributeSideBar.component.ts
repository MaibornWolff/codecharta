import "./attributeSideBar.component.scss"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { Node } from "../../codeCharta.model"
import { BuildingSelectedEventSubscriber, ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { AreaMetricService, AreaMetricSubscriber } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService, HeightMetricSubscriber } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { EdgeMetricService, EdgeMetricSubscriber } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import {
	IsAttributeSideBarVisibleService,
	IsAttributeSideBarVisibleSubscriber
} from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { StoreService } from "../../state/store.service"
import { closeAttributeSideBar } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"

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
		IsAttributeSideBarVisibleSubscriber {
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
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		AreaMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
	}

	onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this._viewModel.node = selectedBuilding.node
		this._viewModel.fileName = this.codeMapPreRenderService.getRenderFileMeta().fileName
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	onAreaMetricChanged(areaMetric: string) {
		this._viewModel.primaryMetricKeys.node.area = areaMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	onHeightMetricChanged(heightMetric: string) {
		this._viewModel.primaryMetricKeys.node.height = heightMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	onColorMetricChanged(colorMetric: string) {
		this._viewModel.primaryMetricKeys.node.color = colorMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.primaryMetricKeys.edge.edge = edgeMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	onClickCloseSideBar() {
		this.storeService.dispatch(closeAttributeSideBar())
	}

	private updateSortedMetricKeysWithoutPrimaryMetrics() {
		if (this._viewModel.node) {
			const metricValues = new Set(Object.values(this._viewModel.primaryMetricKeys.node))
			this._viewModel.secondaryMetricKeys = Object.keys(this._viewModel.node.attributes)
				.filter(key => !metricValues.has(key))
				.sort()
		}
	}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
