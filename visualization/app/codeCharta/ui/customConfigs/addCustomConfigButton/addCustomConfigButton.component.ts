import { Component, ViewEncapsulation } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog/addCustomConfigDialog.component"

@Component({
    selector: "cc-add-custom-config-button",
    templateUrl: "./addCustomConfigButton.component.html",
    encapsulation: ViewEncapsulation.None
})
export class AddCustomConfigButtonComponent {
    constructor(private dialog: MatDialog) {}

    showAddCustomConfigDialog() {
        this.dialog.open(AddCustomConfigDialogComponent, { panelClass: "cc-add-custom-config-dialog" })
    }
}
