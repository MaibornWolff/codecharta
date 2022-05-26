import "./metricChooser.component.scss"
import { IRootScopeService } from "angular"
import { NodeMetricData } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setDistributionMetric } from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { AreaMetricService, AreaMetricSubscriber } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService, HeightMetricSubscriber } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import {
	DistributionMetricService,
	DistributionMetricSubscriber
} from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.service"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"

export class MetricChooserController
	implements NodeMetricDataSubscriber, AreaMetricSubscriber, HeightMetricSubscriber, ColorMetricSubscriber, DistributionMetricSubscriber
{
	private originalMetricData: NodeMetricData[]

	private _viewModel: {
		metricData: NodeMetricData[]
		areaMetric: string
		colorMetric: string
		heightMetric: string
		distributionMetric: string
		searchTerm: string
	} = {
		metricData: [],
		areaMetric: null,
		colorMetric: null,
		heightMetric: null,
		distributionMetric: null,
		searchTerm: ""
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		AreaMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		// todo remove this and service
		DistributionMetricService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	onAreaMetricChanged(areaMetric: string) {
		this._viewModel.areaMetric = areaMetric
	}

	onHeightMetricChanged(heightMetric: string) {
		this._viewModel.heightMetric = heightMetric
	}

	onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetric = colorMetric
	}

	onDistributionMetricChanged(distributionMetric: string) {
		this._viewModel.distributionMetric = distributionMetric
	}

	onNodeMetricDataChanged(nodeMetricData: NodeMetricData[]) {
		this._viewModel.metricData = nodeMetricData
		this.originalMetricData = nodeMetricData
	}

	filterMetricData() {
		const searchTerm = this._viewModel.searchTerm.toLowerCase()
		this._viewModel.metricData = this.originalMetricData.filter(({ name }) => name.toLowerCase().includes(searchTerm))
	}

	clearSearchTerm() {
		this._viewModel.searchTerm = ""
		this._viewModel.metricData = this.originalMetricData
	}

	focusInputField(idName: string) {
		setTimeout(() => {
			document.getElementById(`${idName}-selector`).focus()
		}, 200)
	}

	applySettingsAreaMetric() {
		this.storeService.dispatch(setAreaMetric(this._viewModel.areaMetric))
	}

	applySettingsColorMetric() {
		this.storeService.dispatch(setColorMetric(this._viewModel.colorMetric))
	}

	applySettingsHeightMetric() {
		this.storeService.dispatch(setHeightMetric(this._viewModel.heightMetric))
	}

	// todo remove
	applySettingsDistributionMetric() {
		this.storeService.dispatch(setDistributionMetric(this._viewModel.distributionMetric))
	}
}

export const areaMetricChooserComponent = {
	selector: "areaMetricChooserComponent",
	template: require("./metricChooser.area.component.html"),
	controller: MetricChooserController
}

export const heightMetricChooserComponent = {
	selector: "heightMetricChooserComponent",
	template: require("./metricChooser.height.component.html"),
	controller: MetricChooserController
}

export const colorMetricChooserComponent = {
	selector: "colorMetricChooserComponent",
	template: require("./metricChooser.color.component.html"),
	controller: MetricChooserController
}

// todo delete
export const distribitionMetricChooserComponent = {
	selector: "distributionMetricChooserComponent",
	template: require("./metricChooser.distribution.component.html"),
	controller: MetricChooserController
}
