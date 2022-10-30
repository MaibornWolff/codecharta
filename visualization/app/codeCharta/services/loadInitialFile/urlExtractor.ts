import { HttpClient, HttpResponse } from "@angular/common/http"
import { firstValueFrom } from "rxjs"
import { NameDataPair } from "../../codeCharta.model"
import { getCCFileAndDecorateFileChecksum } from "../../util/fileHelper"
import { ExportCCFile, ExportWrappedCCFile } from "../../codeCharta.api.model"
import { ungzip } from "pako"

export class UrlExtractor {
	constructor(private httpClient: HttpClient) {}

	getParameterByName(name: string) {
		const sanitizedName = name.replace(/[[\]]/g, "\\$&")
		const regex = new RegExp(`[?&]${sanitizedName}(=([^&#]*)|&|#|$)`),
			results = regex.exec(window.location.href)

		if (!results) {
			return null
		}
		if (!results[2]) {
			return ""
		}
		return decodeURIComponent(results[2].replace(/\+/g, " "))
	}

	async getFileDataFromQueryParam() {
		const fileNames: string[] = [...new URLSearchParams(window.location.search).entries()]
			.filter(([searchParameterName]) => searchParameterName === "file")
			.map(([, fileName]) => fileName)

		if (fileNames.length === 0) {
			throw new Error("Filename is missing")
		}

		return Promise.all(
			fileNames.map(async fileName => {
				return this.getFileDataFromFile(fileName)
			})
		)
	}

	async getFileDataFromFile(fileName: string): Promise<NameDataPair> {
		if (!fileName) {
			throw new Error(`Filename is missing`)
		}
		if (fileName.endsWith(".gz")) {
			return this.getUnzippedFile(fileName)
		}
		return this.getFile(fileName)
	}

	private async getUnzippedFile(fileName: string): Promise<NameDataPair> {
		const response: HttpResponse<ArrayBuffer> = await firstValueFrom(
			this.httpClient.get(fileName, { responseType: "arraybuffer", observe: "response" })
		)
		if (response.status >= 200 && response.status < 300) {
			const data = response.body
			const responseData: string | ExportCCFile | ExportWrappedCCFile = ungzip(data, { to: "string" })
			const content = getCCFileAndDecorateFileChecksum(responseData)
			const parsedFileName = this.getFileName(fileName, content.projectName)
			return { fileName: parsedFileName, fileSize: response.body.toString().length, content }
		}
		throw new Error(`Could not load file "${fileName}"`)
	}

	private async getFile(fileName: string): Promise<NameDataPair> {
		const response = await firstValueFrom(this.httpClient.get(fileName, { observe: "response" }))

		if (response.status >= 200 && response.status < 300) {
			const responseData = response.body as string | ExportCCFile | ExportWrappedCCFile
			const content: ExportCCFile = getCCFileAndDecorateFileChecksum(responseData)
			fileName = this.getFileName(fileName, content.projectName)
			return { fileName, fileSize: responseData.toString().length, content }
		}
		throw new Error(`Could not load file "${fileName}"`)
	}

	getFileName(oldFileName: string, projectName: string): string {
		return projectName?.trim() || oldFileName.split("/").pop()
	}
}
