import { PanelSelectionAction, setPanelSelection } from "./panelSelection.actions"
import { PanelSelection } from "../../../../codeCharta.model"

export function splitPanelSelectionAction(payload: PanelSelection): PanelSelectionAction {
	return setPanelSelection(payload)
}
