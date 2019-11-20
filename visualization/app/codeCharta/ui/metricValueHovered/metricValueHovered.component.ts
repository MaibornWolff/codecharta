import "./metricValueHovered.component.scss"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { Node } from "../../codeCharta.model"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { HeightMetricSubscriber } from "../../state/settingsService/settings.service.events"

export class MetricValueHoveredController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, HeightMetricSubscriber {
	private POSITIVE_COLOR = "#b1d8a8"
	private NEGATIVE_COLOR = "#ffcccc"
	private NEUTRAL_COLOR = "#e6e6e6"

	private _viewModel: {
		heightMetric: string
		hoveredNode: Node
		deltaColor: string
	} = {
		heightMetric: null,
		hoveredNode: null,
		deltaColor: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService) {
		SettingsService.subscribeToHeightMetric(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.heightMetric = heightMetric
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
		} else {
			return this.NEUTRAL_COLOR
		}
	}

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
