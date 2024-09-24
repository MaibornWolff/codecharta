import { Component, OnInit } from "@angular/core"
import { UntypedFormControl, Validators, AbstractControl, ValidatorFn } from "@angular/forms"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { buildCustomConfigFromState } from "../../../../util/customConfigBuilder"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../codeMap/threeViewer/threeMapControls.service"
import { VisibleFilesBySelectionMode, visibleFilesBySelectionModeSelector } from "../../visibleFilesBySelectionMode.selector"
import { CcState } from "../../../../codeCharta.model"
import { State } from "@ngrx/store"

@Component({
    selector: "cc-add-custom-config-dialog",
    templateUrl: "./addCustomConfigDialog.component.html"
})
export class AddCustomConfigDialogComponent implements OnInit {
    customConfigName: UntypedFormControl
    customConfigNote: string

    constructor(
        private state: State<CcState>,
        private threeCameraService: ThreeCameraService,
        private threeOrbitControlsService: ThreeMapControlsService
    ) {}

    ngOnInit(): void {
        const visibleFilesBySelectionMode = visibleFilesBySelectionModeSelector(this.state.getValue())
        this.customConfigName = new UntypedFormControl("", [
            Validators.required,
            createCustomConfigNameValidator(visibleFilesBySelectionMode)
        ])
        this.customConfigName.setValue(CustomConfigHelper.getConfigNameSuggestionByFileState(visibleFilesBySelectionMode))
    }

    getErrorMessage() {
        if (this.customConfigName.hasError("required")) {
            return "Please enter a view name."
        }
        return this.customConfigName.hasError("Error") ? this.customConfigName.getError("Error") : ""
    }

    addCustomConfig() {
        const newCustomConfig = buildCustomConfigFromState(
            this.customConfigName.value,
            this.state.getValue(),
            {
                camera: this.threeCameraService.camera.position,
                cameraTarget: this.threeOrbitControlsService.controls.target
            },
            this.customConfigNote
        )
        CustomConfigHelper.addCustomConfig(newCustomConfig)
    }
}

function createCustomConfigNameValidator(visibleFilesBySelectionMode: VisibleFilesBySelectionMode): ValidatorFn {
    return (control: AbstractControl): { Error: string } => {
        const desiredConfigName = control.value
        if (
            !CustomConfigHelper.hasCustomConfigByName(
                visibleFilesBySelectionMode.mapSelectionMode,
                visibleFilesBySelectionMode.assignedMaps,
                desiredConfigName
            )
        ) {
            return null
        }
        return { Error: "A Custom View with this name already exists." }
    }
}
