import { SettingsService } from "../../state/settings.service"
import "./resetSettingsButton.component.scss"
import {RecursivePartial, Settings} from "../../codeCharta.model";

export class ResetSettingsButtonController {
	private settingsNames: string = ""

	/* @ngInject */
	constructor(private settingsService: SettingsService) {}

	public onClick() {
		this.updateSettings()
	}

	public updateSettings() {
		const sanitizedSettingsList = this.settingsNames.replace(/ /g, "").replace(/\n/g, "")
		const tokens: string[] = sanitizedSettingsList.split(",")
		const defaultSettings = this.settingsService.getDefaultSettings()
		const updatedSettings: RecursivePartial<Settings> = {}

		tokens.forEach(token => {
			let steps = token.split(".")

			let defaultSettingsPointer = defaultSettings
			let updatedSettingsPointer = updatedSettings

			steps.forEach((step, index) => {
				if (defaultSettingsPointer[step] !== undefined) {
					if (!updatedSettingsPointer[step]) {
						Object.assign(updatedSettingsPointer, {[step]: {}})
					}
					if (index === steps.length - 1) {
						updatedSettingsPointer[step] = defaultSettingsPointer[step]
					} else {
						defaultSettingsPointer = defaultSettingsPointer[step]
						updatedSettingsPointer = updatedSettingsPointer[step]
					}
				}
			})
		})

		this.settingsService.updateSettings(updatedSettings)
	}
}

export const resetSettingsButtonComponent = {
	selector: "resetSettingsButtonComponent",
	template: require("./resetSettingsButton.component.html"),
	controller: ResetSettingsButtonController,
	bindings: {
		settingsNames: "@"
	}
}
