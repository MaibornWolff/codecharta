import { Component } from "@angular/core"
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from "@angular/forms"
import { ScenarioHelper, ScenarioMetricProperty } from "../scenarioHelper"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../codeMap/threeViewer/threeMapControls.service"
import { customScenarioNameValidator } from "./utils/customScenarioName.validator"
import { getInitialScenarioMetricProperties } from "./utils/getInitialScenarioMetricProperties"
import { State } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { MatToolbar } from "@angular/material/toolbar"
import { CdkScrollable } from "@angular/cdk/scrolling"
import { MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog"
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field"
import { MatInput } from "@angular/material/input"
import { MatSlideToggle } from "@angular/material/slide-toggle"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-add-custom-scenario-dialog",
    templateUrl: "./addCustomScenarioDialog.component.html",
    styleUrls: ["./addCustomScenarioDialog.component.scss"],
    standalone: true,
    imports: [
        MatToolbar,
        CdkScrollable,
        MatDialogContent,
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        ReactiveFormsModule,
        MatError,
        MatSlideToggle,
        MatDialogActions,
        MatButton,
        MatDialogClose
    ]
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
