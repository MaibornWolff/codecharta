import "./resetSettingsButton.component.scss"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { defaultState, setState } from "../../state/store/state.actions"
import { convertToVectors } from "../../util/settingsHelper"

export class ResetSettingsButtonController {
	private settingsNames = ""
	private callback?: () => void

	constructor(private storeService: StoreService) {
		"ngInject"
	}

	applyDefaultSettings() {
		const tokens = this.settingsNames.replace(/ |\n/g, "").split(",")
		const updatedSettings: RecursivePartial<Settings> = {}
		let settingsCounter = 0

		for (const token of tokens) {
			const steps = token.split(".")
			let defaultSettingsPointer = defaultState
			let updatedSettingsPointer = updatedSettings

			for (const [index, step] of steps.entries()) {
				if (defaultSettingsPointer[step] !== undefined) {
					if (!updatedSettingsPointer[step]) {
						updatedSettingsPointer[step] = {}
						settingsCounter++
					}
					if (index === steps.length - 1) {
						updatedSettingsPointer[step] = defaultSettingsPointer[step]
					} else {
						defaultSettingsPointer = defaultSettingsPointer[step]
						updatedSettingsPointer = updatedSettingsPointer[step]
					}
				}
			}
		}

		if (settingsCounter !== 0) {
			convertToVectors(updatedSettings)
			this.storeService.dispatch(setState(updatedSettings))
		}

		if (this.callback) this.callback()
	}
}

export const resetSettingsButtonComponent = {
	selector: "resetSettingsButtonComponent",
	template: require("./resetSettingsButton.component.html"),
	controller: ResetSettingsButtonController,
	bindings: {
		settingsNames: "@",
		tooltip: "@",
		text: "@",
		callback: "&"
	}
}
