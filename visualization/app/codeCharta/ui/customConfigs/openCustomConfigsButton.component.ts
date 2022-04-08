import { Component, Inject } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"

@Component({
	selector: "cc-open-custom-configs-button",
	template: require("./openCustomConfigsButton.component.html")
})
export class OpenCustomConfigsButtonComponent {
	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	openCustomConfigDialog() {
		this.dialog.open(CustomConfigListComponent, {
			panelClass: "cc-custom-config-list"
		})
	}
}
