import { Component, Input, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, PreferredEditor } from "../../../codeCharta.model"
import { EditorSettingsFacade } from "../../../features/editorSettings/facade"
import { EditorSettingsDialogComponent } from "../../../features/editorSettings/components/editorSettingsDialog/editorSettingsDialog.component"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-open-in-editor-button",
    templateUrl: "./openInEditorButton.component.html",
    styleUrls: ["../nodeContextMenuButton.component.scss"],
    imports: [MatButton, EditorSettingsDialogComponent]
})
export class OpenInEditorButtonComponent {
    @Input() codeMapNode: Pick<CodeMapNode, "path">

    settingsDialog = viewChild.required<EditorSettingsDialogComponent>("settingsDialog")

    preferredEditor = toSignal(this.editorSettingsFacade.preferredEditor$(), { requireSync: true })
    localFolderPath = toSignal(this.editorSettingsFacade.localFolderPath$(), { requireSync: true })

    constructor(private readonly editorSettingsFacade: EditorSettingsFacade) {}

    openInEditor() {
        const folderPath = this.localFolderPath()

        if (!folderPath) {
            this.settingsDialog().open()
            return
        }

        const localPath = this.buildLocalPath(this.codeMapNode.path, folderPath)
        const editorUrl = this.buildEditorUrl(this.preferredEditor(), localPath)

        window.open(editorUrl, "_blank")
    }

    private buildLocalPath(nodePath: string, folderPath: string): string {
        const pathWithoutRoot = nodePath.replace(/^\/root\/?/, "")
        const normalizedFolderPath = folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath

        return `${normalizedFolderPath}/${pathWithoutRoot}`
    }

    private buildEditorUrl(editor: PreferredEditor, localPath: string): string {
        if (editor === PreferredEditor.IntelliJ) {
            return `idea://open?file=${encodeURIComponent(localPath)}`
        }
        return `vscode://file${localPath}`
    }
}
