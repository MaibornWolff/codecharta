import { PanelSelectionAction, PanelSelectionActions, setPanelSelection } from "./panelSelection.actions"

export function panelSelection(state = setPanelSelection().payload, action: PanelSelectionAction) {
	switch (action.type) {
		case PanelSelectionActions.SET_PANEL_SELECTION:
			return action.payload
		default:
			return state
	}
}
