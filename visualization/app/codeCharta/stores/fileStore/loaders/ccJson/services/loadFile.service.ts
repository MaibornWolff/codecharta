import { Injectable } from "@angular/core"
import { NameDataPair } from "../../../../../model/codeCharta.api.model"
import { FileState } from "../../../../../model/files/files"
import { clone } from "../../../../../util/clone"
import { ErrorDialogService } from "../../../../../util/errorDialog/errorDialog.service"
import { fileRoot } from "../../../../../util/fileRoot"
import { FilesRepo } from "../../../repos/files.repo"
import { enrichFileStatesAndRecentFilesWithValidationResults } from "../util/fileParser"
import { CCFileValidationResult } from "../util/fileValidator"
import { loadFilesValidationToErrorDialog } from "./loadFilesValidationToErrorDialog"

export const NO_FILES_LOADED_ERROR_MESSAGE = "File(s) could not be loaded"
export const FILES_ALREADY_LOADED_ERROR_MESSAGE = "File(s) are already loaded"

@Injectable({ providedIn: "root" })
export class LoadFileService {
    constructor(
        private readonly filesRepo: FilesRepo,
        private readonly errorDialogService: ErrorDialogService
    ) {}

    loadFiles(nameDataPairs: NameDataPair[]) {
        const fileStates: FileState[] = clone(this.filesRepo.getFiles())
        const recentFiles: string[] = []
        const fileValidationResults: CCFileValidationResult[] = []

        const hasAddedAtLeastOneFile = enrichFileStatesAndRecentFilesWithValidationResults(
            fileStates,
            recentFiles,
            nameDataPairs,
            fileValidationResults,
            () => this.filesRepo.getCurrentFilesAreSampleFiles(),
            () => this.filesRepo.setCurrentFilesAreSampleFiles(false)
        )

        if (fileValidationResults.length > 0) {
            this.errorDialogService.open(loadFilesValidationToErrorDialog(fileValidationResults))
        }

        if (recentFiles.length === 0) {
            throw new Error(NO_FILES_LOADED_ERROR_MESSAGE)
        }

        this.filesRepo.setFiles(fileStates)

        const recentFile = recentFiles[0]
        const rootName = this.filesRepo.getFiles().find(f => f.file.fileMeta.fileName === recentFile).file.map.name
        this.filesRepo.setStandardByNames(recentFiles)
        fileRoot.updateRoot(rootName)

        if (!hasAddedAtLeastOneFile) {
            throw new Error(FILES_ALREADY_LOADED_ERROR_MESSAGE)
        }
    }
}
