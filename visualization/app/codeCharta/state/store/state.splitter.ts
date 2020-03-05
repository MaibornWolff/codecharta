import _ from "lodash"
import { CCAction } from "../../codeCharta.model"
import { StateActions } from "./state.actions"

// Plop: Import sub-reducer action here
import { DynamicSettingsActions } from "./dynamicSettings/dynamicSettings.actions"
import { FileSettingsActions } from "./fileSettings/fileSettings.actions"
import { AppSettingsActions } from "./appSettings/appSettings.actions"
import { TreeMapSettingsActions } from "./treeMap/treeMap.actions"

// Plop: Import sub-reducer splitter here
import { splitDynamicSettingsActions } from "./dynamicSettings/dynamicSettings.splitter"
import { splitFileSettingsActions } from "./fileSettings/fileSettings.splitter"
import { splitAppSettingsActions } from "./appSettings/appSettings.splitter"
import { splitTreeMapSettingsActions } from "./treeMap/treeMap.splitter"

export function splitStateActions(action: CCAction): CCAction[] {
	// Plop: Propagate sub-reducer here
	if (_.values(DynamicSettingsActions).includes(action.type)) {
		return splitDynamicSettingsActions(action.payload)
	}

	if (_.values(FileSettingsActions).includes(action.type)) {
		return splitFileSettingsActions(action.payload)
	}

	if (_.values(AppSettingsActions).includes(action.type)) {
		return splitAppSettingsActions(action.payload)
	}

	if (_.values(TreeMapSettingsActions).includes(action.type)) {
		return splitTreeMapSettingsActions(action.payload)
	}

	if (_.values(StateActions).includes(action.type)) {
		let actions: CCAction[] = []

		// Plop: Split into sub-reducer here
		if (action.payload.dynamicSettings !== undefined) {
			actions = actions.concat(...splitDynamicSettingsActions(action.payload.dynamicSettings))
		}

		if (action.payload.fileSettings !== undefined) {
			actions = actions.concat(splitFileSettingsActions(action.payload.fileSettings))
		}

		if (action.payload.appSettings !== undefined) {
			actions = actions.concat(splitAppSettingsActions(action.payload.appSettings))
		}

		if (action.payload.treeMap !== undefined) {
			actions = actions.concat(splitTreeMapSettingsActions(action.payload.treeMap))
		}
		return actions
	}
	return [action]
}
