import { Component, Inject } from "@angular/core"
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogReference } from "@angular/material/legacy-dialog"

@Component({
	selector: "cc-manage-custom-config-note-dialog",
	templateUrl: "./manageCustomConfigNoteDialog.component.html",
	styleUrls: ["./manageCustomConfigNoteDialog.component.scss"]
})
export class ManageCustomConfigNoteDialogComponent {
	constructor(
		public dialogReference: MatDialogReference<ManageCustomConfigNoteDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: string
	) {}

	onNoClick(): void {
		this.dialogReference.close()
	}
}
