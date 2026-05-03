import { Injectable, OnDestroy } from "@angular/core"
import { filter, pairwise, tap } from "rxjs"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { isDeltaState, isEqual } from "../../../model/files/files.helper"
import { FilesSelectionStore } from "../stores/filesSelection.store"

@Injectable({ providedIn: "root" })
export class FileSelectionModeService implements OnDestroy {
    lastSetFilesOfPreviousMode: FileState[] = []

    private subscription = this.filesSelectionStore.files$
        .pipe(
            pairwise(),
            filter(([oldFiles, newFiles]) => isDeltaState(oldFiles) !== isDeltaState(newFiles) || newFiles.length === 0),
            tap(([oldFiles, newFiles]) => {
                this.lastSetFilesOfPreviousMode = newFiles.length === 0 ? newFiles : oldFiles
            })
        )
        .subscribe()

    constructor(private readonly filesSelectionStore: FilesSelectionStore) {}

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
        const existingFiles = this.filesSelectionStore.getCurrentFiles()
        if (!isDeltaState(existingFiles)) {
            this.lastSetFilesOfPreviousMode = this.filterNoneExisting(existingFiles, this.lastSetFilesOfPreviousMode)
            const referenceFile =
                this.lastSetFilesOfPreviousMode.find(file => file.selectedAs === FileSelectionState.Reference) ??
                existingFiles.find(file => file.selectedAs === FileSelectionState.Partial)
            if (referenceFile === undefined) {
                return
            }
            const comparisonFile = this.lastSetFilesOfPreviousMode.find(file => file.selectedAs === FileSelectionState.Comparison)
            this.filesSelectionStore.setDelta(referenceFile.file, comparisonFile?.file)
            return
        }

        if (this.lastSetFilesOfPreviousMode.length > 0) {
            this.filesSelectionStore.setFiles(this.lastSetFilesOfPreviousMode)
            return
        }

        const referenceFile = existingFiles.find(file => file.selectedAs === FileSelectionState.Reference)?.file
        if (referenceFile !== undefined) {
            this.filesSelectionStore.setStandard([referenceFile])
        }
    }

    private filterNoneExisting(existingFileStates: FileState[], fileStates: FileState[]) {
        return fileStates.filter(fileState => existingFileStates.find(existingFileState => isEqual(existingFileState.file, fileState.file)))
    }
}
