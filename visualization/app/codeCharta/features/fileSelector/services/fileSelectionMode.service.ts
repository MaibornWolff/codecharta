import { Injectable, OnDestroy } from "@angular/core"
import { State } from "@ngrx/store"
import { pairwise, tap, filter } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { isDeltaState, isEqual } from "../../../model/files/files.helper"
import { FilesStore } from "../stores/files.store"
import { filesSelector } from "../stores/files.selectors"

@Injectable({ providedIn: "root" })
export class FileSelectionModeService implements OnDestroy {
    lastSetFilesOfPreviousMode: FileState[] = []

    private subscription = this.filesStore.files$
        .pipe(
            pairwise(),
            filter(([oldFiles, newFiles]) => isDeltaState(oldFiles) !== isDeltaState(newFiles) || newFiles.length === 0),
            tap(([oldFiles, newFiles]) => {
                this.lastSetFilesOfPreviousMode = newFiles.length === 0 ? newFiles : oldFiles
            })
        )
        .subscribe()

    constructor(
        private readonly filesStore: FilesStore,
        private readonly state: State<CcState>
    ) {}

    ngOnDestroy(): void {
        this.subscription.unsubscribe()
    }

    /** Toggles selection mode between "Standard" and "Delta".
     * If available it restores the last set selected files of new mode.
     * When it switches to delta mode and there is no reference
     * file selected, it sets the first selected file as reference as there
     * must be a reference file for anything being rendered at all.
     */
    toggle() {
        const existingFiles = filesSelector(this.state.getValue())
        const isCurrentlyDeltaMode = isDeltaState(existingFiles)

        if (isCurrentlyDeltaMode) {
            // Switch to standard mode - restore previous standard selection or select all as Partial
            if (this.lastSetFilesOfPreviousMode.length > 0 && !isDeltaState(this.lastSetFilesOfPreviousMode)) {
                const validFiles = this.filterNoneExisting(existingFiles, this.lastSetFilesOfPreviousMode)
                if (validFiles.length > 0) {
                    this.filesStore.setFiles(validFiles)
                    return
                }
            }
            // Fallback: select all files as Partial (standard mode)
            const allAsPartial = existingFiles.map(f => f.file)
            this.filesStore.setStandard(allAsPartial)
        } else {
            // Switch to delta mode - use first file as reference
            const referenceFile = existingFiles.find(file => file.selectedAs === FileSelectionState.Partial)
            if (!referenceFile) {
                return
            }
            this.filesStore.setDelta(referenceFile.file, undefined)
        }
    }

    private filterNoneExisting(existingFileStates: FileState[], fileStates: FileState[]) {
        return fileStates.filter(fileState => existingFileStates.find(existingFileState => isEqual(existingFileState.file, fileState.file)))
    }
}
