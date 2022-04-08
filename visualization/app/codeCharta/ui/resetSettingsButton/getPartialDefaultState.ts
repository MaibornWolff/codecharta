import { RecursivePartial, Settings } from "../../codeCharta.model"
import { defaultState } from "../../state/store/state.actions"
import { convertToVectors } from "../../util/settingsHelper"

export const getPartialDefaultState = (settingKeys: string[]) => {
	const updatedSettings: RecursivePartial<Settings> = {}
	let settingsCounter = 0

	for (const token of settingKeys) {
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
	}

	return updatedSettings
}
