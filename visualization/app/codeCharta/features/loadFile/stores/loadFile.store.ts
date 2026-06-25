import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { referenceFileSelector } from "../../../state/selectors/referenceFile/referenceFile.selector"
import { setFiles, setStandardByNames } from "../../../state/store/files/files.actions"
import { setCurrentFilesAreSampleFiles } from "../../../state/store/appStatus/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"

@Injectable({ providedIn: "root" })
export class LoadFileStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly referenceFile$ = this.store.select(referenceFileSelector)

    getFiles(): FileState[] {
        return this.state.getValue().files
    }

    getCurrentFilesAreSampleFiles(): boolean {
        return this.state.getValue().appStatus.currentFilesAreSampleFiles
    }

    setFiles(value: FileState[]) {
        this.store.dispatch(setFiles({ value }))
    }

    setStandardByNames(fileNames: string[]) {
        this.store.dispatch(setStandardByNames({ fileNames }))
    }

    setCurrentFilesAreSampleFiles(value: boolean) {
        this.store.dispatch(setCurrentFilesAreSampleFiles({ value }))
    }
}
