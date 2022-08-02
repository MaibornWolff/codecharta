import { Component, Inject } from "@angular/core"
import { ThreeCameraServiceToken, ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { State } from "../../../state/angular-redux/state"
import { ScenarioHelper, ScenarioMetricProperty } from "../../../util/scenarioHelper"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControlsService"
import { getInitialScenarioMetricProperties } from "./getInitialScenarioMetricProperties"

@Component({
	template: require("./addCustomScenario.component.html")
})
export class AddCustomScenarioComponent {
	scenarioName = ""
	scenarioNameErrorField: string | null = "Scenario name is required"
	scenarioContent: ScenarioMetricProperty[]
	areAnyScenarioMetricPropertiesSelected = true

	constructor(
		@Inject(State) private state: State,
		@Inject(ThreeCameraServiceToken) threeCameraService: ThreeCameraService,
		@Inject(ThreeOrbitControlsServiceToken) threeOrbitControlsService: ThreeOrbitControlsService
	) {
		this.scenarioContent = getInitialScenarioMetricProperties(this.state.getValue(), {
			camera: threeCameraService.camera.position,
			cameraTarget: threeOrbitControlsService.controls.target
		})
	}

	validateScenarioName(event: Event) {
		const newScenarioName = (event.target as HTMLInputElement).value
		if (newScenarioName.length === 0) {
			this.scenarioNameErrorField = "Scenario name is required"
		} else if (ScenarioHelper.isScenarioExisting(newScenarioName)) {
			// todo this error isn't displayed
			this.scenarioNameErrorField = "A Scenario with this name already exists"
		} else {
			this.scenarioNameErrorField = null
		}
		// console.log(this.scenarioNameErrorField)
	}

	handleScenarioMetricPropertySelectionChange(scenarioMetricProperty: ScenarioMetricProperty) {
		scenarioMetricProperty.isSelected = !scenarioMetricProperty.isSelected
		this.areAnyScenarioMetricPropertiesSelected = this.scenarioContent.some(property => property.isSelected)
	}

	addCustomScenario() {
		ScenarioHelper.addScenario(this.scenarioName, this.scenarioContent)
	}
}
