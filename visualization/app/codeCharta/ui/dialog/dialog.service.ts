import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"
import { addScenarioSettingsComponent } from "./dialog.addScenarioSettings.component"

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

	public showPromptDialog(msg: string, initial: string, placeholder: string = initial, title = "Prompt", button = "Ok"): Promise<any> {
		const prompt = this.$mdDialog.prompt().title(title).textContent(msg).initialValue(initial).placeholder(placeholder).ok(button)

		return this.$mdDialog.show(prompt)
	}
}
