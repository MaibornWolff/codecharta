"use strict"

import "./scenarioDropDown.component.scss"
import { ScenarioHelper, Scenario } from "../../util/scenarioHelper"
import { SettingsService } from "../../state/settingsService/settings.service"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

export class ScenarioDropDownController implements MetricServiceSubscriber {
	private _viewModel: {
		scenarios: Scenario[]
	} = {
		scenarios: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {
		MetricService.subscribe(this.$rootScope, this)
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		this._viewModel.scenarios = ScenarioHelper.getScenarios(metricData)
	}

	public onMetricDataRemoved() {}

	public applyScenario(scenarioName: string) {
		//TODO: fill StoreService
		this.settingsService.updateSettings(ScenarioHelper.getScenarioSettingsByName(scenarioName))
		this.threeOrbitControlsService.autoFitTo()
	}
}

export const scenarioDropDownComponent = {
	selector: "scenarioDropDownComponent",
	template: require("./scenarioDropDown.component.html"),
	controller: ScenarioDropDownController
}
