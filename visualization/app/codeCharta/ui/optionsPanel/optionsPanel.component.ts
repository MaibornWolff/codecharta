import { SettingsService } from "../../core/settings/settings.service"
import "./optionsPanel.component.scss"

export class OptionsPanelController {
	/* @ngInject */
	constructor(private settingsService: SettingsService) {}
}

export const optionsPanelComponent = {
	selector: "optionsPanelComponent",
	template: require("./optionsPanel.component.html"),
	controller: OptionsPanelController
}
