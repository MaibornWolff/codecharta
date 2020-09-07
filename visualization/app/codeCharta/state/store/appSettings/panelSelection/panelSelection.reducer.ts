import { PanelSelectionAction, PanelSelectionActions, setPanelSelection } from "./panelSelection.actions"
import { PanelSelection } from "../../../../codeCharta.model"

export function panelSelection(state: PanelSelection = setPanelSelection().payload, action: PanelSelectionAction): PanelSelection {
	switch (action.type) {
		case PanelSelectionActions.SET_PANEL_SELECTION:
			return action.payload
		default:
			return state
	}
}
