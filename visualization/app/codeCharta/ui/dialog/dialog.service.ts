import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"
import { addScenarioSettingsComponent } from "./dialog.addScenarioSettings.component"
import { addCustomConfigSettingsComponent } from "./dialog.addCustomConfigSettings.component"
import { CCValidationResult } from "../../util/fileValidator"
import {dialogChangelogComponent} from "./dialog.changelog.component";

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

	showInfoDialog(message, title = "Info", button = "Ok") {
		this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(message).ok(button))
	}

	async showErrorDialog(message = "An error occurred.", title = "Error", button = "Ok") {
		await this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(message).ok(button))
	}

	async showErrorDialogAndOpenFileChooser(message = "An error occurred.", title = "Error", button = "Ok") {
		const prompt = this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(message).ok(button)
		await this.$mdDialog.show(prompt)
		document.getElementById("input-file-id").click()
	}

	async showValidationWarningDialog(validationResult: CCValidationResult) {
		const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '

		const htmlMessage = this.buildHtmlMessage(warningSymbol, validationResult.warning)

		await this.showErrorDialog(htmlMessage, "Validation Warning")
	}

	async showValidationErrorDialog(validationResult: CCValidationResult) {
		const errorSymbol = '<i class="fa fa-exclamation-circle"></i> '

		const htmlMessage = this.buildHtmlMessage(errorSymbol, validationResult.error)

		await this.showErrorDialogAndOpenFileChooser(htmlMessage, "Validation Error")
	}

	private buildHtmlMessage(symbol: string, validationResult: string[]) {
		return `<p>${validationResult.map(message => symbol + message).join("<br>")}</p>`
	}
}
