import { Injectable, OnDestroy } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { pairwise, tap, filter } from "rxjs"
import { CcState } from "../../codeCharta.model"
import { FileSelectionState, FileState } from "../../model/files/files"
import { isDeltaState, isEqual } from "../../model/files/files.helper"
import { setDelta, setFiles } from "../../state/store/files/files.actions"
import { filesSelector } from "../../state/store/files/files.selector"

@Injectable()
export class FileSelectionModeService implements OnDestroy {
    lastSetFilesOfPreviousMode: FileState[] = []

    private subscription = this.store
        .select(filesSelector)
        .pipe(
            pairwise(),
            filter(([oldFiles, newFiles]) => isDeltaState(oldFiles) !== isDeltaState(newFiles) || newFiles.length === 0),
            tap(([oldFiles, newFiles]) => {
                this.lastSetFilesOfPreviousMode = newFiles.length === 0 ? newFiles : oldFiles
            })
        )
        .subscribe()

    constructor(
        private store: Store<CcState>,
        private state: State<CcState>
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
        const isCurrentlyStandardMode = this.lastSetFilesOfPreviousMode.length === 0 || isDeltaState(this.lastSetFilesOfPreviousMode)
        if (isCurrentlyStandardMode) {
            const existingFiles = filesSelector(this.state.getValue())
            this.lastSetFilesOfPreviousMode = this.filterNoneExisting(existingFiles, this.lastSetFilesOfPreviousMode)
            const referenceFile =
                this.lastSetFilesOfPreviousMode.find(file => file.selectedAs === FileSelectionState.Reference) ??
                existingFiles.find(file => file.selectedAs === FileSelectionState.Partial)
            const comparisonFile = this.lastSetFilesOfPreviousMode.find(file => file.selectedAs === FileSelectionState.Comparison)
            this.store.dispatch(setDelta({ referenceFile: referenceFile.file, comparisonFile: comparisonFile?.file }))
        } else {
            this.store.dispatch(setFiles({ value: this.lastSetFilesOfPreviousMode }))
        }
    }

    private filterNoneExisting(existingFileStates: FileState[], fileStates: FileState[]) {
        return fileStates.filter(fileState => existingFileStates.find(existingFileState => isEqual(existingFileState.file, fileState.file)))
    }
}
