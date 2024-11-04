import { Component } from "@angular/core"
import { UntypedFormControl } from "@angular/forms"
import { ScenarioHelper, ScenarioMetricProperty } from "../scenarioHelper"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../codeMap/threeViewer/threeMapControls.service"
import { customScenarioNameValidator } from "./utils/customScenarioName.validator"
import { getInitialScenarioMetricProperties } from "./utils/getInitialScenarioMetricProperties"
import { State } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"

@Component({
    selector: "cc-add-custom-scenario-dialog",
    templateUrl: "./addCustomScenarioDialog.component.html",
    styleUrls: ["./addCustomScenarioDialog.component.scss"]
})
export class AddCustomScenarioDialogComponent {
    scenarioName = new UntypedFormControl("", [customScenarioNameValidator()])
    scenarioNameErrorField: string | null = "Scenario name is required"
    scenarioContent: ScenarioMetricProperty[]
    areAnyScenarioMetricPropertiesSelected = true

    constructor(
        private state: State<CcState>,
        threeCameraService: ThreeCameraService,
        threeOrbitControlsService: ThreeMapControlsService
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
        ScenarioHelper.addScenario(this.scenarioName.value, this.scenarioContent)
    }
}
