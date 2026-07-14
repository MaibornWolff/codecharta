import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import { areMultipleMapsVisibleSelector } from "./areMultipleMapsVisible.selector"
import { filesSelector } from "./files.selector"
import { isDeltaStateSelector } from "./isDeltaState.selector"
import { isLoadingFileSelector } from "./isLoadingFile/isLoadingFile.selector"
import { referenceFileSelector } from "./referenceFile.selector"
import { visibleFileStatesSelector } from "./visibleFileStates.selector"

@Injectable({
    providedIn: "root"
})
export class FileStoreReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly files$ = this.store.select(filesSelector)
    readonly visibleFileStates$ = this.store.select(visibleFileStatesSelector)
    readonly referenceFile$ = this.store.select(referenceFileSelector)
    readonly areMultipleMapsVisible$ = this.store.select(areMultipleMapsVisibleSelector)
    readonly isDeltaState$ = this.store.select(isDeltaStateSelector)
    readonly isLoadingFile$ = this.store.select(isLoadingFileSelector)

    getFiles(): FileState[] {
        return this.state.getValue().files
    }

    getVisibleFileStates() {
        return visibleFileStatesSelector(this.state.getValue())
    }

    getReferenceFile() {
        return referenceFileSelector(this.state.getValue())
    }

    getCurrentFilesAreSampleFiles(): boolean {
        return this.state.getValue().currentFilesAreSampleFiles
    }
}
