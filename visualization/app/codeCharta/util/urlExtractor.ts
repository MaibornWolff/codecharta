"use strict"
import { ILocationService, IHttpService } from "angular"
import { NameDataPair } from "../codeCharta.model"
import { ExportCCFile } from "../codeCharta.api.model"

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

		if (!fileNames) {
			return []
		}
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
			return { fileName, content: response.data as ExportCCFile }
		}
		throw new Error(`Could not load file "${fileName}"`)
	}
}
