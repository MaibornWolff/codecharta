"use strict"

import { CodeChartaService } from "../../codeCharta.service"
import { NameDataPair } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { ExportCCFile } from "../../codeCharta.api.model"
import zlib from "zlib"
import { CUSTOM_CONFIG_FILE_EXTENSION, CustomConfigHelper } from "../../util/customConfigHelper"
import { getCCFileAndDecorateFileChecksum } from "../../util/fileHelper"
import { parseGameObjectsFile } from "../../util/gameObjectsParser/gameObjectsImporter"
import { validateGameObjects } from "../../util/gameObjectsParser/gameObjectsValidator"

export class FileChooserController {
	private files: NameDataPair[] = []

	constructor(private $scope, private codeChartaService: CodeChartaService, private storeService: StoreService) {
		"ngInject"
	}

	onImportNewFiles(element) {
		this.$scope.$apply(() => {
			let content: string
			let readFiles = 0

			for (let index = 0; index < element.files.length; index++) {
				const file = element.files[index]
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
					const result = event.target.result.toString()
					content = isCompressed ? zlib.unzipSync(Buffer.from(<string>event.target.result)).toString() : result
					if (result.includes("gameObjectPositions") && validateGameObjects(result))
						content = JSON.stringify(parseGameObjectsFile(result))
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
						this.addNameDataPair(file, content, index)
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

	private addNameDataPair(file: File, jsonString: string, index: number) {
		const content: ExportCCFile = getCCFileAndDecorateFileChecksum(jsonString)

		this.files[index] = {
			fileName: file.name,
			fileSize: file.size,
			content
		}
	}
}

export const fileChooserComponent = {
	selector: "fileChooserComponent",
	template: require("./fileChooser.component.html"),
	controller: FileChooserController
}
