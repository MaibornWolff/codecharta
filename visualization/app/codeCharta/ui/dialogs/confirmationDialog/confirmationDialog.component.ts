import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
    selector: "cc-confirmation-dialog",
    templateUrl: "./confirmationDialog.component.html"
})
export class ConfirmationDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}
