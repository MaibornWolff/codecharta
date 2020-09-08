import "./metricValueHovered.component.scss"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { Node } from "../../codeCharta.model"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { AreaMetricService, AreaMetricSubscriber } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService, HeightMetricSubscriber } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"

export class MetricValueHoveredController
	implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, AreaMetricSubscriber, HeightMetricSubscriber, ColorMetricSubscriber {
	private POSITIVE_COLOR = "#b1d8a8"
	private NEGATIVE_COLOR = "#ffcccc"
	private NEUTRAL_COLOR = "#e6e6e6"

	private _viewModel: {
		areaMetric: string
		colorMetric: string
		heightMetric: string
		hoveredNode: Node
		deltaColor: string
	} = {
		areaMetric: null,
		colorMetric: null,
		heightMetric: null,
		hoveredNode: null,
		deltaColor: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService) {
		AreaMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)

		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
	}

	public onAreaMetricChanged(areaMetric: string) {
		this._viewModel.areaMetric = areaMetric
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.heightMetric = heightMetric
	}

	public onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetric = colorMetric
	}

	public onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		if (hoveredBuilding.node) {
			this._viewModel.hoveredNode = hoveredBuilding.node
			if (hoveredBuilding.node.deltas) {
				this._viewModel.deltaColor = this.getHoveredDeltaColor()
			}
		}
		this.synchronizeAngularTwoWayBinding()
	}

	public onBuildingUnhovered() {
		this._viewModel.hoveredNode = null
		this.synchronizeAngularTwoWayBinding()
	}

	private getHoveredDeltaColor() {
		const heightDelta: number = this._viewModel.hoveredNode.deltas[this._viewModel.heightMetric]

		if (heightDelta > 0) {
			return this.POSITIVE_COLOR
		} else if (heightDelta < 0) {
			return this.NEGATIVE_COLOR
		}
		return this.NEUTRAL_COLOR
	}

	//TODO: Check if this is required after finishing redux
	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}
}

export const areaMetricValueHoveredComponent = {
	selector: "areaMetricValueHoveredComponent",
	template: require("./metricValueHovered.area.component.html"),
	controller: MetricValueHoveredController
}

export const heightMetricValueHoveredComponent = {
	selector: "heightMetricValueHoveredComponent",
	template: require("./metricValueHovered.height.component.html"),
	controller: MetricValueHoveredController
}

export const colorMetricValueHoveredComponent = {
	selector: "colorMetricValueHoveredComponent",
	template: require("./metricValueHovered.color.component.html"),
	controller: MetricValueHoveredController
}
