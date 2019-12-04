// Plop: Append reducer import here
import { markedPackages } from "./markedPackages/markedPackages.reducer"
import { edges } from "./edges/edges.reducer"
import { attributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { blacklist } from "./blacklist/blacklist.reducer"
import { setMarkedPackages } from "./markedPackages/markedPackages.actions"
import { setEdges } from "./edges/edges.actions"
import { setAttributeTypes } from "./attributeTypes/attributeTypes.actions"
import { setBlacklist } from "./blacklist/blacklist.actions"
import { FileSettings, CCAction } from "../../../codeCharta.model"
import { FileSettingsActions } from "./fileSettings.actions"

export default function fileSettings(state: FileSettings = {} as FileSettings, action: CCAction) {
	// Plop: Append action declaration here
	let markedPackagesAction = action
	let edgesAction = action
	let attributeTypesAction = action
	let blacklistAction = action

	if (action.type === FileSettingsActions.SET_FILE_SETTINGS) {
		// Plop: Append check for action payload here
		if (action.payload.markedPackages !== undefined) {
			markedPackagesAction = setMarkedPackages(action.payload.markedPackages)
		}

		if (action.payload.edges !== undefined) {
			edgesAction = setEdges(action.payload.edges)
		}

		if (action.payload.attributeTypes !== undefined) {
			attributeTypesAction = setAttributeTypes(action.payload.attributeTypes)
		}

		if (action.payload.blacklist !== undefined) {
			blacklistAction = setBlacklist(action.payload.blacklist)
		}
	}

	return {
		// Plop: Append action forwarding here
		markedPackages: markedPackages(state.markedPackages, markedPackagesAction),
		edges: edges(state.edges, edgesAction),
		attributeTypes: attributeTypes(state.attributeTypes, attributeTypesAction),
		blacklist: blacklist(state.blacklist, blacklistAction)
	}
}
