import { Component, Input } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { CustomConfigNoteDialogComponent } from "./customConfigNoteDialog/customConfigNoteDialog.component"
import { CustomConfigItem } from "../customConfigs.component"
import { CustomConfigHelper } from "../../../util/customConfigHelper"

@Component({
    selector: "cc-custom-config-note-dialog-button",
    templateUrl: "./customConfigNoteDialogButton.component.html"
})
export class CustomConfigNoteDialogButtonComponent {
    @Input() customConfigItem: CustomConfigItem

    customConfigNote: string

    constructor(private dialog: MatDialog) {}

    openDialog(): void {
        this.customConfigNote = this.customConfigItem.note

        const dialogReference = this.dialog.open(CustomConfigNoteDialogComponent, {
            width: "600px",
            data: this.customConfigNote
        })

        dialogReference.afterClosed().subscribe(result => {
            if (result !== undefined && this.customConfigNote !== result) {
                this.customConfigNote = result
                CustomConfigHelper.editCustomConfigNote(this.customConfigItem.id, result)
            }
        })
    }
}
