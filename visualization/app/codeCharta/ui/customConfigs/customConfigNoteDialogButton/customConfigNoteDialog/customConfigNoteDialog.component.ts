import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
    selector: "cc-custom-config-note-dialog",
    templateUrl: "./customConfigNoteDialog.component.html",
    styleUrls: ["./customConfigNoteDialog.component.scss"]
})
export class CustomConfigNoteDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
}
