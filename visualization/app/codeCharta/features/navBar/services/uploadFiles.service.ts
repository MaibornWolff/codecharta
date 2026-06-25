import { Injectable } from "@angular/core"
import { LoadFileService } from "../../../features/loadFile/facade"
import { getCCFileAndDecorateFileChecksum } from "../../../features/loadFile/facade"
import { createCCFileInput } from "./createCCFileInput"
import { readFiles } from "./readFiles"
import { LoadingStateStore } from "../stores/loadingState.store"

@Injectable({ providedIn: "root" })
export class UploadFilesService {
    isUploading = false

    constructor(
        private readonly loadingStateStore: LoadingStateStore,
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
            this.loadingStateStore.setLoadingFile(true)
            this.loadingStateStore.setLoadingMap(true)

            const plainFileContents = await Promise.all(readFiles(ccFileInput.files))
            const ccFiles = this.buildCCFiles(ccFileInput.files, plainFileContents)

            if (ccFiles.length > 0) {
                this.loadFileService.loadFiles(ccFiles)
            }
        } catch {
            this.loadingStateStore.setLoadingFile(false)
            this.loadingStateStore.setLoadingMap(false)
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
