"use strict"

import "./scenarioDropDown.component.scss"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { ColorRange } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { DialogService } from "../dialog/dialog.service"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { MetricDataService, MetricDataSubscriber } from "../../state/store/metricData/metricData.service"

export interface ScenarioItem {
	scenarioName: string
	isScenarioApplicable: boolean
	icons: { faIconClass: string; isSaved: boolean; tooltip: string }[]
}

export class ScenarioDropDownController implements MetricDataSubscriber {
	private _viewModel: {
		dropDownScenarioItems: ScenarioItem[]
	} = {
		dropDownScenarioItems: []
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private dialogService: DialogService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {
		MetricDataService.subscribe(this.$rootScope, this)
	}

	public loadScenarios() {
		this._viewModel.dropDownScenarioItems = ScenarioHelper.getScenarioItems(this.storeService.getState().metricData)
	}

	public onMetricDataChanged() {
		this.loadScenarios()
	}

	public applyScenario(scenarioName: string) {
		const scenarioSettings = ScenarioHelper.getScenarioSettingsByName(scenarioName)

		this.storeService.dispatch(setState(scenarioSettings))
		this.storeService.dispatch(setColorRange(scenarioSettings.dynamicSettings.colorRange as ColorRange))
		this.threeOrbitControlsService.setControlTarget()
	}

	public showAddScenarioSettings() {
		this.dialogService.showAddScenarioSettings()
	}

	public removeScenario(scenarioName) {
		if (scenarioName !== "Complexity") {
			ScenarioHelper.deleteScenario(scenarioName)
			this.dialogService.showErrorDialog(scenarioName + " deleted.", "Info")
		} else {
			this.dialogService.showErrorDialog(scenarioName + " cannot be deleted as it is the default Scenario.", "Error")
		}
	}
}

export const scenarioDropDownComponent = {
	selector: "scenarioDropDownComponent",
	template: require("./scenarioDropDown.component.html"),
	controller: ScenarioDropDownController
}
