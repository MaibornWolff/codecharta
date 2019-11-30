import { Action } from "redux"
import { AppSettings } from "../../../codeCharta.model"

export enum AppSettingsActions {
	SET_APP_SETTINGS = "SET_APP_SETTINGS"
}

export interface SetAppSettingsAction extends Action {
	type: AppSettingsActions.SET_APP_SETTINGS
	payload: AppSettings
}

export type AppSettingsAction = SetAppSettingsAction

export function setAppSettings(appSettings: AppSettings): AppSettingsAction {
	return {
		type: AppSettingsActions.SET_APP_SETTINGS,
		payload: appSettings
	}
}
