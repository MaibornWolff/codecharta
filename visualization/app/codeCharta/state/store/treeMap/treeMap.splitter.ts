import { RecursivePartial, CCAction, TreeMapSettings } from "../../../codeCharta.model"
import { splitMapSizeAction } from "./mapSize/mapSize.splitter"

export function splitTreeMapSettingsActions(payload: RecursivePartial<TreeMapSettings>): CCAction[] {
	const actions: CCAction[] = []

	if (payload.mapSize !== undefined) {
		actions.push(splitMapSizeAction(payload.mapSize))
	}

	return actions
}
