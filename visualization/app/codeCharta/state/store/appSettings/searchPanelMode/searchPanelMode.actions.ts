import { Action } from "redux"
import { SearchPanelMode } from "../../../../codeCharta.model"

export enum SearchPanelModeActions {
	SET_SEARCH_PANEL_MODE = "SET_SEARCH_PANEL_MODE"
}

export interface SetSearchPanelModeAction extends Action {
	type: SearchPanelModeActions.SET_SEARCH_PANEL_MODE
	payload: SearchPanelMode
}

export type SearchPanelModeAction = SetSearchPanelModeAction

export function setSearchPanelMode(
	searchPanelMode: SearchPanelMode = defaultSearchPanelMode
): SetSearchPanelModeAction {
	return {
		type: SearchPanelModeActions.SET_SEARCH_PANEL_MODE,
		payload: searchPanelMode
	}
}

export const defaultSearchPanelMode: SearchPanelMode = SearchPanelMode.minimized
