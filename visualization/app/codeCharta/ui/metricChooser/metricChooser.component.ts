import { SettingsService } from "../../state/settingsService/settings.service"
import { IRootScopeService, ITimeoutService } from "angular"
import "./metricChooser.component.scss"
import { BuildingHoveredEventSubscriber, CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { MetricData, DynamicSettings, RecursivePartial, Node } from "../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import {
	AreaMetricSubscriber,
	ColorMetricSubscriber,
	DistributionMetricSubscriber,
	HeightMetricSubscriber
} from "../../state/settingsService/settings.service.events"
import _ from "lodash"

export class MetricChooserController
	implements
		MetricServiceSubscriber,
		BuildingHoveredEventSubscriber,
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber,
		DistributionMetricSubscriber {
	private originalMetricData: MetricData[]

	private _viewModel: {
		metricData: MetricData[]
		areaMetric: string
		colorMetric: string
		heightMetric: string
		distributionMetric: string
		hoveredNode: Node
		deltaColor: string
		searchTerm: string
	} = {
		metricData: [],
		areaMetric: null,
		colorMetric: null,
		heightMetric: null,
		distributionMetric: null,
		hoveredNode: null,
		deltaColor: null,
		searchTerm: ""
	}

	/* @ngInject */
	constructor(private settingsService: SettingsService, private $rootScope: IRootScopeService, private $timeout: ITimeoutService) {
		SettingsService.subscribeToAreaMetric(this.$rootScope, this)
		SettingsService.subscribeToHeightMetric(this.$rootScope, this)
		SettingsService.subscribeToColorMetric(this.$rootScope, this)
		SettingsService.subscribeToDistributionMetric(this.$rootScope, this)

		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
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

	public onMetricDataAdded(metricData: MetricData[]) {
		this._viewModel.metricData = metricData
		this.originalMetricData = metricData
		const availableMetrics: MetricData[] = metricData.filter(x => x.availableInVisibleMaps)
		if (availableMetrics.length > 0) {
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
		}
	}

	private isMetricUnavailable(metricKey: string, availableMetrics: MetricData[]) {
		const metricName: string = this.settingsService.getSettings().dynamicSettings[metricKey]
		return !availableMetrics.find(x => x.name == metricName)
	}

	private getMetricNameFromIndexOrLast(metrics: MetricData[], index: number) {
		return metrics[Math.min(index, metrics.length - 1)].name
	}

	public applySettingsAreaMetric() {
		const settings = this.settingsService.getSettings()
		const margin = settings.appSettings.dynamicMargin ? null : settings.dynamicSettings.margin

		this.settingsService.updateSettings({
			dynamicSettings: {
				areaMetric: this._viewModel.areaMetric,
				margin
			}
		})
	}

	public applySettingsColorMetric() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				colorMetric: this._viewModel.colorMetric,
				colorRange: this.settingsService.getDefaultSettings().dynamicSettings.colorRange
			}
		})
	}

	public applySettingsHeightMetric() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				heightMetric: this._viewModel.heightMetric
			}
		})
	}

	public applySettingsDistributionMetric() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				distributionMetric: this._viewModel.distributionMetric
			}
		})
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data && data.to && data.to.node) {
			this._viewModel.hoveredNode = data.to.node
			if (data.to.node.deltas) {
				this._viewModel.deltaColor = this.getHoveredDeltaColor()
			}
		} else {
			this._viewModel.hoveredNode = null
		}
		this.synchronizeAngularTwoWayBinding()
	}

	private getHoveredDeltaColor() {
		const heightDelta: number = this._viewModel.hoveredNode.deltas[this._viewModel.heightMetric]

		if (heightDelta > 0) {
			return "green"
		} else if (heightDelta < 0) {
			return "red"
		} else {
			return "inherit"
		}
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
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
