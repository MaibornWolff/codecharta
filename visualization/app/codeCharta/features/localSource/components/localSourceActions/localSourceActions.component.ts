import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from "@angular/core"
import { ToastService } from "../../../shared/facade"
import { FOLDER_DOES_NOT_FIT_MAP_MESSAGE, reportFolderChoice } from "../../services/folderChoiceToast"
import { EditorTarget, LocalSourceService, SourceLookup } from "../../services/localSource.service"
import { handLinkToTheSystem, mapNameOf, vscodeFileLink } from "../../services/localSourcePaths"
import { isTooLargeToShow, MAX_SHOWN_SIZE, sizeOf } from "../../services/sourceLimits"
import { EditorFolderDialogComponent } from "../editorFolderDialog/editorFolderDialog.component"
import { SourceViewerComponent } from "../sourceViewer/sourceViewer.component"

interface TooLargeFile {
    nodePath: string
    relativePath: string
    size: string
}

interface FolderRequest {
    nodePath: string
    mapName: string
    relativePath: string
    missingFrom: string | null
}

@Component({
    selector: "cc-local-source-actions",
    templateUrl: "./localSourceActions.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EditorFolderDialogComponent, SourceViewerComponent]
})
export class LocalSourceActionsComponent {
    private readonly localSource = inject(LocalSourceService)
    private readonly toast = inject(ToastService)

    private readonly viewer = viewChild.required(SourceViewerComponent)
    private readonly tooLargeDialog = viewChild.required<ElementRef<HTMLDialogElement>>("tooLargeDialog")
    private readonly folderDialog = viewChild.required<ElementRef<HTMLDialogElement>>("folderDialog")
    private readonly editorFolderDialog = viewChild.required(EditorFolderDialogComponent)

    readonly isAvailable = this.localSource.isAvailable
    readonly folderRequest = signal<FolderRequest | null>(null)
    readonly tooLargeFile = signal<TooLargeFile | null>(null)
    readonly maxShownSize = MAX_SHOWN_SIZE

    isMapRoot(nodePath: string): boolean {
        return this.localSource.isMapRoot(nodePath)
    }

    async showSource(nodePath: string) {
        const lookup = await this.reportingProblems(() => this.localSource.findSource(nodePath))
        if (lookup?.status === "folderNeeded") {
            const { mapFileName, relativePath, missingFrom } = lookup
            this.folderRequest.set({ nodePath, mapName: mapNameOf(mapFileName), relativePath, missingFrom })
            this.folderDialog().nativeElement.showModal()
        } else if (lookup?.status === "found") {
            await this.show(nodePath, lookup.relativePath, lookup.file)
        }
    }

    async selectFolder(nodePath: string) {
        this.folderDialog().nativeElement.close()
        const lookup = await this.reportingProblems(() => this.localSource.chooseFolderAndFindSource(nodePath))
        if (lookup?.status === "found") {
            await this.show(nodePath, lookup.relativePath, lookup.file)
        }
    }

    private async show(nodePath: string, relativePath: string, file: File) {
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
        const target = await this.findEditorTarget(nodePath)
        if (!target) {
            return
        }
        const { mapFileName, relativePath, editorRootPath } = target
        // Browsers only hand a link to the editor while the click that asked for it is fresh, so a stale one
        // is renewed by the dialog's button.
        if (editorRootPath && navigator.userActivation?.isActive) {
            handLinkToTheSystem(vscodeFileLink(editorRootPath, relativePath))
            return
        }
        this.editorFolderDialog().ask({ mapFileName, editorRootPath, fileToOpen: relativePath })
    }

    async setEditorFolder(nodePath: string) {
        const target = await this.findEditorTarget(nodePath)
        if (target) {
            this.editorFolderDialog().ask({ mapFileName: target.mapFileName, editorRootPath: target.editorRootPath, fileToOpen: null })
        }
    }

    async chooseFolder(nodePath: string) {
        reportFolderChoice(this.toast, await this.localSource.chooseFolder(nodePath))
    }

    private async reportingProblems(findSource: () => Promise<SourceLookup>): Promise<SourceLookup | null> {
        try {
            const lookup = await findSource()
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

    private async findEditorTarget(nodePath: string): Promise<EditorTarget | null> {
        try {
            return await this.localSource.editorTargetOf(nodePath)
        } catch (error) {
            this.toast.show(`Could not read the local folder: ${(error as Error).message}`, "error")
            return null
        }
    }
}
