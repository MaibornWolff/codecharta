import { CCAction, FileSettings, RecursivePartial } from "../../../codeCharta.model"

export enum FileSettingsActions {
	SET_FILE_SETTINGS = "SET_FILE_SETTINGS"
}

export interface SetFileSettingsAction extends CCAction {
	type: FileSettingsActions.SET_FILE_SETTINGS
	payload: RecursivePartial<FileSettings>
}

export type FileSettingsAction = SetFileSettingsAction

export function setFileSettings(fileSettings: RecursivePartial<FileSettings>): FileSettingsAction {
	return {
		type: FileSettingsActions.SET_FILE_SETTINGS,
		payload: fileSettings
	}
}
