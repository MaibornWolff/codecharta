import { Injectable } from "@angular/core"
import { FilesService } from "./services/files.service"
import { FileSelectionModeService } from "./services/fileSelectionMode.service"
import { CCFile } from "../../codeCharta.model"
import { FileState } from "../../model/files/files"

// Re-export selector for external consumption
export { filesSelector } from "./stores/files.selectors"

@Injectable({
    providedIn: "root"
})
export class FileSelectorFacade {
    constructor(
        private readonly filesService: FilesService,
        private readonly fileSelectionModeService: FileSelectionModeService
    ) {}

    files$() {
        return this.filesService.files$()
    }

    setFiles(value: FileState[]) {
        this.filesService.setFiles(value)
    }

    addFile(file: CCFile) {
        this.filesService.addFile(file)
    }

    removeFiles(fileNames: string[]) {
        this.filesService.removeFiles(fileNames)
    }

    setStandard(files: CCFile[]) {
        this.filesService.setStandard(files)
    }

    setStandardByNames(fileNames: string[]) {
        this.filesService.setStandardByNames(fileNames)
    }

    setDelta(referenceFile: CCFile, comparisonFile: CCFile) {
        this.filesService.setDelta(referenceFile, comparisonFile)
    }

    setDeltaReference(file: CCFile) {
        this.filesService.setDeltaReference(file)
    }

    setDeltaComparison(file: CCFile) {
        this.filesService.setDeltaComparison(file)
    }

    switchReferenceAndComparison() {
        this.filesService.switchReferenceAndComparison()
    }

    toggleSelectionMode() {
        this.fileSelectionModeService.toggle()
    }
}
