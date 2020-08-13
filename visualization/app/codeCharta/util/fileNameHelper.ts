import { CodeChartaService } from "../codeCharta.service"

export class FileNameHelper {
	private static JSON_EXTENSION = ".json"

	public static getNewFileName(fileName: string, isDeltaState: boolean): string {
		return this.getFileNameWithoutTimestamp(fileName, isDeltaState) + this.getNewTimestamp()
	}

	private static getNewTimestamp(): string {
		const date: Date = new Date()
		return "_" + date.toISOString().substr(0, 16).replace("T", "_").replace(":", "-")
	}

	private static getFileNameWithoutTimestamp(fileName: string, isDeltaState: boolean): string {
		const dateRegex = /_\d{4}-\d{1,2}-\d{1,2}_\d{1,2}-\d{1,2}\./

		if (!isDeltaState) {
			if (dateRegex.test(fileName)) {
				return fileName.substring(0, dateRegex.exec(fileName).index)
			} else if (fileName.includes(CodeChartaService.CC_FILE_EXTENSION)) {
				return fileName.substring(0, fileName.search(CodeChartaService.CC_FILE_EXTENSION))
			} else if (fileName.includes(FileNameHelper.JSON_EXTENSION)) {
				return fileName.substring(0, fileName.search(FileNameHelper.JSON_EXTENSION))
			}
		}
		return fileName
	}

	public static withoutCCJsonExtension(fileName: string): string {
		return fileName.replace(".cc", "").replace(this.JSON_EXTENSION, "")
	}
}
