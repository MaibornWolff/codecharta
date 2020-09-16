import "./metricType.component.scss"
import { AttributeTypeValue } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { AreaMetricService, AreaMetricSubscriber } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService, HeightMetricSubscriber } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { EdgeMetricService, EdgeMetricSubscriber } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { StoreService } from "../../state/store.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { MetricDataService, MetricDataSubscriber } from "../../state/store/metricData/metricData.service"

export enum MetricSelections {
	areaMetric = "areaMetric",
	heightMetric = "heightMetric",
	colorMetric = "colorMetric",
	edgeMetric = "edgeMetric"
}

export class MetricTypeController
	implements
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber,
		EdgeMetricSubscriber,
		BuildingHoveredSubscriber,
		BuildingUnhoveredSubscriber,
		MetricDataSubscriber {
	private _viewModel: {
		metricType: AttributeTypeValue
		isFolderHovered: boolean
	} = {
		metricType: null,
		isFolderHovered: false
	}

	private metricSelection: MetricSelections

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private nodeMetricDataService: NodeMetricDataService,
		private edgeMetricDataService: EdgeMetricDataService,
		private storeService: StoreService
	) {
		AreaMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		MetricDataService.subscribe(this.$rootScope, this)
	}

	onAreaMetricChanged(areaMetric: string) {
		if (this.metricSelection === MetricSelections.areaMetric) {
			this._viewModel.metricType = this.nodeMetricDataService.getAttributeTypeByMetric(areaMetric)
		}
	}

	onHeightMetricChanged(heightMetric: string) {
		if (this.metricSelection === MetricSelections.heightMetric) {
			this._viewModel.metricType = this.nodeMetricDataService.getAttributeTypeByMetric(heightMetric)
		}
	}

	onColorMetricChanged(colorMetric: string) {
		if (this.metricSelection === MetricSelections.colorMetric) {
			this._viewModel.metricType = this.nodeMetricDataService.getAttributeTypeByMetric(colorMetric)
		}
	}

	onEdgeMetricChanged(edgeMetric: string) {
		if (this.metricSelection === MetricSelections.edgeMetric) {
			this._viewModel.metricType = this.edgeMetricDataService.getAttributeTypeByMetric(edgeMetric)
		}
	}

	onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this._viewModel.isFolderHovered = hoveredBuilding.node && !hoveredBuilding.node.isLeaf
	}

	onBuildingUnhovered() {
		this._viewModel.isFolderHovered = false
	}

	onMetricDataChanged() {
		const state = this.storeService.getState()
		if (this.metricSelection === MetricSelections.edgeMetric) {
			this._viewModel.metricType = this.edgeMetricDataService.getAttributeTypeByMetric(state.dynamicSettings[this.metricSelection])
		} else {
			this._viewModel.metricType = this.nodeMetricDataService.getAttributeTypeByMetric(state.dynamicSettings[this.metricSelection])
		}
	}
}

export const metricTypeComponent = {
	selector: "metricTypeComponent",
	template: require("./metricType.component.html"),
	controller: MetricTypeController,
	bindings: { metricSelection: "@" }
}
