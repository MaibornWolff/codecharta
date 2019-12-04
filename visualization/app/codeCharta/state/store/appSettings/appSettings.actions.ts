import { AppSettings, CCAction, DynamicSettings, RecursivePartial } from "../../../codeCharta.model"

export enum AppSettingsActions {
	SET_APP_SETTINGS = "SET_APP_SETTINGS"
}

export interface SetAppSettingsAction extends CCAction {
	type: AppSettingsActions.SET_APP_SETTINGS
	payload: RecursivePartial<AppSettings>
}

export type AppSettingsAction = SetAppSettingsAction

export function setAppSettings(appSettings: RecursivePartial<AppSettings>): AppSettingsAction {
	return {
		type: AppSettingsActions.SET_APP_SETTINGS,
		payload: appSettings
	}
}
