import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ToastService } from "../../../shared/facade"
import { FOLDER_DOES_NOT_FIT_MAP_MESSAGE, reportFolderChoice } from "../../services/folderChoiceToast"
import { LocalSourceService, SourceLookup } from "../../services/localSource.service"
import { LocalSourceFolder } from "../../services/localSourceFolders.repository"
import { vscodeFileLink } from "../../services/localSourcePaths"
import { isTooLargeToShow, MAX_SHOWN_SIZE, sizeOf } from "../../services/sourceLimits"
import { SourceViewerComponent } from "../sourceViewer/sourceViewer.component"

interface TooLargeFile {
    nodePath: string
    relativePath: string
    size: string
}

interface PendingEditorOpen {
    folder: LocalSourceFolder
    relativePath: string
}

@Component({
    selector: "cc-local-source-actions",
    templateUrl: "./localSourceActions.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, SourceViewerComponent]
})
export class LocalSourceActionsComponent {
    private readonly localSource = inject(LocalSourceService)
    private readonly toast = inject(ToastService)

    private readonly viewer = viewChild.required(SourceViewerComponent)
    private readonly tooLargeDialog = viewChild.required<ElementRef<HTMLDialogElement>>("tooLargeDialog")
    private readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>("editorDialog")

    readonly isAvailable = this.localSource.isAvailable
    readonly tooLargeFile = signal<TooLargeFile | null>(null)
    readonly maxShownSize = MAX_SHOWN_SIZE
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
        const { file, relativePath } = lookup
        if (isTooLargeToShow(file.size)) {
            this.tooLargeFile.set({ nodePath, relativePath, size: sizeOf(file.size) })
            this.tooLargeDialog().nativeElement.showModal()
            return
        }
        await this.viewer().open({ nodePath, relativePath, text: await file.text(), bytes: file.size })
    }

    async openTooLargeFileInEditor(nodePath: string) {
        this.tooLargeDialog().nativeElement.close()
        await this.openInEditor(nodePath)
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
