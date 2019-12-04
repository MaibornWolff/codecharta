import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import { CCAction, State } from "../../codeCharta.model"
import { StateActions } from "./state.actions"
import { setFileSettings } from "./fileSettings/fileSettings.actions"
import { setAppSettings } from "./appSettings/appSettings.actions"
import { setDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"

export function rootReducer(state: State = {} as State, action: CCAction) {
	let fileSettingsAction = action
	let appSettingsAction = action
	let dynamicSettingsAction = action

	if (action.type === StateActions.SET_STATE) {
		if (action.payload.fileSettings) {
			fileSettingsAction = setFileSettings(action.payload.fileSettings)
		}

		if (action.payload.appSettings) {
			appSettingsAction = setAppSettings(action.payload.appSettings)
		}

		if (action.payload.dynamicSettings) {
			dynamicSettingsAction = setDynamicSettings(action.payload.dynamicSettings)
		}
	}

	return {
		fileSettings: fileSettings(state.fileSettings, fileSettingsAction),
		appSettings: appSettings(state.appSettings, appSettingsAction),
		dynamicSettings: dynamicSettings(state.dynamicSettings, dynamicSettingsAction)
	}
}
