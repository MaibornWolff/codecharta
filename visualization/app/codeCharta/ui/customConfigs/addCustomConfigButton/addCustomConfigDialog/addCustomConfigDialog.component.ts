import "./addCustomDialog.component.scss"
import { Component } from "@angular/core"
import { FormControl, Validators } from "@angular/forms"

@Component({
	template: require("./addCustomConfigDialog.component.html")
})
export class AddCustomConfigDialogComponent {
	customConfigName = new FormControl("", [Validators.required, validateYolo])

	getErrorMessage() {
		if (this.customConfigName.hasError("required")) {
			return "Halt Stopp!"
		}
		return this.customConfigName.hasError("A") ? this.customConfigName.getError("A") : ""
	}
}

function validateYolo(control: FormControl) {
	const value = control.value
	if (value === "Yolo") return null
	return { A: "B" }
}
