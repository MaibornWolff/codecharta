import "./metricType.component.scss"
import { MetricService } from "../../state/metric.service"
import { AttributeTypeValue } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { AreaMetricSubscriber, ColorMetricSubscriber, HeightMetricSubscriber } from "../../state/settingsService/settings.service.events"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { AreaMetricService } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { StoreService } from "../../state/store.service"

export class MetricTypeController
	implements AreaMetricSubscriber, HeightMetricSubscriber, ColorMetricSubscriber, BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private _viewModel: {
		areaMetricType: AttributeTypeValue
		heightMetricType: AttributeTypeValue
		colorMetricType: AttributeTypeValue
		isBuildingHovered: boolean
	} = {
		areaMetricType: null,
		heightMetricType: null,
		colorMetricType: null,
		isBuildingHovered: false
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private metricService: MetricService, private storeService: StoreService) {
		AreaMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
	}

	public onAreaMetricChanged(areaMetric: string) {
		this._viewModel.areaMetricType = this.metricService.getAttributeTypeByMetric(areaMetric, this.storeService.getState())
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.heightMetricType = this.metricService.getAttributeTypeByMetric(heightMetric, this.storeService.getState())
	}

	public onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetricType = this.metricService.getAttributeTypeByMetric(colorMetric, this.storeService.getState())
	}

	public onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this._viewModel.isBuildingHovered = hoveredBuilding.node && !hoveredBuilding.node.isLeaf
	}

	public onBuildingUnhovered() {
		this._viewModel.isBuildingHovered = false
	}

	public isAreaMetricAbsolute(): boolean {
		return this._viewModel.areaMetricType === AttributeTypeValue.absolute || !this._viewModel.areaMetricType
	}

	public isHeightMetricAbsolute(): boolean {
		return this._viewModel.heightMetricType === AttributeTypeValue.absolute || !this._viewModel.heightMetricType
	}

	public isColorMetricAbsolute(): boolean {
		return this._viewModel.colorMetricType === AttributeTypeValue.absolute || !this._viewModel.colorMetricType
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
