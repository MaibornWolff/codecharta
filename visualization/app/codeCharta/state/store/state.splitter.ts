import _ from "lodash"
import { CCAction } from "../../codeCharta.model"
import {StateActions} from "./state.actions"

// Plop: Import sub-reducer action here
import { MetricDataActions } from "./metricData/metricData.actions"
import { LookUpActions } from "./lookUp/lookUp.actions"
import { DynamicSettingsActions } from "./dynamicSettings/dynamicSettings.actions"
import { FileSettingsActions } from "./fileSettings/fileSettings.actions"
import { AppSettingsActions } from "./appSettings/appSettings.actions"
import { TreeMapSettingsActions } from "./treeMap/treeMap.actions"

// Plop: Import sub-reducer splitter here
import { splitMetricDataActions } from "./metricData/metricData.splitter"
import { splitLookUpActions } from "./lookUp/lookUp.splitter"
import { splitDynamicSettingsActions } from "./dynamicSettings/dynamicSettings.splitter"
import { splitFileSettingsActions } from "./fileSettings/fileSettings.splitter"
import { splitAppSettingsActions } from "./appSettings/appSettings.splitter"
import { splitTreeMapSettingsActions } from "./treeMap/treeMap.splitter"
import { splitFilesAction } from "./files/files.splitter"

export function splitStateActions(action: CCAction) {
	// Plop: Propagate sub-reducer here
	if (Object.values(MetricDataActions).includes(action.type)) {
		return splitMetricDataActions(action.payload)
	}

	if (Object.values(LookUpActions).includes(action.type)) {
		return splitLookUpActions(action.payload)
	}

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

	if (Object.values(StateActions).includes(action.type)) {
		const actions: CCAction[] = []

		// Plop: Split into sub-reducer here
		if (action.payload.metricData !== undefined) {
			actions.push(...splitMetricDataActions(action.payload.metricData))
		}

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
