import { Component } from "@angular/core"
import { FormControl, Validators } from "@angular/forms"

@Component({
	template: require("./addCustomConfigDialog.component.html")
})
export class AddCustomConfigDialogComponent {
	customConfigName = new FormControl("", [Validators.required, Validators.email])
}
