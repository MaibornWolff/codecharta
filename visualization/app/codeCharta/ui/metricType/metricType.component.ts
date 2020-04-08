import "./metricType.component.scss"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { AttributeTypeValue } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { AreaMetricService, AreaMetricSubscriber } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService, HeightMetricSubscriber } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { EdgeMetricService, EdgeMetricSubscriber } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"

export class MetricTypeController
	implements
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber,
		EdgeMetricSubscriber,
		BuildingHoveredSubscriber,
		BuildingUnhoveredSubscriber,
		MetricServiceSubscriber {
	private _viewModel: {
		areaMetricType: AttributeTypeValue
		heightMetricType: AttributeTypeValue
		colorMetricType: AttributeTypeValue
		edgeMetricType: AttributeTypeValue
		isFolderHovered: boolean
	} = {
		areaMetricType: null,
		heightMetricType: null,
		colorMetricType: null,
		edgeMetricType: null,
		isFolderHovered: false
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private metricService: MetricService,
		private edgeMetricDataService: EdgeMetricDataService
	) {
		AreaMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
	}

	public onAreaMetricChanged(areaMetric: string) {
		this._viewModel.areaMetricType = this.metricService.getAttributeTypeByMetric(areaMetric)
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.heightMetricType = this.metricService.getAttributeTypeByMetric(heightMetric)
	}

	public onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetricType = this.metricService.getAttributeTypeByMetric(colorMetric)
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.edgeMetricType = this.edgeMetricDataService.getAttributeTypeByMetric(edgeMetric)
	}

	public onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this._viewModel.isFolderHovered = hoveredBuilding.node && !hoveredBuilding.node.isLeaf
	}

	public onBuildingUnhovered() {
		this._viewModel.isFolderHovered = false
	}

	public onMetricDataAdded() {
		const store = this.storeService.getState()
		this._viewModel.areaMetricType = this.metricService.getAttributeTypeByMetric(store.dynamicSettings.areaMetric, store)
		this._viewModel.heightMetricType = this.metricService.getAttributeTypeByMetric(store.dynamicSettings.heightMetric, store)
		this._viewModel.colorMetricType = this.metricService.getAttributeTypeByMetric(store.dynamicSettings.colorMetric, store)
		this._viewModel.edgeMetricType = this.edgeMetricDataService.getAttributeTypeByMetric(store.dynamicSettings.edgeMetric, store)
	}
}

export const areaMetricTypeComponent = {
	selector: "areaMetricTypeComponent",
	template: require("./areaMetricType.component.html"),
	controller: MetricTypeController
}

export const heightMetricTypeComponent = {
	selector: "heightMetricTypeComponent",
	template: require("./heightMetricType.component.html"),
	controller: MetricTypeController
}

export const colorMetricTypeComponent = {
	selector: "colorMetricTypeComponent",
	template: require("./colorMetricType.component.html"),
	controller: MetricTypeController
}

export const edgeMetricTypeComponent = {
	selector: "edgeMetricTypeComponent",
	template: require("./edgeMetricType.component.html"),
	controller: MetricTypeController
}
