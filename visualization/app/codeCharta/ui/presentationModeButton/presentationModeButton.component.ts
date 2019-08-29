import "./presentationModeButton.component.scss"
import { SettingsService } from "../../state/settingsService/settings.service"

export class PresentationModeButtonController {
	private _viewModel: {
		isEnabled: boolean
	} = {
		isEnabled: false
	}

	/* @ngInject */
	constructor(private settingsService: SettingsService) {}

	public toggleMode() {
		this._viewModel.isEnabled = !this._viewModel.isEnabled
		this.settingsService.updateSettings({ appSettings: { isPresentationMode: this._viewModel.isEnabled } }, true)
	}
}

export const presentationModeButtonComponent = {
	selector: "presentationModeButtonComponent",
	template: require("./presentationModeButton.component.html"),
	controller: PresentationModeButtonController
}
