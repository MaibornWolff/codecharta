import { setPanelSelection } from "./panelSelection.actions"
import { PanelSelection } from "../../../../codeCharta.model"

export function splitPanelSelectionAction(payload: PanelSelection) {
	return setPanelSelection(payload)
}
