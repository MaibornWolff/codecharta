"use strict"
import { ILocationService, IHttpService } from "angular"
import { NameDataPair } from "../codeCharta.model"
import { ExportCCFile, ExportWrappedCCFile } from "../codeCharta.api.model"
import { getCCFileAndDecorateFileChecksum } from "./fileHelper"

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

		const response = await this.$http.get(fileName)
		if (response.status >= 200 && response.status < 300) {
			// @ts-ignore
			const responseData: string | ExportCCFile | ExportWrappedCCFile = response.data
			const content: ExportCCFile = getCCFileAndDecorateFileChecksum(responseData)

			if (content.projectName?.trim()) {
				fileName = content.projectName
			}

			return { fileName, fileSize: response.data.toString().length, content }
		}
		throw new Error(`Could not load file "${fileName}"`)
	}
}
