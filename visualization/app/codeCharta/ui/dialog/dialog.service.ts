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

	public showErrorDialog(msg: string = "An error occurred.", title: string = "Error", button: string = "Ok") {
		this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(title).htmlContent(msg).ok(button))
	}
}
