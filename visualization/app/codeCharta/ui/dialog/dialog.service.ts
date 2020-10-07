import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"
import { addScenarioSettingsComponent } from "./dialog.addScenarioSettings.component"
import { addCustomViewSettingsComponent } from "./dialog.addCustomViewSettings.component"
import { CCValidationResult } from "../../util/fileValidator"

export class DialogService {
	/* @ngInject */
	constructor(private $mdDialog) {}

	showDownloadDialog() {
		this.showCustomDialog(dialogDownloadComponent)
	}

	showGlobalSettingsDialog() {
		this.showCustomDialog(dialogGlobalSettingsComponent)
	}

	showAddScenarioSettings() {
		this.showCustomDialog(addScenarioSettingsComponent)
	}

	showAddCustomViewSettings() {
		this.showCustomDialog(addCustomViewSettingsComponent)
	}

	showCustomDialog(dialog) {
		this.$mdDialog.show(dialog)
	}

	showErrorDialog(message = "An error occurred.", title = "Error", button = "Ok") {
		this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(message).ok(button))
	}

	async showErrorDialogAndOpenFileChooser(message = "An error occurred.", title = "Error", button = "Ok") {
		const prompt = this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(message).ok(button)
		await this.$mdDialog.show(prompt)
		document.getElementById("input-file-id").click()
	}

	showValidationWarningDialog(validationResult: CCValidationResult) {
		const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '

		const htmlMessage = this.buildHtmlMessage(warningSymbol, validationResult.warning)

		this.showErrorDialog(htmlMessage, "Validation Warning")
	}

	showValidationErrorDialog(validationResult: CCValidationResult) {
		const errorSymbol = '<i class="fa fa-exclamation-circle"></i> '

		const htmlMessage = this.buildHtmlMessage(errorSymbol, validationResult.error)

		this.showErrorDialogAndOpenFileChooser(htmlMessage, "Validation Error")
	}

	private buildHtmlMessage(symbol: string, validationResult: string[]) {
		return `<p>${validationResult.map(message => symbol + message).join("<br>")}</p>`
	}
}
