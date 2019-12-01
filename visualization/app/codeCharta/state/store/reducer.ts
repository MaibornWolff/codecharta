import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import { CCAction, State } from "../../codeCharta.model"
import { StateActions } from "./state.actions"
import { setFileSettings } from "./fileSettings/fileSettings.actions"
import { setAppSettings } from "./appSettings/appSettings.actions"
import { setDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"

export function rootReducer(state: State = {} as State, action: CCAction) {
	switch (action.type) {
		case StateActions.SET_STATE:
			return {
				fileSettings: fileSettings(state.fileSettings, setFileSettings(action.payload.fileSettings)),
				appSettings: appSettings(state.appSettings, setAppSettings(action.payload.appSettings)),
				dynamicSettings: dynamicSettings(state.dynamicSettings, setDynamicSettings(action.payload.dynamicSettings))
			}
		default:
			return {
				fileSettings: fileSettings(state.fileSettings, action),
				appSettings: appSettings(state.appSettings, action),
				dynamicSettings: dynamicSettings(state.dynamicSettings, action)
			}
	}
}
