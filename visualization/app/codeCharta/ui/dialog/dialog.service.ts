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

	public showErrorDialog(msg: string = "An error occurred.", title: string = "Error", button: string = "Ok") {
		this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(msg).ok(button))
	}

	public showValidationErrorDialog(validationResult: CCValidationResult) {
		const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
		const lineBreak = "<br>"

		const warningMessage = validationResult.warning.map(message => warningSymbol + message).join(lineBreak)

		const htmlMessage = "<p>" + warningMessage + "</p>"

		this.showErrorDialog(htmlMessage, validationResult.title)
	}

	public showValidationWarningDialog(validationResult: CCValidationResult) {
		const errorSymbol = '<i class="fa fa-exclamation-circle"></i> '
		const lineBreak = "<br>"

		const errorMessage = validationResult.error.map(message => errorSymbol + message).join(lineBreak)

		const htmlMessage = "<p>" + errorMessage + "</p>"

		this.showErrorDialog(htmlMessage, validationResult.title)
	}
}
