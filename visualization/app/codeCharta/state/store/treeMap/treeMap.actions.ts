import { CCAction, RecursivePartial, TreeMapSettings } from "../../../codeCharta.model"

// Plop: Append default property import here
import { defaultMapSize } from "./mapSize/mapSize.actions"

export enum TreeMapSettingsActions {
	SET_TREE_MAP_SETTINGS = "SET_TREE_MAP_SETTINGS"
}

export interface SetTreeMapSettingsAction extends CCAction {
	type: TreeMapSettingsActions.SET_TREE_MAP_SETTINGS
	payload: RecursivePartial<TreeMapSettings>
}

export type TreeMapSettingsAction = SetTreeMapSettingsAction

export function setTreeMapSettings(
	treeMapSettings: RecursivePartial<TreeMapSettings> = defaultTreeMapSettings
): TreeMapSettingsAction {
	return {
		type: TreeMapSettingsActions.SET_TREE_MAP_SETTINGS,
		payload: treeMapSettings
	}
}

export const defaultTreeMapSettings: TreeMapSettings = {
	// Plop: Append default property here
	mapSize: defaultMapSize
}
