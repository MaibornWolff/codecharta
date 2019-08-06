import {
	AreaMetricSubscriber,
	ColorMetricSubscriber,
	DistributionMetricSubscriber,
	HeightMetricSubscriber,
	SettingsService
} from "../../state/settings.service"
import { IRootScopeService } from "angular"
import "./metricChooser.component.scss"
import { BuildingHoveredEventSubscriber, CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { MetricData, Settings, DynamicSettings, RecursivePartial } from "../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"

export class MetricChooserController
	implements
		MetricServiceSubscriber,
		BuildingHoveredEventSubscriber,
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber,
		DistributionMetricSubscriber {
	public hoveredAreaValue: number
	public hoveredHeightValue: number
	public hoveredColorValue: number
	public hoveredHeightDelta: number
	public hoveredAreaDelta: number
	public hoveredColorDelta: number
	public hoveredDeltaColor: string

	private _viewModel: {
		metricData: MetricData[]
		areaMetric: string
		colorMetric: string
		heightMetric: string
		distributionMetric: string
	} = {
		metricData: [],
		areaMetric: null,
		colorMetric: null,
		heightMetric: null,
		distributionMetric: null
	}

	/* @ngInject */
	constructor(private settingsService: SettingsService, private $rootScope: IRootScopeService) {
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

	public onMetricDataAdded(metricData: MetricData[]) {
		this._viewModel.metricData = metricData
		this.potentiallyUpdateChosenMetrics(metricData)
	}

	public onMetricDataRemoved() {}

	private potentiallyUpdateChosenMetrics(metricData: MetricData[]) {
		const metricKeys: Partial<DynamicSettings> = {
			areaMetric: "areaMetric",
			heightMetric: "heightMetric",
			colorMetric: "colorMetric",
			distributionMetric: "distributionMetric"
		}
		let settingsUpdate: RecursivePartial<Settings> = this.prepareSettingsUpdateWithMetrics(metricKeys, metricData)
		if (Object.keys(settingsUpdate.dynamicSettings).length !== 0) {
			this.settingsService.updateSettings(settingsUpdate)
		}
	}

	private prepareSettingsUpdateWithMetrics(metricKeys: Partial<DynamicSettings>, metricData: MetricData[]): RecursivePartial<Settings> {
		let settingsUpdate = { dynamicSettings: {} }

		let metricSelectionIndex = 0
		for (const metricKey in metricKeys) {
			const metricValue: string = this.settingsService.getSettings().dynamicSettings[metricKey]
			const availableMetrics: MetricData[] = metricData.filter(x => x.availableInVisibleMaps)

			if (availableMetrics.length > 0 && !availableMetrics.find(x => x.name == metricValue)) {
				// metric value is "rloc" if not found in available, then gogogo
				settingsUpdate.dynamicSettings[metricKey] =
					availableMetrics[Math.min(metricSelectionIndex, availableMetrics.length - 1)].name
			}
			metricSelectionIndex++
		}
		return settingsUpdate
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
		if (data && data.to && data.to.node && data.to.node.attributes) {
			this.hoveredAreaValue = data.to.node.attributes[this._viewModel.areaMetric]
			this.hoveredColorValue = data.to.node.attributes[this._viewModel.colorMetric]
			this.hoveredHeightValue = data.to.node.attributes[this._viewModel.heightMetric]

			if (data.to.node.deltas) {
				this.hoveredAreaDelta = data.to.node.deltas[this._viewModel.areaMetric]
				this.hoveredColorDelta = data.to.node.deltas[this._viewModel.colorMetric]
				this.hoveredHeightDelta = data.to.node.deltas[this._viewModel.heightMetric]

				this.hoveredDeltaColor = this.getHoveredDeltaColor()
			} else {
				this.hoveredAreaDelta = null
				this.hoveredColorDelta = null
				this.hoveredHeightDelta = null
				this.hoveredDeltaColor = null
			}
		} else {
			this.hoveredAreaValue = null
			this.hoveredColorValue = null
			this.hoveredHeightValue = null
			this.hoveredHeightDelta = null
			this.hoveredAreaDelta = null
			this.hoveredColorDelta = null
		}
	}

	private getHoveredDeltaColor() {
		let colors = {
			0: "green",
			1: "red"
		}

		if (this.hoveredHeightDelta > 0) {
			return colors[Number(this.settingsService.getSettings().appSettings.invertDeltaColors)]
		} else if (this.hoveredHeightDelta < 0) {
			return colors[Number(!this.settingsService.getSettings().appSettings.invertDeltaColors)]
		} else {
			return "inherit"
		}
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
