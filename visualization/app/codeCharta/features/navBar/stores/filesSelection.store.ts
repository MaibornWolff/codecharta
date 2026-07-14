import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CCFile, CcState } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import {
    FileStoreReadWindow,
    FilesRepo,
    removeFiles,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    setFiles,
    setStandard,
    switchReferenceAndComparison
} from "../../../stores/fileStore/fileStore.facade"

@Injectable({ providedIn: "root" })
export class FilesSelectionStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly filesRepo: FilesRepo
    ) {}

    files$ = this.fileStoreReadWindow.files$
    referenceFile$ = this.fileStoreReadWindow.referenceFile$
    isDeltaState$ = this.fileStoreReadWindow.isDeltaState$

    getCurrentFiles(): FileState[] {
        return this.filesRepo.getFiles()
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
