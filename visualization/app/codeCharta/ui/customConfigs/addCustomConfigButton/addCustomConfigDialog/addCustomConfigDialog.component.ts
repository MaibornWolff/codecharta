import "./addCustomDialog.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { FormControl, Validators, AbstractControl, ValidatorFn } from "@angular/forms"
import { CustomConfigFileStateConnector } from "../../customConfigFileStateConnector"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { filesSelector } from "../../../../state/store/files/files.selector"
import { buildCustomConfigFromState } from "../../../../util/customConfigBuilder"
import { State } from "../../../../state/angular-redux/state"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsServiceToken } from "../../../../services/ajs-upgraded-providers"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControlsService"

@Component({
	template: require("./addCustomConfigDialog.component.html")
})
export class AddCustomConfigDialogComponent implements OnInit {
	customConfigFileStateConnector: CustomConfigFileStateConnector
	customConfigName: FormControl

	constructor(
		@Inject(State) private state: State,
		@Inject(ThreeCameraService) private threeCameraService: ThreeCameraService,
		@Inject(ThreeOrbitControlsServiceToken) private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	ngOnInit(): void {
		const files = filesSelector(this.state.getValue())
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(files)
		this.customConfigName = new FormControl("", [
			Validators.required,
			createCustomConfigNameValidator(this.customConfigFileStateConnector)
		])
		this.customConfigName.setValue(CustomConfigHelper.getConfigNameSuggestionByFileState(this.customConfigFileStateConnector))
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

function createCustomConfigNameValidator(customConfigFileStateConnector: CustomConfigFileStateConnector): ValidatorFn {
	return (control: AbstractControl): { Error: string } => {
		const value = control.value
		if (
			!CustomConfigHelper.hasCustomConfigByName(
				customConfigFileStateConnector.getMapSelectionMode(),
				customConfigFileStateConnector.getSelectedMaps(),
				value
			)
		) {
			return null
		}
		return { Error: "A Custom View with this name already exists." }
	}
}
