import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog/addCustomConfigDialog.component"

@Component({
	selector: "cc-add-custom-config-button",
	templateUrl: "./addCustomConfigButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class AddCustomConfigButtonComponent {
	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	showAddCustomConfigDialog() {
		this.dialog.open(AddCustomConfigDialogComponent, { panelClass: "cc-add-custom-config-dialog" })
	}
}
