import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { LocalSourceService } from "../../services/localSource.service"
import { handLinkToTheSystem, mapNameOf, vscodeFileLink } from "../../services/localSourcePaths"

export interface EditorFolderRequest {
    mapFileName: string
    editorRootPath: string | null
    /** The file to open once the path is known; null when the path is only being set. */
    fileToOpen: string | null
}

@Component({
    selector: "cc-editor-folder-dialog",
    templateUrl: "./editorFolderDialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule]
})
export class EditorFolderDialogComponent {
    private readonly localSource = inject(LocalSourceService)
    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    readonly request = signal<EditorFolderRequest | null>(null)
    readonly editorRootPath = signal("")
    readonly mapName = computed(() => mapNameOf(this.request()?.mapFileName ?? ""))
    readonly fileName = computed(() => this.request()?.fileToOpen?.split("/").at(-1) ?? "")
    readonly confirmsKnownPath = computed(() => Boolean(this.request()?.fileToOpen && this.request()?.editorRootPath))

    ask(request: EditorFolderRequest) {
        this.request.set(request)
        this.editorRootPath.set(request.editorRootPath ?? "")
        this.dialog().nativeElement.showModal()
    }

    async confirm() {
        const request = this.request()
        const editorRootPath = this.editorRootPath().trim()
        if (!request || editorRootPath === "") {
            return
        }
        if (request.fileToOpen !== null) {
            handLinkToTheSystem(vscodeFileLink(editorRootPath, request.fileToOpen))
        }
        this.dialog().nativeElement.close()
        await this.localSource.saveEditorRootPath(request.mapFileName, editorRootPath)
    }
}
