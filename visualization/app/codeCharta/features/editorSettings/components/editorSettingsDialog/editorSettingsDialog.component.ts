import { Component, ElementRef, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { PreferredEditor } from "../../../../codeCharta.model"
import { PreferredEditorService } from "../../services/preferredEditor.service"
import { LocalFolderPathService } from "../../services/localFolderPath.service"

@Component({
    selector: "cc-editor-settings-dialog",
    templateUrl: "./editorSettingsDialog.component.html",
    imports: [FormsModule]
})
export class EditorSettingsDialogComponent {
    dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    preferredEditor = toSignal(this.preferredEditorService.preferredEditor$(), { requireSync: true })
    localFolderPath = toSignal(this.localFolderPathService.localFolderPath$(), { requireSync: true })

    PreferredEditor = PreferredEditor

    constructor(
        private readonly preferredEditorService: PreferredEditorService,
        private readonly localFolderPathService: LocalFolderPathService
    ) {}

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    handlePreferredEditorChanged(value: PreferredEditor) {
        this.preferredEditorService.setPreferredEditor(value)
    }

    handleLocalFolderPathChanged(value: string) {
        this.localFolderPathService.setLocalFolderPath(value)
    }
}
