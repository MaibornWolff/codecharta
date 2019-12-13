import "./metricChooser.component.scss"
import { SettingsService } from "../../state/settingsService/settings.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { MetricData, DynamicSettings, RecursivePartial } from "../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import {
	AreaMetricSubscriber,
	ColorMetricSubscriber,
	DistributionMetricSubscriber,
	HeightMetricSubscriber
} from "../../state/settingsService/settings.service.events"
import $ from "jquery"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { setDynamicSettings } from "../../state/store/dynamicSettings/dynamicSettings.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setDistributionMetric } from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { AreaMetricService } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { DistributionMetricService } from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.service"

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
		private settingsService: SettingsService,
		private storeService: StoreService
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
		const availableMetrics: MetricData[] = metricData.filter(x => x.availableInVisibleMaps)
		if (metricData.length > 1 && availableMetrics.length > 0) {
			this.potentiallyUpdateChosenMetrics(availableMetrics)
		}
	}

	public onMetricDataRemoved() {}

	private potentiallyUpdateChosenMetrics(availableMetrics: MetricData[]) {
		let dynamicSettingsUpdate: RecursivePartial<DynamicSettings> = {}

		if (this.isMetricUnavailable("areaMetric", availableMetrics)) {
			dynamicSettingsUpdate["areaMetric"] = this.getMetricNameFromIndexOrLast(availableMetrics, 0)
		}

		if (this.isMetricUnavailable("heightMetric", availableMetrics)) {
			dynamicSettingsUpdate["heightMetric"] = this.getMetricNameFromIndexOrLast(availableMetrics, 1)
		}

		if (this.isMetricUnavailable("colorMetric", availableMetrics)) {
			dynamicSettingsUpdate["colorMetric"] = this.getMetricNameFromIndexOrLast(availableMetrics, 2)
		}

		if (this.isMetricUnavailable("distributionMetric", availableMetrics)) {
			dynamicSettingsUpdate["distributionMetric"] = this.getMetricNameFromIndexOrLast(availableMetrics, 0)
		}

		if (_.keys(dynamicSettingsUpdate).length !== 0) {
			this.settingsService.updateSettings({ dynamicSettings: dynamicSettingsUpdate })
			this.storeService.dispatch(setDynamicSettings(dynamicSettingsUpdate))
		}
	}

	private isMetricUnavailable(metricKey: string, availableMetrics: MetricData[]) {
		const metricName: string = this.storeService.getState().dynamicSettings[metricKey]
		return !availableMetrics.find(x => x.name == metricName)
	}

	private getMetricNameFromIndexOrLast(metrics: MetricData[], index: number) {
		return metrics[Math.min(index, metrics.length - 1)].name
	}

	public applySettingsAreaMetric() {
		const state = this.storeService.getState()
		const margin = state.appSettings.dynamicMargin ? null : state.dynamicSettings.margin

		this.settingsService.updateSettings({
			dynamicSettings: {
				areaMetric: this._viewModel.areaMetric,
				margin
			}
		})
		this.storeService.dispatch(setAreaMetric(this._viewModel.areaMetric))
		this.storeService.dispatch(setMargin(margin))
	}

	public applySettingsColorMetric() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				colorMetric: this._viewModel.colorMetric
			}
		})
		this.storeService.dispatch(setColorMetric(this._viewModel.colorMetric))
	}

	public applySettingsHeightMetric() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				heightMetric: this._viewModel.heightMetric
			}
		})
		this.storeService.dispatch(setHeightMetric(this._viewModel.heightMetric))
	}

	public applySettingsDistributionMetric() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				distributionMetric: this._viewModel.distributionMetric
			}
		})
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
