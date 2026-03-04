import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { LoadFileService } from "../../../services/loadFile/loadFile.service"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { getCCFileAndDecorateFileChecksum } from "../../../util/fileHelper"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"
import { readFiles } from "../../../util/uploadFiles/readFiles"

@Injectable({ providedIn: "root" })
export class UploadFilesService {
    isUploading = false

    constructor(
        private readonly store: Store,
        private readonly loadFileService: LoadFileService
    ) {}

    uploadFiles() {
        const ccFileInput = createCCFileInput()
        ccFileInput.addEventListener("change", () => {
            void this.uploadFilesOnEvent(ccFileInput)
            ccFileInput.remove()
        })

        ccFileInput.click()
    }

    private async uploadFilesOnEvent(ccFileInput: HTMLInputElement) {
        if (!ccFileInput.files || ccFileInput.files.length === 0) {
            return
        }

        try {
            this.isUploading = true
            this.store.dispatch(setIsLoadingFile({ value: true }))
            this.store.dispatch(setIsLoadingMap({ value: true }))

            const plainFileContents = await Promise.all(readFiles(ccFileInput.files))
            const ccFiles = this.buildCCFiles(ccFileInput.files, plainFileContents)

            if (ccFiles.length > 0) {
                this.loadFileService.loadFiles(ccFiles)
            }
        } catch {
            this.store.dispatch(setIsLoadingFile({ value: false }))
            this.store.dispatch(setIsLoadingMap({ value: false }))
        } finally {
            this.isUploading = false
        }
    }

    private buildCCFiles(fileList: FileList, contents: string[]) {
        return contents.map((content, index) => ({
            fileName: fileList[index].name,
            fileSize: fileList[index].size,
            content: getCCFileAndDecorateFileChecksum(content)
        }))
    }
}
