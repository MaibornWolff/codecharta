import { CodeChartaService } from "../codeCharta.service"

const dateRegex = /_\d{4}(?:-\d{1,2}){2}_\d{1,2}-\d{1,2}\./

export class FileNameHelper {
	private static JSON_EXTENSION = ".json"

	static getNewFileName(fileName: string, isDeltaState: boolean) {
		return this.getFileNameWithoutTimestamp(fileName, isDeltaState) + this.getNewTimestamp()
	}

	private static getNewTimestamp() {
		const date = new Date()
		return `_${date.toISOString().slice(0, 16).replace("T", "_").replace(":", "-")}`
	}

	private static getFileNameWithoutTimestamp(fileName: string, isDeltaState: boolean) {
		if (!isDeltaState) {
			const dateMatch = dateRegex.exec(fileName)
			if (dateMatch) {
				return fileName.slice(0, dateMatch.index)
			}
			if (fileName.includes(CodeChartaService.CC_FILE_EXTENSION)) {
				return fileName.slice(0, Math.max(0, fileName.search(CodeChartaService.CC_FILE_EXTENSION)))
			}
			if (fileName.includes(FileNameHelper.JSON_EXTENSION)) {
				return fileName.slice(0, Math.max(0, fileName.search(FileNameHelper.JSON_EXTENSION)))
			}
		}
		return fileName
	}

	static withoutCCJsonExtension(fileName: string) {
		return fileName.replace(".cc", "").replace(this.JSON_EXTENSION, "")
	}
}
