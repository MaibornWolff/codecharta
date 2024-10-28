import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog"
import { CdkScrollable } from "@angular/cdk/scrolling"
import { MatFormField, MatLabel } from "@angular/material/form-field"
import { MatInput } from "@angular/material/input"
import { CdkTextareaAutosize } from "@angular/cdk/text-field"
import { FormsModule } from "@angular/forms"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-custom-config-note-dialog",
    templateUrl: "./customConfigNoteDialog.component.html",
    styleUrls: ["./customConfigNoteDialog.component.scss"],
    standalone: true,
    imports: [
        CdkScrollable,
        MatDialogContent,
        MatFormField,
        MatLabel,
        MatInput,
        CdkTextareaAutosize,
        FormsModule,
        MatDialogActions,
        MatButton,
        MatDialogClose
    ]
})
export class CustomConfigNoteDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
}
