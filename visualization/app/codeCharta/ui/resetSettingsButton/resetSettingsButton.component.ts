import "./resetSettingsButton.component.scss"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { defaultState, setState } from "../../state/store/state.actions"
import { convertToVectors } from "../../util/settingsHelper"

export class ResetSettingsButtonController {
	private settingsNames = ""

	/* @ngInject */
	constructor(private storeService: StoreService) {}

	public applyDefaultSettings() {
		const tokens: string[] = this.settingsNames.replace(/ /g, "").replace(/\n/g, "").split(",")
		const updatedSettings: RecursivePartial<Settings> = {}

		tokens.forEach(token => {
			const steps = token.split(".")

			let defaultSettingsPointer = defaultState
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
