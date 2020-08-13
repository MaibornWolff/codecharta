"use strict"

/* We need to override this jshint suggestion because we need to attach a callback function to an object with values
only available in the loop. We cannot use a named function with parameters because the filereader object wont call it
with the additional ones */

/*jshint loopfunc:true */

import { DialogService } from "../dialog/dialog.service"
import { CodeChartaService } from "../../codeCharta.service"
import { NameDataPair } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"

export class FileChooserController {
	private files: NameDataPair[] = []

	/* @ngInject */
	constructor(
		private $scope,
		private dialogService: DialogService,
		private codeChartaService: CodeChartaService,
		private storeService: StoreService
	) {}

	public onImportNewFiles(element) {
		this.$scope.$apply(() => {
			let content
			let readFiles = 0

			for (const file of element.files) {
				const isCompressed = file.name.endsWith(".gz")
				const reader = new FileReader()
				isCompressed ? reader.readAsArrayBuffer(file) : reader.readAsText(file, "UTF-8")

				reader.onloadstart = () => {
					this.storeService.dispatch(setIsLoadingFile(true))
				}

				reader.onload = event => {
					if (isCompressed) {
						//
						const zlib = require("zlib") // eslint-disable-line
						content = zlib.unzipSync(Buffer.from(event.target.result))
					} else {
						content = event.target.result
					}
				}
				reader.onloadend = () => {
					readFiles++
					this.addNameDataPair(file.name, content)

					if (readFiles === element.files.length) {
						this.setNewData()
					}
				}
			}
		})
	}

	public setNewData() {
		this.codeChartaService.loadFiles(this.files)
		this.files = []
	}

	private addNameDataPair(fileName: string, content: string) {
		this.files.push({
			fileName,
			content: FileChooserController.getParsedContent(content)
		})
	}

	private static getParsedContent(content: string): any {
		try {
			return JSON.parse(content)
		} catch (error) {
			return
		}
	}
}

export const fileChooserComponent = {
	selector: "fileChooserComponent",
	template: require("./fileChooser.component.html"),
	controller: FileChooserController
}
