"use strict"
import { IHttpService, ILocationService } from "angular"
import { NameDataPair } from "../codeCharta.model"
import zlib from "zlib"
import { getCCFileAndDecorateFileChecksum } from "./fileHelper"
import { ExportCCFile, ExportWrappedCCFile } from "../codeCharta.api.model"

export class UrlExtractor {
	constructor(private $location: ILocationService, private $http: IHttpService) {}

	getParameterByName(name: string) {
		const sanitizedName = name.replace(/[[\]]/g, "\\$&")
		const regex = new RegExp(`[?&]${sanitizedName}(=([^&#]*)|&|#|$)`),
			results = regex.exec(this.$location.absUrl())

		if (!results) {
			return null
		}
		if (!results[2]) {
			return ""
		}
		return decodeURIComponent(results[2].replace(/\+/g, " "))
	}

	async getFileDataFromQueryParam() {
		let fileNames: string | string[] = this.$location.search().file

		if (!Array.isArray(fileNames)) {
			fileNames = [fileNames]
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
		const options = { responseType: "blob" as const }
		const response = await this.$http.get<Blob>(fileName, options)
		if (response.status >= 200 && response.status < 300) {
			return new Promise(resolve => {
				const reader = new FileReader()
				reader.readAsArrayBuffer(response.data)
				let content: ExportCCFile

				reader.onload = event => {
					const readerContent = zlib.unzipSync(Buffer.from(<string>event.target.result)).toString()
					const responseData: string | ExportCCFile | ExportWrappedCCFile = readerContent
					content = getCCFileAndDecorateFileChecksum(responseData)
					fileName = this.getFileName(fileName, content.projectName)
				}

				reader.onloadend = () => {
					resolve({ fileName, fileSize: response.data.toString().length, content })
				}
			})
		}
		throw new Error(`Could not load file "${fileName}"`)
	}

	private async getFile(fileName: string): Promise<NameDataPair> {
		const response = await this.$http.get(fileName)

		if (response.status >= 200 && response.status < 300) {
			// @ts-ignore
			const responseData: string | ExportCCFile | ExportWrappedCCFile = response.data
			const content: ExportCCFile = getCCFileAndDecorateFileChecksum(responseData)
			fileName = this.getFileName(fileName, content.projectName)
			return { fileName, fileSize: response.data.toString().length, content }
		}
		throw new Error(`Could not load file "${fileName}"`)
	}

	getFileName(oldFileName: string, projectName: string): string {
		return projectName?.trim() || oldFileName.split("/").pop()
	}
}
