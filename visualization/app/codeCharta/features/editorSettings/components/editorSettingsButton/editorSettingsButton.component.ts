import { Component, viewChild } from "@angular/core"
import { EditorSettingsDialogComponent } from "../editorSettingsDialog/editorSettingsDialog.component"
import { ActionIconComponent } from "../../../../ui/actionIcon/actionIcon.component"

@Component({
    selector: "cc-editor-settings-button",
    templateUrl: "./editorSettingsButton.component.html",
    styleUrl: "./editorSettingsButton.component.scss",
    imports: [EditorSettingsDialogComponent, ActionIconComponent]
})
export class EditorSettingsButtonComponent {
    dialog = viewChild.required<EditorSettingsDialogComponent>("editorSettingsDialog")

    showEditorSettings() {
        this.dialog().open()
    }
}
