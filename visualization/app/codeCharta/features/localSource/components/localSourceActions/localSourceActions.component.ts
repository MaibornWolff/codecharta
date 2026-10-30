import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from "@angular/core"
import { ToastService } from "../../../shared/facade"
import { FOLDER_DOES_NOT_FIT_MAP_MESSAGE, reportFolderChoice } from "../../services/folderChoiceToast"
import { handLinkToTheSystem } from "../../services/handLinkToTheSystem"
import { EditorTarget, LocalSourceService, SourceLookup } from "../../services/localSource.service"
import { mapNameOf, vscodeFileLink } from "../../services/localSourcePaths"
import { READING_FAILED, reportingFailure } from "../../services/reportingFailure"
import { decodeSource } from "../../services/sourceDecoding"
import { isTooLargeToShow, MAX_SHOWN_SIZE, sizeOf } from "../../services/sourceLimits"
import { EditorFolderDialogComponent } from "../editorFolderDialog/editorFolderDialog.component"
import { SourceViewerComponent } from "../sourceViewer/sourceViewer.component"

interface NotShownFile {
    nodePath: string
    relativePath: string
    reason: string
}

interface FolderRequest {
    nodePath: string
    mapName: string
    relativePath: string
    missingFrom: string | null
    problem: string | null
}

type StillWanted = () => boolean

const NOT_A_TEXT_FILE = "This file is not a text file, so it can't be shown here."

@Component({
    selector: "cc-local-source-actions",
    templateUrl: "./localSourceActions.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EditorFolderDialogComponent, SourceViewerComponent]
})
export class LocalSourceActionsComponent {
    private readonly localSource = inject(LocalSourceService)
    private readonly toast = inject(ToastService)
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
    private latestRequest = 0

    private readonly viewer = viewChild.required(SourceViewerComponent)
    private readonly notShownDialog = viewChild.required<ElementRef<HTMLDialogElement>>("notShownDialog")
    private readonly folderDialog = viewChild.required<ElementRef<HTMLDialogElement>>("folderDialog")
    private readonly editorFolderDialog = viewChild.required(EditorFolderDialogComponent)

    readonly isAvailable = this.localSource.isAvailable
    readonly folderRequest = signal<FolderRequest | null>(null)
    readonly notShownFile = signal<NotShownFile | null>(null)

    isMapRoot(nodePath: string): boolean {
        return this.localSource.isMapRoot(nodePath)
    }

    async showSource(nodePath: string) {
        const isStillWanted = this.beginRequest()
        const lookup = await this.reportingProblems(() => this.localSource.findSource(nodePath))
        if (!isStillWanted()) {
            return
        }
        if (lookup?.status === "folderNeeded") {
            const { mapFileName, relativePath, missingFrom } = lookup
            this.folderRequest.set({ nodePath, mapName: mapNameOf(mapFileName), relativePath, missingFrom, problem: null })
            this.folderDialog().nativeElement.showModal()
        } else if (lookup?.status === "found") {
            await this.show(nodePath, lookup.relativePath, lookup.file, isStillWanted)
        }
    }

    async selectFolder(nodePath: string) {
        const isStillWanted = this.beginRequest()
        const lookup = await reportingFailure(this.toast, READING_FAILED, () => this.localSource.chooseFolderAndFindSource(nodePath))
        if (!isStillWanted() || lookup?.status === "cancelled") {
            return
        }
        const problem = folderProblemOf(lookup)
        if (problem) {
            this.folderRequest.update(request => request && { ...request, problem })
            return
        }
        this.folderDialog().nativeElement.close()
        if (lookup?.status === "found") {
            await this.show(nodePath, lookup.relativePath, lookup.file, isStillWanted)
        }
    }

    private async show(nodePath: string, relativePath: string, file: File, isStillWanted: StillWanted) {
        if (isTooLargeToShow(file.size)) {
            this.explainNotShown({
                nodePath,
                relativePath,
                reason: `This file is ${sizeOf(file.size)}, too large to show here (at most ${MAX_SHOWN_SIZE}).`
            })
            return
        }
        const bytes = await reportingFailure(this.toast, READING_FAILED, () => file.arrayBuffer())
        if (!bytes || !isStillWanted()) {
            return
        }
        const decoded = decodeSource(new Uint8Array(bytes))
        if (!decoded) {
            this.explainNotShown({ nodePath, relativePath, reason: NOT_A_TEXT_FILE })
            return
        }
        await this.viewer().open({ nodePath, relativePath, ...decoded, bytes: file.size })
    }

    private explainNotShown(file: NotShownFile) {
        this.notShownFile.set(file)
        this.notShownDialog().nativeElement.showModal()
    }

    async openNotShownFileInEditor(nodePath: string) {
        this.notShownDialog().nativeElement.close()
        await this.openInEditor(nodePath)
    }

    async openInEditor(nodePath: string) {
        const isStillWanted = this.beginRequest()
        const target = await this.findEditorTarget(nodePath)
        if (!target || !isStillWanted()) {
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
        const isStillWanted = this.beginRequest()
        const target = await this.findEditorTarget(nodePath)
        if (target && isStillWanted()) {
            this.editorFolderDialog().ask({ mapFileName: target.mapFileName, editorRootPath: target.editorRootPath, fileToOpen: null })
        }
    }

    async chooseFolder(nodePath: string) {
        const choice = await reportingFailure(this.toast, READING_FAILED, () => this.localSource.chooseFolder(nodePath))
        if (choice) {
            reportFolderChoice(this.toast, choice)
        }
    }

    /** A browser's permission prompt leaves the page usable, so a newer request or a change of view can overtake this one. */
    private beginRequest(): StillWanted {
        this.latestRequest += 1
        const request = this.latestRequest
        return () => request === this.latestRequest && this.host.nativeElement.isConnected
    }

    private async reportingProblems(findSource: () => Promise<SourceLookup>): Promise<SourceLookup | null> {
        const lookup = await reportingFailure(this.toast, READING_FAILED, findSource)
        if (lookup?.status === "notFound") {
            this.toast.show(`"${lookup.relativePath}" is not in the chosen folder`, "warning")
        } else if (lookup?.status === "doesNotFitMap") {
            this.toast.show(FOLDER_DOES_NOT_FIT_MAP_MESSAGE, "warning")
        }
        return lookup
    }

    private findEditorTarget(nodePath: string): Promise<EditorTarget | null> {
        return reportingFailure(this.toast, READING_FAILED, () => this.localSource.editorTargetOf(nodePath))
    }
}

function folderProblemOf(lookup: SourceLookup | null): string | null {
    if (lookup?.status === "doesNotFitMap") {
        return FOLDER_DOES_NOT_FIT_MAP_MESSAGE
    }
    return lookup?.status === "notFound" ? `"${lookup.relativePath}" is not in the chosen folder` : null
}
