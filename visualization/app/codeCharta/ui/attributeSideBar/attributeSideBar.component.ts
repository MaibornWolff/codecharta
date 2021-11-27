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
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { setSecondaryMetrics } from "../../state/store/appSettings/secondaryMetrics/secondaryMetrics.actions"

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

export interface SecondaryMetric {
	name: string
	type: string
}

export class AttributeSideBarController
	implements
		BuildingSelectedEventSubscriber,
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber,
		EdgeMetricSubscriber,
		IsAttributeSideBarVisibleSubscriber
{
	private _viewModel: {
		node: Node
		fileName: string
		primaryMetricKeys: PrimaryMetrics
		secondaryMetrics: SecondaryMetric[]
		isSideBarVisible: boolean
	} = {
		node: null,
		fileName: null,
		primaryMetricKeys: { node: {}, edge: {} } as PrimaryMetrics,
		secondaryMetrics: null,
		isSideBarVisible: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private nodeMetricDataService: NodeMetricDataService,
		private edgeMetricDataService: EdgeMetricDataService
	) {
		"ngInject"
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
		this.updateSortedMetricKeysWithoutPrimaryMetrics(true)
	}

	onAreaMetricChanged(areaMetric: string) {
		this._viewModel.primaryMetricKeys.node.area = areaMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics(false)
	}

	onHeightMetricChanged(heightMetric: string) {
		this._viewModel.primaryMetricKeys.node.height = heightMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics(false)
	}

	onColorMetricChanged(colorMetric: string) {
		this._viewModel.primaryMetricKeys.node.color = colorMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics(false)
	}

	onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.primaryMetricKeys.edge.edge = edgeMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics(false)
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	onClickCloseSideBar = () => {
		this.storeService.dispatch(closeAttributeSideBar())
	}

	private updateSortedMetricKeysWithoutPrimaryMetrics(buildingSelected: boolean) {
		if (this._viewModel.node) {
			const metricValues = new Set(Object.values(this._viewModel.primaryMetricKeys.node))

			const secondaryMetricKeys = Object.keys(this._viewModel.node.attributes)
				.filter(key => !metricValues.has(key))
				.sort()

			const secondaryMetrics = []

			for (const metricKey of secondaryMetricKeys) {
				// Temporary solution to remove unary as viewable metric
				if (metricKey === "unary") {
					continue
				}

				const metricType =
					metricKey in this._viewModel.node.edgeAttributes
						? this.edgeMetricDataService.getAttributeTypeByMetric(metricKey)
						: this.nodeMetricDataService.getAttributeTypeByMetric(metricKey)
				secondaryMetrics.push({ name: metricKey, type: metricType } as SecondaryMetric)
			}
			if (!buildingSelected) {
				this.storeService.dispatch(setSecondaryMetrics(secondaryMetrics))
			}
			this._viewModel.secondaryMetrics = secondaryMetrics
		}
	}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
