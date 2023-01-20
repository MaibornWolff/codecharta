import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog"

@Component({
	templateUrl: "./errorDialog.component.html",
	encapsulation: ViewEncapsulation.None
})
export class ErrorDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}
