import { dialogDownloadComponent } from "./dialog.download.component"
import { CCFileValidationResult } from "../../util/fileValidator"

export class DialogService {
	constructor(private $mdDialog) {
		"ngInject"
	}

	showDownloadDialog() {
		this.showCustomDialog(dialogDownloadComponent)
	}

	showCustomDialog(dialog) {
		this.$mdDialog.show(dialog)
	}

	async showErrorDialog(message = "An error occurred.", title = "Error", button = "Ok") {
		await this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(message).ok(button))
	}

	async showValidationDialog(fileValidationResults: CCFileValidationResult[]) {
		const htmlMessages = []

		const filesWithErrors = fileValidationResults.filter(validationResult => {
			return validationResult.errors.length > 0
		})
		if (filesWithErrors.length > 0) {
			htmlMessages.push("<h2>Errors</h2>")
			for (const fileWithErrors of filesWithErrors) {
				const fileErrorMessage = this.buildFileErrorMessage(fileWithErrors)
				htmlMessages.push(fileErrorMessage)
			}
		}

		const filesWithWarnings = fileValidationResults.filter(validationResult => {
			return validationResult.warnings.length > 0
		})
		if (filesWithWarnings.length > 0) {
			htmlMessages.push("<h2>Warnings</h2>")
			for (const fileWithWarnings of filesWithWarnings) {
				const fileWarningMessage = this.buildFileWarningMessage(fileWithWarnings)
				htmlMessages.push(fileWarningMessage)
			}
		}
		await this.showErrorDialog(htmlMessages.join(""), "Something is wrong with the uploaded file(s)")
	}

	private buildFileErrorMessage(fileValidationResult) {
		const errorSymbol = '<i class="fa fa-exclamation-circle"></i> '
		return `<p><strong>${fileValidationResult.fileName}:</strong> ${this.buildHtmlMessage(
			errorSymbol,
			fileValidationResult.errors
		)}</p>`
	}

	private buildFileWarningMessage(fileValidationResult) {
		const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
		return `<p><strong>${fileValidationResult.fileName}:</strong> ${this.buildHtmlMessage(
			warningSymbol,
			fileValidationResult.warnings
		)}</p>`
	}

	private buildHtmlMessage(symbol: string, validationResult: string[]) {
		return `<p>${validationResult.map(message => symbol + message).join("<br>")}</p>`
	}
}
