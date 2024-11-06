import { Component } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ConfirmResetMapDialogComponent } from "./confirmResetMapDialog/confirmResetMapDialog.component"
import { ActionIconComponent } from "../actionIcon/actionIcon.component"

@Component({
    selector: "cc-reset-map-button",
    templateUrl: "./resetMapButton.component.html",
    standalone: true,
    imports: [ActionIconComponent]
})
export class ResetMapButtonComponent {
    constructor(private dialog: MatDialog) {}

    showConfirmResetStateDialog() {
        this.dialog.open(ConfirmResetMapDialogComponent, { panelClass: "cc-confirm-reset-map-dialog" })
    }
}
