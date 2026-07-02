import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import {
    removeFiles,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    setFiles,
    setStandard,
    switchReferenceAndComparison
} from "../../../fileStore/store/files.actions"
import { filesSelector, isDeltaStateSelector, referenceFileSelector } from "../selectors/navBar.selectors"

@Injectable({ providedIn: "root" })
export class FilesSelectionStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    files$ = this.store.select(filesSelector)
    referenceFile$ = this.store.select(referenceFileSelector)
    isDeltaState$ = this.store.select(isDeltaStateSelector)

    getCurrentFiles(): FileState[] {
        return filesSelector(this.state.getValue())
    }

    setStandard(files: CCFile[]) {
        this.store.dispatch(setStandard({ files }))
    }

    removeFiles(fileNames: string[]) {
        this.store.dispatch(removeFiles({ fileNames }))
    }

    setDelta(referenceFile: CCFile, comparisonFile?: CCFile) {
        this.store.dispatch(setDelta({ referenceFile, comparisonFile }))
    }

    setDeltaReference(file: CCFile) {
        this.store.dispatch(setDeltaReference({ file }))
    }

    setDeltaComparison(file: CCFile) {
        this.store.dispatch(setDeltaComparison({ file }))
    }

    switchReferenceAndComparison() {
        this.store.dispatch(switchReferenceAndComparison())
    }

    setFiles(value: FileState[]) {
        this.store.dispatch(setFiles({ value }))
    }
}
