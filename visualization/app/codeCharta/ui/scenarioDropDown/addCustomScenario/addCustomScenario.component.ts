import { Component, Inject } from "@angular/core"
import { FormControl } from "@angular/forms"
import { ThreeCameraServiceToken, ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { State } from "../../../state/angular-redux/state"
import { ScenarioHelper, ScenarioMetricProperty } from "../../../util/scenarioHelper"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControlsService"
import { customScenarioNameValidator } from "./utils/customScenarioName.validator"
import { getInitialScenarioMetricProperties } from "./utils/getInitialScenarioMetricProperties"

@Component({
	template: require("./addCustomScenario.component.html")
})
export class AddCustomScenarioComponent {
	scenarioName = new FormControl("", [customScenarioNameValidator()])
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

	handleScenarioMetricPropertySelectionChange(scenarioMetricProperty: ScenarioMetricProperty) {
		scenarioMetricProperty.isSelected = !scenarioMetricProperty.isSelected
		this.areAnyScenarioMetricPropertiesSelected = this.scenarioContent.some(property => property.isSelected)
	}

	addCustomScenario() {
		const selectedProperties = this.scenarioContent.filter(x => x.isSelected)
		ScenarioHelper.addScenario(this.scenarioName.value, selectedProperties)
	}
}
