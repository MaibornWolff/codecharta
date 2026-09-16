import { Injectable } from "@angular/core"
import { LoadFilesUseCase } from "../../../load/load.facade"
import { NameDataPair, parseCcFileBytes } from "../../../stores/fileStore/fileStore.facade"
import { createCCFileInput } from "./createCCFileInput"

@Injectable({ providedIn: "root" })
export class UploadFilesService {
    constructor(private readonly loadFilesUseCase: LoadFilesUseCase) {}

    uploadFiles() {
        const ccFileInput = createCCFileInput()
        ccFileInput.addEventListener("change", () => {
            void this.uploadFilesOnEvent(ccFileInput)
            ccFileInput.remove()
        })
        ccFileInput.addEventListener("cancel", () => ccFileInput.remove())

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
        // Sequential on purpose: reading files in parallel keeps every unpacked file in memory at once.
        const nameDataPairs: NameDataPair[] = []
        for (const file of Array.from(fileList)) {
            nameDataPairs.push({
                fileName: file.name,
                fileSize: file.size,
                content: await parseCcFileBytes(new Uint8Array(await file.arrayBuffer()))
            })
        }
        return nameDataPairs
    }
}
