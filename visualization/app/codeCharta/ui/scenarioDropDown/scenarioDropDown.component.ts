"use strict"

import "./scenarioDropDown.component.scss"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { ColorRange, MapColors } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { DialogService } from "../dialog/dialog.service"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { MetricDataService, MetricDataSubscriber } from "../../state/store/metricData/metricData.service"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"

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
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeCameraService: ThreeCameraService
	) {
		"ngInject"
		MetricDataService.subscribe(this.$rootScope, this)
	}

	loadScenarios() {
		this._viewModel.dropDownScenarioItems = ScenarioHelper.getScenarioItems(metricDataSelector(this.storeService.getState()))
	}

	onMetricDataChanged() {
		this.loadScenarios()
	}

	applyScenario(scenarioName: string) {
		const scenario = ScenarioHelper.scenarios.get(scenarioName)

		const scenarioSettings = ScenarioHelper.getScenarioSettings(scenario)
		this.storeService.dispatch(setState(scenarioSettings))
		this.storeService.dispatch(setColorRange(scenarioSettings.dynamicSettings.colorRange as ColorRange))
		this.storeService.dispatch(setMapColors(scenarioSettings.appSettings.mapColors as MapColors))

		if (scenario.camera) {
			// @ts-ignore -- we know that it is not a partial when it is set
			this.threeCameraService.setPosition(scenario.camera.camera)
			// @ts-ignore -- we know that it is not a partial when it is set
			this.threeOrbitControlsService.setControlTarget(scenario.camera.cameraTarget)
		}
	}

	showAddScenarioSettings() {
		this.dialogService.showAddScenarioSettings()
	}

	removeScenario(scenarioName) {
		if (scenarioName !== "Complexity") {
			ScenarioHelper.deleteScenario(scenarioName)
			this.dialogService.showErrorDialog(`${scenarioName} deleted.`, "Info")
		} else {
			this.dialogService.showErrorDialog(`${scenarioName} cannot be deleted as it is the default Scenario.`, "Error")
		}
	}
}

export const scenarioDropDownComponent = {
	selector: "scenarioDropDownComponent",
	template: require("./scenarioDropDown.component.html"),
	controller: ScenarioDropDownController
}
