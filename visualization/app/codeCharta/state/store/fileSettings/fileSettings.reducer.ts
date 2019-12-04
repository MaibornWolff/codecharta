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
	let markedPackagesAction,
		edgesAction,
		attributeTypesAction,
		blacklistAction = action

	if (action.type === FileSettingsActions.SET_FILE_SETTINGS) {
		if (action.payload.markedPackages) {
			markedPackagesAction = setMarkedPackages(action.payload.markedPackages)
		}

		if (action.payload.edges) {
			edgesAction = setEdges(action.payload.edges)
		}

		if (action.payload.attributeTypes) {
			attributeTypesAction = setAttributeTypes(action.payload.attributeTypes)
		}

		if (action.payload.blacklist) {
			blacklistAction = setBlacklist(action.payload.blacklist)
		}
	}

	return {
		markedPackages: markedPackages(state.markedPackages, markedPackagesAction),
		edges: edges(state.edges, edgesAction),
		attributeTypes: attributeTypes(state.attributeTypes, attributeTypesAction),
		blacklist: blacklist(state.blacklist, blacklistAction)
	}
}
