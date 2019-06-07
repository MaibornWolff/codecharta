import { CodeChartaService } from "../codeCharta.service"

export class FileNameHelper {
	private static JSON_EXTENSION = ".json"

	public static getNewFileName(fileName: string): string {
		return this.getFileNameWithoutTimestamp(fileName) + this.getNewTimestamp()
	}

	private static getNewTimestamp(): string {
		const date: Date = new Date()
		return (
			"_" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_" + date.getHours() + "-" + date.getMinutes()
		)
	}

	private static getFileNameWithoutTimestamp(fileName: string): string {
		const dateRegex: RegExp = /\_\d{4}\-\d{1,2}\-\d{1,2}\_\d{1,2}\-\d{1,2}\./

		if (dateRegex.test(fileName)) {
			return fileName.substring(0, dateRegex.exec(fileName).index)
		} else if (fileName.includes(CodeChartaService.CC_FILE_EXTENSION)) {
			return fileName.substring(0, fileName.search(CodeChartaService.CC_FILE_EXTENSION))
		} else if (fileName.includes(FileNameHelper.JSON_EXTENSION)) {
			return fileName.substring(0, fileName.search(FileNameHelper.JSON_EXTENSION))
		} else {
			return fileName
		}
	}
}
