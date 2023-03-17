import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

@Component({
	selector: "cc-manage-custom-config-note-dialog",
	templateUrl: "./manageCustomConfigNoteDialog.component.html",
	styleUrls: ["./manageCustomConfigNoteDialog.component.scss"]
})
export class ManageCustomConfigNoteDialogComponent {
	constructor(
		public dialogReference: MatDialogRef<ManageCustomConfigNoteDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: string
	) {}

	onNoClick(): void {
		this.dialogReference.close()
	}
}
