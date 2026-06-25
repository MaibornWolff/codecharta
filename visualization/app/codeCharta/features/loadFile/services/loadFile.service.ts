import { Injectable, OnDestroy } from "@angular/core"
import { tap } from "rxjs"
import { clone } from "../../../util/clone"
import { CCFileValidationResult } from "../util/fileValidator"
import { FileState } from "../../../model/files/files"
import { NameDataPair } from "../../../codeCharta.api.model"
import { ErrorDialogService } from "../../../features/shared/components/errorDialog/errorDialog.service"
import { loadFilesValidationToErrorDialog } from "./loadFilesValidationToErrorDialog"
import { enrichFileStatesAndRecentFilesWithValidationResults } from "../util/fileParser"
import { fileRoot } from "../../../util/fileRoot"
import { LoadFileStore } from "../stores/loadFile.store"

export const NO_FILES_LOADED_ERROR_MESSAGE = "File(s) could not be loaded"
export const FILES_ALREADY_LOADED_ERROR_MESSAGE = "File(s) are already loaded"

@Injectable({ providedIn: "root" })
export class LoadFileService implements OnDestroy {
    referenceFileSubscription = this.loadFileStore.referenceFile$
        .pipe(
            tap(newReferenceFile => {
                if (newReferenceFile) {
                    fileRoot.updateRoot(newReferenceFile.map.name)
                }
            })
        )
        .subscribe()

    constructor(
        private readonly loadFileStore: LoadFileStore,
        private readonly errorDialogService: ErrorDialogService
    ) {}

    ngOnDestroy(): void {
        this.referenceFileSubscription.unsubscribe()
    }

    loadFiles(nameDataPairs: NameDataPair[]) {
        const fileStates: FileState[] = clone(this.loadFileStore.getFiles())
        const recentFiles: string[] = []
        const fileValidationResults: CCFileValidationResult[] = []

        const hasAddedAtLeastOneFile = enrichFileStatesAndRecentFilesWithValidationResults(
            fileStates,
            recentFiles,
            nameDataPairs,
            fileValidationResults,
            () => this.loadFileStore.getCurrentFilesAreSampleFiles(),
            () => this.loadFileStore.setCurrentFilesAreSampleFiles(false)
        )

        if (fileValidationResults.length > 0) {
            this.errorDialogService.open(loadFilesValidationToErrorDialog(fileValidationResults))
        }

        if (recentFiles.length === 0) {
            throw new Error(NO_FILES_LOADED_ERROR_MESSAGE)
        }

        this.loadFileStore.setFiles(fileStates)

        const recentFile = recentFiles[0]
        const rootName = this.loadFileStore.getFiles().find(f => f.file.fileMeta.fileName === recentFile).file.map.name
        this.loadFileStore.setStandardByNames(recentFiles)
        fileRoot.updateRoot(rootName)

        if (!hasAddedAtLeastOneFile) {
            throw new Error(FILES_ALREADY_LOADED_ERROR_MESSAGE)
        }
    }
}
