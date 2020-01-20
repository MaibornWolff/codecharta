"use strict"

import "./scenarioDropDown.component.scss"
import { ScenarioHelper, Scenario } from "../../util/scenarioHelper"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { DialogService } from "../dialog/dialog.service"

export class ScenarioDropDownController implements MetricServiceSubscriber {
	private _viewModel: {
		scenarios: Scenario[]
	} = {
		scenarios: null
	}

	private availableMetrics: MetricData[]

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private dialogService: DialogService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {
		MetricService.subscribe(this.$rootScope, this)
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		this._viewModel.scenarios = ScenarioHelper.getScenarios(metricData)
		this.availableMetrics = metricData
	}

	public applyScenario(scenarioName: string) {
		if (this.isScenarioAppliable(ScenarioHelper.getScenarioSettingsByName(scenarioName).dynamicSettings)) {
			this.storeService.dispatch(setState(ScenarioHelper.getScenarioSettingsByName(scenarioName)))
			this.threeOrbitControlsService.autoFitTo()
		} else {
			this.dialogService.showErrorDialog("This metric is not appliable, because not all metrics are available for this map.")
		}
	}

	private isScenarioAppliable(scenario) {
		for (let attribute in scenario) {
			let isAppliable: boolean = this.isMetricAvailable(scenario[attribute])
			if (isAppliable === true) {
				return false
			}
		}
		return true
	}

	private isMetricAvailable(metricName: string) {
		return !this.availableMetrics.find(x => x.name == metricName)
	}

	public getVisibility(icon: String, scenarioName: string) {
		// TODO: Function to Check if attributes are withing the Scenario

		switch (icon) {
			case "view": {
				// TODO: Implement if perspective is saved within the scenario
				return "black"
			}
			case "area": {
				if (!this._viewModel.scenarios.find(scenario => scenario.name === scenarioName).settings.dynamicSettings.areaMetric) {
					return "#d3d3d3"
				}
				break
			}
			case "color": {
				if (!this._viewModel.scenarios.find(scenario => scenario.name === scenarioName).settings.dynamicSettings.colorMetric) {
					return "#d3d3d3"
				}
				break
			}
			case "height": {
				if (!this._viewModel.scenarios.find(scenario => scenario.name === scenarioName).settings.dynamicSettings.heightMetric) {
					return "#d3d3d3"
				}
				break
			}
			case "edges": {
				if (!this._viewModel.scenarios.find(scenario => scenario.name === scenarioName).settings.dynamicSettings.edgeMetric) {
					return "#d3d3d3"
				}
				break
			}
			default:
				return ""
		}
	}

	public showAddScenarioSettings() {
		// TODO: show Scenario Save Settings
	}

	public removeScenario() {
		//TODO: Delete Scenario
	}
}

export const scenarioDropDownComponent = {
	selector: "scenarioDropDownComponent",
	template: require("./scenarioDropDown.component.html"),
	controller: ScenarioDropDownController
}
