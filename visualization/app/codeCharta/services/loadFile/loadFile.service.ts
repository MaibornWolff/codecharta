import { Injectable, OnDestroy } from "@angular/core"
import { tap } from "rxjs"
import { MatDialog } from "@angular/material/dialog"
import { clone } from "../../util/clone"
import { CCFileValidationResult } from "../../util/fileValidator"
import { setFiles, setStandardByNames } from "../../state/store/files/files.actions"
import { FileState } from "../../model/files/files"
import { NameDataPair, CcState } from "../../codeCharta.model"
import { referenceFileSelector } from "../../state/selectors/referenceFile/referenceFile.selector"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { loadFilesValidationToErrorDialog } from "../../util/loadFilesValidationToErrorDialog"
import { enrichFileStatesAndRecentFilesWithValidationResults } from "./fileParser"
import { fileRoot } from "./fileRoot"
import { Store, State } from "@ngrx/store"
import { setCurrentFilesAreSampleFiles } from "../../state/store/appStatus/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"

export const NO_FILES_LOADED_ERROR_MESSAGE = "File(s) could not be loaded"

@Injectable({ providedIn: "root" })
export class LoadFileService implements OnDestroy {
    static readonly CC_FILE_EXTENSION = ".cc.json"

    referenceFileSubscription = this.store
        .select(referenceFileSelector)
        .pipe(
            tap(newReferenceFile => {
                if (newReferenceFile) {
                    fileRoot.updateRoot(newReferenceFile.map.name)
                }
            })
        )
        .subscribe()

    constructor(
        private store: Store<CcState>,
        private state: State<CcState>,
        private dialog: MatDialog
    ) {}

    ngOnDestroy(): void {
        this.referenceFileSubscription.unsubscribe()
    }

    loadFiles(nameDataPairs: NameDataPair[]) {
        const fileStates: FileState[] = clone(this.state.getValue().files)
        const recentFiles: string[] = []
        const fileValidationResults: CCFileValidationResult[] = []

        enrichFileStatesAndRecentFilesWithValidationResults(
            fileStates,
            recentFiles,
            nameDataPairs,
            fileValidationResults,
            () => this.state.getValue().appStatus.currentFilesAreSampleFiles,
            () => this.store.dispatch(setCurrentFilesAreSampleFiles({ value: false }))
        )

        if (fileValidationResults.length > 0) {
            this.dialog.open(ErrorDialogComponent, {
                data: loadFilesValidationToErrorDialog(fileValidationResults)
            })
        }

        if (recentFiles.length === 0) {
            throw new Error(NO_FILES_LOADED_ERROR_MESSAGE)
        }

        this.store.dispatch(setFiles({ value: fileStates }))

        const recentFile = recentFiles[0]
        const rootName = this.state.getValue().files.find(f => f.file.fileMeta.fileName === recentFile).file.map.name
        this.store.dispatch(setStandardByNames({ fileNames: recentFiles }))
        fileRoot.updateRoot(rootName)
    }
}
