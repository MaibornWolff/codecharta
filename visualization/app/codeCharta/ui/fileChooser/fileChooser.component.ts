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
import { resetFiles } from "../../state/store/files/files.actions"
import { CCValidationResult } from "../../util/fileValidator"

export class FileChooserController {
	/* @ngInject */
	constructor(
		private $scope,
		private dialogService: DialogService,
		private codeChartaService: CodeChartaService,
		private storeService: StoreService
	) {}

	public onImportNewFiles(element) {
		this.$scope.$apply(() => {
			this.storeService.dispatch(resetFiles())
			let content

			for (const file of element.files) {
				const isCompressed = file.name.endsWith(".gz")
				const reader = new FileReader()
				reader.onloadstart = () => {
					this.storeService.dispatch(setIsLoadingFile(true))
				}
				reader.onload = event => {
					if (isCompressed) {
						const zlib = require("zlib")

						const buffer = new Buffer((<any>event.target).result, "UTF-8")
						content = zlib.unzipSync(buffer).toString()
					} else {
						content = (<any>event.target).result
					}

					this.setNewData(file.name, content)
				}
				isCompressed ? reader.readAsArrayBuffer(file) : reader.readAsText(file, "UTF-8")
			}
		})
	}

	public setNewData(fileName: string, content: string) {
		const nameDataPair: NameDataPair = {
			fileName,
			content: FileChooserController.getParsedContent(content)
		}

		this.codeChartaService.loadFiles([nameDataPair]).catch((validationResult: CCValidationResult) => {
			this.storeService.dispatch(setIsLoadingFile(false))
			this.printErrors(validationResult)
		})
	}

	private static getParsedContent(content: string): any {
		try {
			return JSON.parse(content)
		} catch (error) {
			return
		}
	}

	private printErrors(validationResult: CCValidationResult) {
		const errorSymbol = '<i class="fa fa-exclamation-circle"></i> '
		const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
		const lineBreak = "<br>"

		const errorMessage = validationResult.error.map(message => errorSymbol + message).join(lineBreak)
		const warningMessage = validationResult.warning.map(message => warningSymbol + message).join(lineBreak)

		const htmlMessage = "<p>" + errorMessage + lineBreak + warningMessage + "</p>"

		this.dialogService.showErrorDialog(htmlMessage, validationResult.title)
	}
}

export const fileChooserComponent = {
	selector: "fileChooserComponent",
	template: require("./fileChooser.component.html"),
	controller: FileChooserController
}
