import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ToastService } from "../../../shared/facade"
import { FOLDER_DOES_NOT_FIT_MAP_MESSAGE, reportFolderChoice } from "../../services/folderChoiceToast"
import { LocalSourceService, SourceLookup } from "../../services/localSource.service"
import { LocalSourceFolder } from "../../services/localSourceFolders.repository"
import { vscodeFileLink } from "../../services/localSourcePaths"

interface ShownSource {
    relativePath: string
    lineNumbers: string
    text: string
}

interface PendingEditorOpen {
    folder: LocalSourceFolder
    relativePath: string
}

@Component({
    selector: "cc-local-source-actions",
    templateUrl: "./localSourceActions.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule]
})
export class LocalSourceActionsComponent {
    private readonly localSource = inject(LocalSourceService)
    private readonly toast = inject(ToastService)

    private readonly sourceDialog = viewChild.required<ElementRef<HTMLDialogElement>>("sourceDialog")
    private readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>("editorDialog")

    readonly isSupported = this.localSource.isSupported
    readonly shownSource = signal<ShownSource | null>(null)
    readonly pendingEditorOpen = signal<PendingEditorOpen | null>(null)
    readonly editorRootPath = signal("")

    isMapRoot(nodePath: string): boolean {
        return this.localSource.isMapRoot(nodePath)
    }

    async showSource(nodePath: string) {
        const lookup = await this.findSource(nodePath)
        if (lookup?.status !== "found") {
            return
        }
        const text = await lookup.file.text()
        const lineCount = text.replace(/\n$/, "").split("\n").length
        this.shownSource.set({
            relativePath: lookup.relativePath,
            lineNumbers: Array.from({ length: lineCount }, (_, index) => index + 1).join("\n"),
            text
        })
        this.sourceDialog().nativeElement.showModal()
    }

    async openInEditor(nodePath: string) {
        const lookup = await this.findSource(nodePath)
        if (lookup?.status !== "found") {
            return
        }
        const { folder, relativePath } = lookup
        // Browsers only hand a link to the editor while the click that asked for it is fresh; after a picker or
        // a permission prompt it is not, so the dialog's Open button supplies a new click.
        if (folder.editorRootPath && navigator.userActivation?.isActive) {
            this.openLink(folder.editorRootPath, relativePath)
            return
        }
        this.pendingEditorOpen.set({ folder, relativePath })
        this.editorRootPath.set(folder.editorRootPath ?? "")
        this.editorDialog().nativeElement.showModal()
    }

    async chooseFolder(nodePath: string) {
        reportFolderChoice(this.toast, await this.localSource.chooseFolder(nodePath))
    }

    async confirmEditorRootPath() {
        const pending = this.pendingEditorOpen()
        const editorRootPath = this.editorRootPath().trim()
        if (!pending || editorRootPath === "") {
            return
        }
        this.openLink(editorRootPath, pending.relativePath)
        this.editorDialog().nativeElement.close()
        await this.localSource.saveEditorRootPath(pending.folder, editorRootPath)
    }

    private async findSource(nodePath: string): Promise<SourceLookup | null> {
        try {
            const lookup = await this.localSource.findSource(nodePath)
            if (lookup.status === "notFound") {
                this.toast.show(`"${lookup.relativePath}" is not in the chosen folder`, "warning")
            } else if (lookup.status === "doesNotFitMap") {
                this.toast.show(FOLDER_DOES_NOT_FIT_MAP_MESSAGE, "warning")
            }
            return lookup
        } catch (error) {
            this.toast.show(`Could not read the local folder: ${(error as Error).message}`, "error")
            return null
        }
    }

    private openLink(editorRootPath: string, relativePath: string) {
        window.open(vscodeFileLink(editorRootPath, relativePath), "_blank")
    }
}
