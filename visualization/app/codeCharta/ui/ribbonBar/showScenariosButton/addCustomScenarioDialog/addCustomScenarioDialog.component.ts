import { Component } from "@angular/core"
import { UntypedFormControl } from "@angular/forms"
import { ScenarioHelper, ScenarioMetricProperty } from "../scenarioHelper"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { customScenarioNameValidator } from "./utils/customScenarioName.validator"
import { getInitialScenarioMetricProperties } from "./utils/getInitialScenarioMetricProperties"
import { State } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"

@Component({
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
        threeOrbitControlsService: ThreeOrbitControlsService
    ) {
        this.scenarioContent = getInitialScenarioMetricProperties(this.state.getValue(), {
            camera: threeCameraService.camera.position,
            cameraTarget: threeOrbitControlsService.controls.target,
            zoom: threeCameraService.camera.zoom
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
