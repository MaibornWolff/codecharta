import { SearchPanelModeAction, SearchPanelModeActions, setSearchPanelMode } from "./searchPanelMode.actions"
import { SearchPanelMode } from "../../../../codeCharta.model"

export function searchPanelMode(state: SearchPanelMode = setSearchPanelMode().payload, action: SearchPanelModeAction): SearchPanelMode {
	switch (action.type) {
		case SearchPanelModeActions.SET_SEARCH_PANEL_MODE:
			return action.payload
		default:
			return state
	}
}
