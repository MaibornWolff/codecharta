import { CCAction, FileSettings, RecursivePartial } from "../../../model/codeCharta.model"
import { defaultAttributeTypes } from "./attributeTypes/attributeTypes.actions"
import { defaultBlacklist } from "./blacklist/blacklist.actions"
import { defaultEdges } from "./edges/edges.actions"
import { defaultMarkedPackages } from "./markedPackages/markedPackages.actions"

export enum FileSettingsActions {
	SET_FILE_SETTINGS = "SET_FILE_SETTINGS"
}

export interface SetFileSettingsAction extends CCAction {
	type: FileSettingsActions.SET_FILE_SETTINGS
	payload: RecursivePartial<FileSettings>
}

export type FileSettingsAction = SetFileSettingsAction

export function setFileSettings(fileSettings: RecursivePartial<FileSettings> = defaultFileSettings): FileSettingsAction {
	return {
		type: FileSettingsActions.SET_FILE_SETTINGS,
		payload: fileSettings
	}
}

export const defaultFileSettings: FileSettings = {
	attributeTypes: defaultAttributeTypes,
	blacklist: defaultBlacklist,
	edges: defaultEdges,
	markedPackages: defaultMarkedPackages
}
