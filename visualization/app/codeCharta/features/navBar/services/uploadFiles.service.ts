import { Injectable } from "@angular/core"
import { getCCFileAndDecorateFileChecksum, LoadFileService } from "../../../stores/fileStore/fileStore.facade"
import { NavBarWriteStore } from "../stores/navBar.write.store"
import { createCCFileInput } from "./createCCFileInput"
import { readFiles } from "./readFiles"

@Injectable({ providedIn: "root" })
export class UploadFilesService {
    isUploading = false

    constructor(
        private readonly navBarWriteStore: NavBarWriteStore,
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
            this.navBarWriteStore.setLoadingFile(true)
            this.navBarWriteStore.setLoadingMap(true)

            const plainFileContents = await Promise.all(readFiles(ccFileInput.files))
            const ccFiles = this.buildCCFiles(ccFileInput.files, plainFileContents)

            if (ccFiles.length > 0) {
                this.loadFileService.loadFiles(ccFiles)
            }
        } catch {
            this.navBarWriteStore.setLoadingFile(false)
            this.navBarWriteStore.setLoadingMap(false)
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
