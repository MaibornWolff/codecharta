import { RecursivePartial, CCAction, TreeMapSettings } from "../../../codeCharta.model"

// Plop: Append action splitter import here
import { splitMapSizeAction } from "./mapSize/mapSize.splitter"

export function splitTreeMapSettingsActions(payload: RecursivePartial<TreeMapSettings>): CCAction[] {
	const actions: CCAction[] = []

	// Plop: Append action split here
	if (payload.mapSize !== undefined) {
		actions.push(splitMapSizeAction(payload.mapSize))
	}

	return actions
}
