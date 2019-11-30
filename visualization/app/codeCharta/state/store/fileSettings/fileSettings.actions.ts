import { Action } from "redux"
import { FileSettings } from "../../../codeCharta.model"

export enum FileSettingsActions {
	SET_FILE_SETTINGS = "SET_FILE_SETTINGS"
}

export interface SetFileSettingsAction extends Action {
	type: FileSettingsActions.SET_FILE_SETTINGS
	payload: FileSettings
}

export type FileSettingsAction = SetFileSettingsAction

export function setFileSettings(fileSettings: FileSettings): FileSettingsAction {
	return {
		type: FileSettingsActions.SET_FILE_SETTINGS,
		payload: fileSettings
	}
}
