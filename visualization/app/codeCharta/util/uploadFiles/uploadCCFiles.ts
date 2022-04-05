import { ExportCCFile } from "../../codeCharta.api.model"
import { getCCFileAndDecorateFileChecksum } from "../fileHelper"
import { createCCFileInput } from "./createCCFileInput"
import { readFiles } from "./readFiles"

type ParsedCCFile = {
	fileName: string
	fileSize: number
	content: ExportCCFile
}

export const uploadCCFiles: () => Promise<ParsedCCFile[]> = async () =>
	new Promise(resolve => {
		const ccFileInput = createCCFileInput()
		ccFileInput.addEventListener("change", async () => {
			const plainFileContents = await Promise.all(readFiles(ccFileInput.files))
			const ccFiles = plainFileContents.map((jsonString, index) => ({
				fileName: ccFileInput.files[index].name,
				fileSize: ccFileInput.files[index].size,
				content: getCCFileAndDecorateFileChecksum(jsonString)
			}))
			resolve(ccFiles)
		})
		ccFileInput.click()
	})
