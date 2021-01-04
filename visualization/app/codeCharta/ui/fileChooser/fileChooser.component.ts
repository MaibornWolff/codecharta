"use strict"

import { CodeChartaService } from "../../codeCharta.service"
import { NameDataPair } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { ExportCCFile } from "./../../codeCharta.api.model"
import zlib from "zlib"
import md5 from "md5"
import { CUSTOM_CONFIG_FILE_EXTENSION, CustomConfigHelper } from "../../util/customConfigHelper"

export class FileChooserController {
	private files: NameDataPair[] = []

	/* @ngInject */
	constructor(private $scope, private codeChartaService: CodeChartaService, private storeService: StoreService) {}

	onImportNewFiles(element) {
		this.$scope.$apply(() => {
			let content
			let readFiles = 0

			for (const file of element.files) {
				const isCompressed = file.name.endsWith(".gz")
				const reader = new FileReader()
				if (isCompressed) {
					reader.readAsArrayBuffer(file)
				} else {
					reader.readAsText(file, "UTF-8")
				}

				reader.onloadstart = () => {
					if (file.name.includes(CodeChartaService.CC_FILE_EXTENSION)) {
						this.storeService.dispatch(setIsLoadingFile(true))
					}
				}

				reader.onload = event => {
					content = isCompressed ? zlib.unzipSync(Buffer.from((<any>event.target).result)) : event.target.result
				}

				reader.onloadend = () => {
					readFiles++
					if (file.name.includes(CUSTOM_CONFIG_FILE_EXTENSION)) {
						try {
							CustomConfigHelper.importCustomConfigs(content)
						} catch {
							// Explicitly ignored
						}
					} else {
						this.addNameDataPair(file, content)
					}

					if (readFiles === element.files.length) {
						this.setNewData()
					}
				}
			}
		})
	}

	setNewData() {
		this.codeChartaService.loadFiles(this.files)
		this.files = []
	}

	private addNameDataPair(file: File, jsonString: string) {
		let content: ExportCCFile

		try {
			content = JSON.parse(jsonString)

			if (!content.fileChecksum) {
				content.fileChecksum = md5(jsonString)
			}
		} catch {
			// Explicitly ignored
		}

		this.files.push({
			fileName: file.name,
			fileSize: file.size,
			content
		})
	}
}

export const fileChooserComponent = {
	selector: "fileChooserComponent",
	template: require("./fileChooser.component.html"),
	controller: FileChooserController
}
