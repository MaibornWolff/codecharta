import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"
import { addScenarioSettingsComponent } from "./dialog.addScenarioSettings.component"
import { addCustomConfigSettingsComponent } from "./dialog.addCustomConfigSettings.component"
import { CCFileValidationResult } from "../../util/fileValidator"
import { dialogChangelogComponent } from "./dialog.changelog.component"

export class DialogService {
	constructor(private $mdDialog) {
		"ngInject"
	}

	showDownloadDialog() {
		this.showCustomDialog(dialogDownloadComponent)
	}

	showGlobalSettingsDialog() {
		this.showCustomDialog(dialogGlobalSettingsComponent)
	}

	showAddScenarioSettings() {
		this.showCustomDialog(addScenarioSettingsComponent)
	}

	showAddCustomConfigSettings() {
		this.showCustomDialog(addCustomConfigSettingsComponent)
	}

	showChangelogDialog() {
		this.showCustomDialog(dialogChangelogComponent)
	}

	showCustomDialog(dialog) {
		this.$mdDialog.show(dialog)
	}

	async showErrorDialog(message = "An error occurred.", title = "Error", button = "Ok") {
		await this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(message).ok(button))
	}

	async showValidationDialog(fileValidationResults: CCFileValidationResult[]) {
		const htmlMessages = []

		if (fileValidationResults.flatMap(validation => validation.errors).length > 0) {
			htmlMessages.push("<h2>Errors</h2>")
			for (const fileValidationResult of fileValidationResults) {
				if (fileValidationResult.errors.length > 0) {
					const fileErrorMessage = this.buildFileErrorMessage(fileValidationResult)
					htmlMessages.push(fileErrorMessage)
				}
			}
		}

		if (fileValidationResults.flatMap(validation => validation.warnings).length > 0) {
			htmlMessages.push("<h2>Warnings</h2>")
			for (const fileValidationResult of fileValidationResults) {
				if (fileValidationResult.warnings.length > 0) {
					const fileWarningMessage = this.buildFileWarningMessage(fileValidationResult)
					htmlMessages.push(fileWarningMessage)
				}
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
