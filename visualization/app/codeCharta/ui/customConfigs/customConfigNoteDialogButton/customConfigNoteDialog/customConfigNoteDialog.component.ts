import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

@Component({
	selector: "cc-custom-config-note-dialog",
	templateUrl: "./customConfigNoteDialog.component.html",
	styleUrls: ["./customConfigNoteDialog.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CustomConfigNoteDialogComponent {
	constructor(public dialogReference: MatDialogRef<CustomConfigNoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: string) {}

	onNoClick(): void {
		this.dialogReference.close()
	}
}
