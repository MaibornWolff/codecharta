import "./addCustomConfig.component.scss"
import { Component, Inject } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog/addCustomConfigDialog.component"

@Component({
	selector: "cc-add-custom-config-button",
	template: require("./addCustomConfigButton.component.html")
})
export class AddCustomConfigButtonComponent {
	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	showAddCustomConfigDialog() {
		this.dialog.open(AddCustomConfigDialogComponent, { panelClass: "cc-add-custom-config-dialog" })
	}
}
