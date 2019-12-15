import "./metricChooser.component.scss"
import { IRootScopeService, ITimeoutService } from "angular"
import { MetricData } from "../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import $ from "jquery"
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

export class MetricChooserController
	implements MetricServiceSubscriber, AreaMetricSubscriber, HeightMetricSubscriber, ColorMetricSubscriber, DistributionMetricSubscriber {
	private originalMetricData: MetricData[]

	private _viewModel: {
		metricData: MetricData[]
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

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private storeService: StoreService,
		private metricService: MetricService
	) {
		AreaMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		DistributionMetricService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
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

	public onDistributionMetricChanged(distributionMetric: string) {
		this._viewModel.distributionMetric = distributionMetric
	}

	public filterMetricData() {
		this._viewModel.metricData = this.originalMetricData.filter(metric =>
			metric.name.toLowerCase().includes(this._viewModel.searchTerm.toLowerCase())
		)
	}

	public clearSearchTerm() {
		this._viewModel.searchTerm = ""
		this._viewModel.metricData = this.originalMetricData
	}

	public focusInputField(idName: string) {
		this.$timeout(() => {
			$(".metric-search." + idName).focus()
		}, 200)
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		this._viewModel.metricData = metricData
		this.originalMetricData = metricData
		const availableMetrics: MetricData[] = metricData.filter(x => x.availableInVisibleMaps && x.maxValue > 0)
		if (metricData.length > 1 && availableMetrics.length > 0) {
			this.potentiallyUpdateAreaMetric()
			this.potentiallyUpdateColorMetric()
			this.potentiallyUpdateHeightMetric()
			this.potentiallyUpdateDistributionMetric()
		}
	}

	public onMetricDataRemoved() {}

	private potentiallyUpdateAreaMetric() {
		if (this.isMetricUnavailable("areaMetric")) {
			this.storeService.dispatch(setAreaMetric(this.getMetricNameFromIndexOrLast(0)))
		}
	}

	private potentiallyUpdateHeightMetric() {
		if (this.isMetricUnavailable("heightMetric")) {
			this.storeService.dispatch(setHeightMetric(this.getMetricNameFromIndexOrLast(1)))
		}
	}

	private potentiallyUpdateColorMetric() {
		if (this.isMetricUnavailable("colorMetric")) {
			this.storeService.dispatch(setColorMetric(this.getMetricNameFromIndexOrLast(2)))
		}
	}

	private potentiallyUpdateDistributionMetric() {
		if (this.isMetricUnavailable("distributionMetric")) {
			this.storeService.dispatch(setDistributionMetric(this.getMetricNameFromIndexOrLast(0)))
		}
	}

	private isMetricUnavailable(metricKey: string) {
		const metricName: string = this.storeService.getState().dynamicSettings[metricKey]
		return !this.metricService.getMetricData().find(x => x.availableInVisibleMaps && x.maxValue > 0 && x.name == metricName)
	}

	private getMetricNameFromIndexOrLast(index: number) {
		const availableMetrics = this.metricService.getMetricData().filter(x => x.availableInVisibleMaps && x.maxValue > 0)
		return availableMetrics[Math.min(index, availableMetrics.length - 1)].name
	}

	public applySettingsAreaMetric() {
		this.storeService.dispatch(setAreaMetric(this._viewModel.areaMetric))
	}

	public applySettingsColorMetric() {
		this.storeService.dispatch(setColorMetric(this._viewModel.colorMetric))
	}

	public applySettingsHeightMetric() {
		this.storeService.dispatch(setHeightMetric(this._viewModel.heightMetric))
	}

	public applySettingsDistributionMetric() {
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

export const distribitionMetricChooserComponent = {
	selector: "distributionMetricChooserComponent",
	template: require("./metricChooser.distribution.component.html"),
	controller: MetricChooserController
}
