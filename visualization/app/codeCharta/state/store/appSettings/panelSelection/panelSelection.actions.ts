import { Action } from "redux"
import { PanelSelection } from "../../../../codeCharta.model"

export enum PanelSelectionActions {
	SET_PANEL_SELECTION = "SET_PANEL_SELECTION"
}

export interface SetPanelSelectionAction extends Action {
	type: PanelSelectionActions.SET_PANEL_SELECTION
	payload: PanelSelection
}

export type PanelSelectionAction = SetPanelSelectionAction

export function setPanelSelection(panelSelection: PanelSelection = defaultPanelSelection): SetPanelSelectionAction {
	return {
		type: PanelSelectionActions.SET_PANEL_SELECTION,
		payload: panelSelection
	}
}

export const defaultPanelSelection: PanelSelection = PanelSelection.NONE
