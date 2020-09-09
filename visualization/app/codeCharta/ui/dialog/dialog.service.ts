import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"
import { addScenarioSettingsComponent } from "./dialog.addScenarioSettings.component"
import { CCValidationResult } from "../../util/fileValidator"

export class DialogService {
	/* @ngInject */
	constructor(private $mdDialog) {}

	public showDownloadDialog() {
		this.showCustomDialog(dialogDownloadComponent)
	}

	public showGlobalSettingsDialog() {
		this.showCustomDialog(dialogGlobalSettingsComponent)
	}

	public showAddScenarioSettings() {
		this.showCustomDialog(addScenarioSettingsComponent)
	}

	public showCustomDialog(dialog) {
		this.$mdDialog.show(dialog)
	}

	public showErrorDialog(msg = "An error occurred.", title = "Error", button = "Ok") {
		this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(msg).ok(button))
	}

	public async showErrorDialogAndOpenFileChooser(msg = "An error occurred.", title = "Error", button = "Ok") {
		const prompt = this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(msg).ok(button)
		await this.$mdDialog.show(prompt)
		document.getElementById("input-file-id").click()
	}

	public showValidationWarningDialog(validationResult: CCValidationResult) {
		const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '

		const htmlMessage = this.buildHtmlMessage(warningSymbol, validationResult.warning)

		this.showErrorDialog(htmlMessage, "Validation Warning")
	}

	public showValidationErrorDialog(validationResult: CCValidationResult) {
		const errorSymbol = '<i class="fa fa-exclamation-circle"></i> '

		const htmlMessage = this.buildHtmlMessage(errorSymbol, validationResult.error)

		this.showErrorDialogAndOpenFileChooser(htmlMessage, "Validation Error")
	}

	private buildHtmlMessage(symbol: string, validationResult: string[]): string {
		return `<p>${validationResult.map(message => symbol + message).join("<br>")}</p>`
	}
}
