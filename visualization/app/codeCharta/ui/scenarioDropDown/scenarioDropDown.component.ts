"use strict"

import "./scenarioDropDown.component.scss"
import { ScenarioHelper, Scenario } from "../../util/scenarioHelper"
import { SettingsService } from "../../state/settings.service"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

export class ScenarioDropDownController implements MetricServiceSubscriber {
	private _viewModel: {
		scenarios: Scenario[]
		selectedName: string
	} = {
		scenarios: null,
		selectedName: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {
		MetricService.subscribe(this.$rootScope, this)
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		this.setScenarios(metricData)
	}

	public onMetricDataRemoved() {}

	private setScenarios(metricData: MetricData[]) {
		this._viewModel.scenarios = ScenarioHelper.getScenarios(metricData)
	}

	public applySettings() {
		this.settingsService.updateSettings(ScenarioHelper.getScenarioSettingsByName(this._viewModel.selectedName))
		this._viewModel.selectedName = null
		this.threeOrbitControlsService.autoFitTo()
	}
}

export const scenarioDropDownComponent = {
	selector: "scenarioDropDownComponent",
	template: require("./scenarioDropDown.component.html"),
	controller: ScenarioDropDownController
}
