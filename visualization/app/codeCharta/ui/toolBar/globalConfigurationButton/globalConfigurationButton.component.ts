import { Component, ViewEncapsulation } from "@angular/core"
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog/globalConfigurationDialog.component"

@Component({
	selector: "cc-global-configuration-button",
	templateUrl: "./globalConfigurationButton.component.html",
	styleUrls: ["./globalConfigurationButton.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class GlobalConfigurationButtonComponent {
	constructor(private dialog: MatDialog) {}

	showGlobalConfiguration() {
		this.dialog.open(GlobalConfigurationDialogComponent, {
			panelClass: "cc-global-configuration-dialog"
		})
	}
}
