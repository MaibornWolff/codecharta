import { Injectable } from "@angular/core"
import { LoadFilesUseCase } from "../../../load/load.facade"
import { getCCFileAndDecorateFileChecksum, NameDataPair } from "../../../stores/fileStore/fileStore.facade"
import { createCCFileInput } from "./createCCFileInput"
import { readFiles } from "./readFiles"

/**
 * The DOM half of an upload: it picks the files and turns them into name/data pairs.
 * LoadFilesUseCase owns everything from there — the loading indicator, the load and its errors.
 */
@Injectable({ providedIn: "root" })
export class UploadFilesService {
    constructor(private readonly loadFilesUseCase: LoadFilesUseCase) {}

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

        const pickedFiles = ccFileInput.files
        await this.loadFilesUseCase.loadFromUpload(() => this.readNameDataPairs(pickedFiles))
    }

    private async readNameDataPairs(fileList: FileList): Promise<NameDataPair[]> {
        const plainFileContents = await Promise.all(readFiles(fileList))
        return plainFileContents.map((content, index) => ({
            fileName: fileList[index].name,
            fileSize: fileList[index].size,
            content: getCCFileAndDecorateFileChecksum(content)
        }))
    }
}
