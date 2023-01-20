import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
	templateUrl: "./confirmationDialog.component.html",
	styleUrls: ["./confirmationDialog.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ConfirmationDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}
