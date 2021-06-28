import "./globalSettingsButton.component.scss"
import { DialogService } from "../dialog/dialog.service"

export class GlobalSettingsButtonController {
	constructor(private dialogService: DialogService) {
		"ngInject"
	}

	showGlobalSettings() {
		this.dialogService.showGlobalSettingsDialog()
	}
}

export const globalSettingsButtonComponent = {
	selector: "globalSettingsButtonComponent",
	template: require("./globalSettingsButton.component.html"),
	controller: GlobalSettingsButtonController
}
