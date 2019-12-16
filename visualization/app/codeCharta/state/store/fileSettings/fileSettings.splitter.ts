import { RecursivePartial, CCAction, FileSettings, AttributeTypes, MarkedPackage, Edge, BlacklistItem } from "../../../codeCharta.model"

// Plop: Append action splitter import here
import { splitMarkedPackagesAction } from "./markedPackages/markedPackages.splitter"
import { splitEdgesAction } from "./edges/edges.splitter"
import { splitAttributeTypesAction } from "./attributeTypes/attributeTypes.splitter"
import { splitBlacklistAction } from "./blacklist/blacklist.splitter"

export function splitFileSettingsActions(payload: RecursivePartial<FileSettings>): CCAction[] {
	const actions: CCAction[] = []

	// Plop: Append action split here
	if (payload.markedPackages !== undefined) {
		actions.push(splitMarkedPackagesAction(payload.markedPackages as MarkedPackage[]))
	}

	if (payload.edges !== undefined) {
		actions.push(splitEdgesAction(payload.edges as Edge[]))
	}

	if (payload.attributeTypes !== undefined) {
		actions.push(splitAttributeTypesAction(payload.attributeTypes as AttributeTypes))
	}

	if (payload.blacklist !== undefined) {
		actions.push(splitBlacklistAction(payload.blacklist as BlacklistItem[]))
	}

	return actions
}
