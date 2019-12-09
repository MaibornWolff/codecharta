import { SettingsService } from "../../state/settingsService/settings.service"
import "./resetSettingsButton.component.scss"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { convertToVectors } from "../../util/settingsHelper"

export class ResetSettingsButtonController {
	private settingsNames: string = ""

	/* @ngInject */
	constructor(private settingsService: SettingsService, private storeService: StoreService) {}

	public applyDefaultSettings() {
		const tokens: string[] = this.settingsNames
			.replace(/ /g, "")
			.replace(/\n/g, "")
			.split(",")
		const defaultSettings = this.settingsService.getDefaultSettings()
		const updatedSettings: RecursivePartial<Settings> = {}

		tokens.forEach(token => {
			let steps = token.split(".")

			let defaultSettingsPointer = defaultSettings
			let updatedSettingsPointer = updatedSettings

			steps.forEach((step, index) => {
				if (defaultSettingsPointer[step] !== undefined) {
					if (!updatedSettingsPointer[step]) {
						Object.assign(updatedSettingsPointer, { [step]: {} })
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

		if (Object.keys(updatedSettings).length > 0) {
			convertToVectors(updatedSettings)
			this.settingsService.updateSettings(updatedSettings)
			this.storeService.dispatch(setState(updatedSettings))
		}
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
