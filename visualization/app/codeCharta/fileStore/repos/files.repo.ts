import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { FileState } from "../../model/files/files"
import { referenceFileSelector } from "../../state/selectors/referenceFile/referenceFile.selector"
import { setCurrentFilesAreSampleFiles } from "../../state/store/appStatus/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"
import { setFiles, setStandardByNames, visibleFileStatesSelector } from "../store/files.store"

/**
 * Data-access seam for the files slice. Absorbs the former `LoadFileStore`; the load pipeline and
 * later lenses read the files state through this repo instead of touching the raw store.
 */
@Injectable({ providedIn: "root" })
export class FilesRepo {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly referenceFile$ = this.store.select(referenceFileSelector)

    /** Forward-scaffolding for the metrics lens (step 4); no consumer this slice. */
    readonly visibleFileStates$ = this.store.select(visibleFileStatesSelector)

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
