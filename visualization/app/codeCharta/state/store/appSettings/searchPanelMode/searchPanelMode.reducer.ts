import { SearchPanelModeAction, SearchPanelModeActions, setSearchPanelMode } from "./searchPanelMode.actions"

export function searchPanelMode(state = setSearchPanelMode().payload, action: SearchPanelModeAction) {
	switch (action.type) {
		case SearchPanelModeActions.SET_SEARCH_PANEL_MODE:
			return action.payload
		default:
			return state
	}
}
