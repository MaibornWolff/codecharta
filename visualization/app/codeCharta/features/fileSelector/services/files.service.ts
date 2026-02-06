import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { FilesStore } from "../stores/files.store"
import { pictogramBackgroundSelector } from "../stores/pictogramBackground.selector"

@Injectable({
    providedIn: "root"
})
export class FilesService {
    constructor(
        private readonly filesStore: FilesStore,
        private readonly store: Store<CcState>
    ) {}

    files$() {
        return this.filesStore.files$
    }

    setFiles(value: FileState[]) {
        this.filesStore.setFiles(value)
    }

    addFile(file: CCFile) {
        this.filesStore.addFile(file)
    }

    removeFiles(fileNames: string[]) {
        this.filesStore.removeFiles(fileNames)
    }

    setStandard(files: CCFile[]) {
        this.filesStore.setStandard(files)
    }

    setStandardByNames(fileNames: string[]) {
        this.filesStore.setStandardByNames(fileNames)
    }

    setDelta(referenceFile: CCFile, comparisonFile: CCFile) {
        this.filesStore.setDelta(referenceFile, comparisonFile)
    }

    setDeltaReference(file: CCFile) {
        this.filesStore.setDeltaReference(file)
    }

    setDeltaComparison(file: CCFile) {
        this.filesStore.setDeltaComparison(file)
    }

    switchReferenceAndComparison() {
        this.filesStore.switchReferenceAndComparison()
    }

    pictogramBackground$() {
        return this.store.select(pictogramBackgroundSelector)
    }
}
