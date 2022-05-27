import "./metricChooser.component.scss"
import { IRootScopeService } from "angular"
import { NodeMetricData } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { HeightMetricService, HeightMetricSubscriber } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"

import { NodeMetricDataService, NodeMetricDataSubscriber } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"

export class MetricChooserController implements NodeMetricDataSubscriber, HeightMetricSubscriber, ColorMetricSubscriber {
	private originalMetricData: NodeMetricData[]

	private _viewModel: {
		metricData: NodeMetricData[]
		colorMetric: string
		heightMetric: string
		searchTerm: string
	} = {
		metricData: [],
		colorMetric: null,
		heightMetric: null,
		searchTerm: ""
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	onHeightMetricChanged(heightMetric: string) {
		this._viewModel.heightMetric = heightMetric
	}

	onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetric = colorMetric
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

	applySettingsColorMetric() {
		this.storeService.dispatch(setColorMetric(this._viewModel.colorMetric))
	}

	applySettingsHeightMetric() {
		this.storeService.dispatch(setHeightMetric(this._viewModel.heightMetric))
	}
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
