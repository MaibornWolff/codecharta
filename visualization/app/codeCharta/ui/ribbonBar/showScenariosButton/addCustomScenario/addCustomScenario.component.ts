import { Component, ViewEncapsulation } from "@angular/core"
import { UntypedFormControl } from "@angular/forms"
import { State } from "../../../../state/angular-redux/state"
import { ScenarioHelper, ScenarioMetricProperty } from "../scenarioHelper"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { customScenarioNameValidator } from "./utils/customScenarioName.validator"
import { getInitialScenarioMetricProperties } from "./utils/getInitialScenarioMetricProperties"

@Component({
	templateUrl: "./addCustomScenario.component.html",
	styleUrls: ["./addCustomScenario.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class AddCustomScenarioComponent {
	scenarioName = new UntypedFormControl("", [customScenarioNameValidator()])
	scenarioNameErrorField: string | null = "Scenario name is required"
	scenarioContent: ScenarioMetricProperty[]
	areAnyScenarioMetricPropertiesSelected = true

	constructor(private state: State, threeCameraService: ThreeCameraService, threeOrbitControlsService: ThreeOrbitControlsService) {
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
		ScenarioHelper.addScenario(this.scenarioName.value, this.scenarioContent)
	}
}
