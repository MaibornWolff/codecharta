import "./globalSettingsButton.component.scss"
import { DialogService } from "../dialog/dialog.service"

export class GlobalSettingsButtonController {
	/* @ngInject */
	constructor(private dialogService: DialogService) {}

	showGlobalSettings() {
		this.dialogService.showGlobalSettingsDialog()
	}
}

export const globalSettingsButtonComponent = {
	selector: "globalSettingsButtonComponent",
	template: require("./globalSettingsButton.component.html"),
	controller: GlobalSettingsButtonController
}
