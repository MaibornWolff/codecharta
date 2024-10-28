import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog"
import { CdkScrollable } from "@angular/cdk/scrolling"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-confirmation-dialog",
    templateUrl: "./confirmationDialog.component.html",
    standalone: true,
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose]
})
export class ConfirmationDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}
