import { RecursivePartial, DynamicSettings, CCAction } from "../../../codeCharta.model"
import { splitFocusedNodePathAction } from "./focusedNodePath/focusedNodePath.splitter"

export function splitDynamicSettingsActions(payload: RecursivePartial<DynamicSettings>): CCAction[] {
	const actions: CCAction[] = []

	if (payload.focusedNodePath !== undefined) {
		actions.push(splitFocusedNodePathAction(payload.focusedNodePath))
	}

	if (payload.areaMetric !== undefined) {
		//actions.push(splitAreaMetricAction(payload.areaMetric))
	}

	// ...

	return actions
}
