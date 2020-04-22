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
			for (let file of element.files) {
				let reader = new FileReader()
				reader.onloadstart = () => {
					this.storeService.dispatch(setIsLoadingFile(true))
				}
				reader.onload = event => {
					this.setNewData(file.name, (<any>event.target).result)
				}
				reader.readAsText(file, "UTF-8")
			}
		})
	}

	public setNewData(fileName: string, content: string) {
		const nameDataPair: NameDataPair = {
			fileName: fileName,
			content: this.getParsedContent(content)
		}

		this.codeChartaService.loadFiles([nameDataPair]).catch(e => {
			this.storeService.dispatch(setIsLoadingFile(false))
			this.printErrors(e)
		})
	}

	private getParsedContent(content: string): any {
		try {
			return JSON.parse(content)
		} catch (error) {
			this.dialogService.showErrorDialog("Error parsing JSON!" + error)
		}
	}

	private printErrors(errors: { error: string[]; warning: string[] }) {
		let errorMessage = ""
		for (let i = 0; i < errors.error.length; i++) {
			errorMessage += errors.error[i]
			errorMessage += "</br>"
		}
		for (let i = 0; i < errors.warning.length; i++) {
			errorMessage += errors.warning[i]
			errorMessage += "</br>"
		}
		if (errors.error.length === 0) {
			this.dialogService.showErrorDialog(errorMessage, "Warning")
		} else {
			this.dialogService.showErrorDialog(errorMessage)
		}
	}
}

export const fileChooserComponent = {
	selector: "fileChooserComponent",
	template: require("./fileChooser.component.html"),
	controller: FileChooserController
}
