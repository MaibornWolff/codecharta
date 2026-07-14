import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CCFile, CcState } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import {
    removeFiles,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    setFiles,
    setIsLoadingFile,
    setStandard,
    switchReferenceAndComparison
} from "../../../stores/fileStore/fileStore.facade"
import { setIsLoadingMap } from "../../../stores/mapState/mapState.write.facade"

@Injectable({ providedIn: "root" })
export class NavBarWriteStore {
    constructor(private readonly store: Store<CcState>) {}

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

    setLoadingFile(value: boolean) {
        this.store.dispatch(setIsLoadingFile({ value }))
    }

    setLoadingMap(value: boolean) {
        this.store.dispatch(setIsLoadingMap({ value }))
    }
}
