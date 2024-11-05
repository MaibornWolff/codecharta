import { Component } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog/globalConfigurationDialog.component"
import { MatButton } from "@angular/material/button"
import { ActionIconComponent } from "../../actionIcon/actionIcon.component"

@Component({
    selector: "cc-global-configuration-button",
    templateUrl: "./globalConfigurationButton.component.html",
    styleUrls: ["./globalConfigurationButton.component.scss"],
    standalone: true,
    imports: [MatButton, ActionIconComponent]
})
export class GlobalConfigurationButtonComponent {
    constructor(private dialog: MatDialog) {}

    showGlobalConfiguration() {
        this.dialog.open(GlobalConfigurationDialogComponent, {
            panelClass: "cc-global-configuration-dialog"
        })
    }
}
