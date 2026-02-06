import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { filesSelector } from "./files.selectors"
import {
    addFile,
    removeFiles,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    setFiles,
    setStandard,
    setStandardByNames,
    switchReferenceAndComparison
} from "./files.actions"

@Injectable({
    providedIn: "root"
})
export class FilesStore {
    constructor(private readonly store: Store<CcState>) {}

    files$ = this.store.select(filesSelector)

    setFiles(value: FileState[]) {
        this.store.dispatch(setFiles({ value }))
    }

    addFile(file: CCFile) {
        this.store.dispatch(addFile({ file }))
    }

    removeFiles(fileNames: string[]) {
        this.store.dispatch(removeFiles({ fileNames }))
    }

    setStandard(files: CCFile[]) {
        this.store.dispatch(setStandard({ files }))
    }

    setStandardByNames(fileNames: string[]) {
        this.store.dispatch(setStandardByNames({ fileNames }))
    }

    setDelta(referenceFile: CCFile, comparisonFile: CCFile) {
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
}
