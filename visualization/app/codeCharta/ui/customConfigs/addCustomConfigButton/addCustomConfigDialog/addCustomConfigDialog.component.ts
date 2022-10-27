import "./addCustomDialog.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { FormControl, Validators, AbstractControl, ValidatorFn } from "@angular/forms"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { buildCustomConfigFromState } from "../../../../util/customConfigBuilder"
import { State } from "../../../../state/angular-redux/state"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import {
	VisibleFilesBySelectionMode,
	visibleFilesBySelectionModeSelector
} from "../../customConfigList/visibleFilesBySelectionMode.selector"

@Component({
	template: require("./addCustomConfigDialog.component.html")
})
export class AddCustomConfigDialogComponent implements OnInit {
	customConfigName: FormControl

	constructor(
		@Inject(State) private state: State,
		@Inject(ThreeCameraService) private threeCameraService: ThreeCameraService,
		@Inject(ThreeOrbitControlsService) private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	ngOnInit(): void {
		const visibleFilesBySelectionMode = visibleFilesBySelectionModeSelector(this.state.getValue())
		this.customConfigName = new FormControl("", [Validators.required, createCustomConfigNameValidator(visibleFilesBySelectionMode)])
		this.customConfigName.setValue(CustomConfigHelper.getConfigNameSuggestionByFileState(visibleFilesBySelectionMode))
	}

	getErrorMessage() {
		if (this.customConfigName.hasError("required")) {
			return "Please enter a view name."
		}
		return this.customConfigName.hasError("Error") ? this.customConfigName.getError("Error") : ""
	}

	addCustomConfig() {
		const newCustomConfig = buildCustomConfigFromState(this.customConfigName.value, this.state.getValue(), {
			camera: this.threeCameraService.camera.position,
			cameraTarget: this.threeOrbitControlsService.controls.target
		})
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
