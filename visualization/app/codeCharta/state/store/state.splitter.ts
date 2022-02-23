import { CCAction } from "../../codeCharta.model"
import { StateActions } from "./state.actions"

import { LookUpActions } from "./lookUp/lookUp.actions"
import { DynamicSettingsActions } from "./dynamicSettings/dynamicSettings.actions"
import { FileSettingsActions } from "./fileSettings/fileSettings.actions"
import { AppSettingsActions } from "./appSettings/appSettings.actions"
import { TreeMapSettingsActions } from "./treeMap/treeMap.actions"

import { splitLookUpActions } from "./lookUp/lookUp.splitter"
import { splitDynamicSettingsActions } from "./dynamicSettings/dynamicSettings.splitter"
import { splitFileSettingsActions } from "./fileSettings/fileSettings.splitter"
import { splitAppSettingsActions } from "./appSettings/appSettings.splitter"
import { splitTreeMapSettingsActions } from "./treeMap/treeMap.splitter"
import { splitFilesAction } from "./files/files.splitter"

export function splitStateActions(action: CCAction) {
	if (LookUpActions[action.type] !== undefined) {
		return splitLookUpActions(action.payload)
	}

	if (DynamicSettingsActions[action.type] !== undefined) {
		return splitDynamicSettingsActions(action.payload)
	}

	if (FileSettingsActions[action.type] !== undefined) {
		return splitFileSettingsActions(action.payload)
	}

	if (AppSettingsActions[action.type] !== undefined) {
		return splitAppSettingsActions(action.payload)
	}

	if (TreeMapSettingsActions[action.type] !== undefined) {
		return splitTreeMapSettingsActions(action.payload)
	}

	if (StateActions[action.type] !== undefined) {
		const actions: CCAction[] = []

		if (action.payload.lookUp !== undefined) {
			actions.push(...splitLookUpActions(action.payload.lookUp))
		}

		if (action.payload.dynamicSettings !== undefined) {
			actions.push(...splitDynamicSettingsActions(action.payload.dynamicSettings))
		}

		if (action.payload.fileSettings !== undefined) {
			actions.push(...splitFileSettingsActions(action.payload.fileSettings))
		}

		if (action.payload.appSettings !== undefined) {
			actions.push(...splitAppSettingsActions(action.payload.appSettings))
		}

		if (action.payload.treeMap !== undefined) {
			actions.push(...splitTreeMapSettingsActions(action.payload.treeMap))
		}

		if (action.payload.files !== undefined) {
			actions.push(...splitFilesAction(action.payload.files))
		}
		return actions
	}

	return [action]
}
