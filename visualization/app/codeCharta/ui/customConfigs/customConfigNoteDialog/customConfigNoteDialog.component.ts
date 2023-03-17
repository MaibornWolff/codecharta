import { Component, Input } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ManageCustomConfigNoteDialogComponent } from "./manageCustomConfigNoteDialog/manageCustomConfigNoteDialog.component"
import { CustomConfigItem } from "../customConfigs.component"
import { CustomConfigHelper } from "../../../util/customConfigHelper"

@Component({
	selector: "cc-custom-config-note-dialog",
	templateUrl: "./customConfigNoteDialog.component.html",
	styleUrls: ["./customConfigNoteDialog.component.scss"]
})
export class CustomConfigNoteDialogComponent {
	@Input() customConfigItem: CustomConfigItem

	customConfigNote: string

	constructor(public dialog: MatDialog) {}

	openDialog(): void {
		this.customConfigNote = this.customConfigItem.note

		const dialogReference = this.dialog.open(ManageCustomConfigNoteDialogComponent, {
			width: "600px",
			data: this.customConfigNote
		})

		dialogReference.afterClosed().subscribe(result => {
			if (result !== undefined) {
				this.customConfigNote = result
				CustomConfigHelper.editCustomConfigNode(this.customConfigItem.id, result)
			}
		})
	}
}
