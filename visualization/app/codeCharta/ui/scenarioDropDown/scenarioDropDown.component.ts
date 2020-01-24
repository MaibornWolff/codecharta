"use strict"

import "./scenarioDropDown.component.scss"
import { ScenarioHelper, Scenario } from "../../util/scenarioHelper"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { MetricData } from "../../model/codeCharta.model"
import { IRootScopeService } from "angular"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"

export class ScenarioDropDownController implements MetricServiceSubscriber {
	private _viewModel: {
		scenarios: Scenario[]
	} = {
		scenarios: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {
		MetricService.subscribe(this.$rootScope, this)
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		this._viewModel.scenarios = ScenarioHelper.getScenarios(metricData)
	}

	public applyScenario(scenarioName: string) {
		this.storeService.dispatch(setState(ScenarioHelper.getScenarioSettingsByName(scenarioName)))
		this.threeOrbitControlsService.autoFitTo()
	}
}

export const scenarioDropDownComponent = {
	selector: "scenarioDropDownComponent",
	template: require("./scenarioDropDown.component.html"),
	controller: ScenarioDropDownController
}
