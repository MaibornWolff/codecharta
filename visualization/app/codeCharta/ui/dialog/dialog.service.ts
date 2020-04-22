import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"

export class DialogService {
	/* @ngInject */
	constructor(private $mdDialog) {}

	public showDownloadDialog() {
		this.showCustomDialog(dialogDownloadComponent)
	}

	public showGlobalSettingsDialog() {
		this.showCustomDialog(dialogGlobalSettingsComponent)
	}

	public showCustomDialog(dialog) {
		this.$mdDialog.show(dialog)
	}

	public showErrorDialog(msg: string = "An error occurred.", title: string = "Error", button: string = "Ok") {
		this.$mdDialog.show(
			this.$mdDialog
				.alert()
				.clickOutsideToClose(true)
				.title(title)
				.htmlContent(msg)
				.ok(button)
		)
	}

	public showPromptDialog(
		msg: string,
		initial: string,
		placeholder: string = initial,
		title: string = "Prompt",
		button: string = "Ok"
	): Promise<any> {
		let prompt = this.$mdDialog
			.prompt()
			.title(title)
			.textContent(msg)
			.initialValue(initial)
			.placeholder(placeholder)
			.ok(button)

		return this.$mdDialog.show(prompt)
	}
}
