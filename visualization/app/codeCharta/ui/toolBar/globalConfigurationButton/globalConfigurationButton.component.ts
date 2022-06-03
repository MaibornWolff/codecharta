import "./globalConfigurationButton.component.scss"
import { Component, Inject } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog/globalConfigurationDialog.component"

@Component({
	selector: "cc-global-configuration-button",
	template: require("./globalConfigurationButton.component.html")
})
export class GlobalConfigurationButtonComponent {
	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	showGlobalConfiguration() {
		this.dialog.open(GlobalConfigurationDialogComponent, {
			panelClass: "cc-global-configuration-dialog"
		})
	}
}
