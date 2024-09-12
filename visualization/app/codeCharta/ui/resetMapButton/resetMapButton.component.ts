import { Component } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ConfirmResetMapDialogComponent } from "./confirmResetMapDialog/confirmResetMapDialog.component"

@Component({
    selector: "cc-reset-map-button",
    templateUrl: "./resetMapButton.component.html"
})
export class ResetMapButtonComponent {
    constructor(private dialog: MatDialog) {}

    showConfirmResetStateDialog() {
        this.dialog.open(ConfirmResetMapDialogComponent, { panelClass: "cc-confirm-reset-map-dialog" })
    }
}
