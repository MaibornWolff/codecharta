import _ from "lodash"
import { CCAction } from "../../codeCharta.model"
import { StateActions } from "./state.actions"
import { DynamicSettingsActions } from "./dynamicSettings/dynamicSettings.actions"
import { FileSettingsActions } from "./fileSettings/fileSettings.actions"
import { AppSettingsActions } from "./appSettings/appSettings.actions"
import { splitDynamicSettingsActions } from "./dynamicSettings/dynamicSettings.splitter"
import { splitFileSettingsActions } from "./fileSettings/fileSettings.splitter"
import { splitAppSettingsActions } from "./appSettings/appSettings.splitter"

export function splitInAtomicActions(action: CCAction): CCAction[] {
	if (_.values(DynamicSettingsActions).includes(action.type)) {
		return splitDynamicSettingsActions(action.payload.dynamicSettings)
	}

	if (_.values(FileSettingsActions).includes(action.type)) {
		return splitFileSettingsActions(action.payload.fileSettings)
	}

	if (_.values(AppSettingsActions).includes(action.type)) {
		return splitAppSettingsActions(action.payload.appSettings)
	}

	if (_.values(StateActions).includes(action.type)) {
		const actions: CCAction[] = []

		if (action.payload.dynamicSettings !== undefined) {
			actions.concat(splitDynamicSettingsActions(action.payload.dynamicSettings))
		}

		if (action.payload.fileSettings !== undefined) {
			actions.concat(splitFileSettingsActions(action.payload.fileSettings))
		}

		if (action.payload.appSettings !== undefined) {
			actions.concat(splitAppSettingsActions(action.payload.appSettings))
		}
		return actions
	}

	return [action]
}
