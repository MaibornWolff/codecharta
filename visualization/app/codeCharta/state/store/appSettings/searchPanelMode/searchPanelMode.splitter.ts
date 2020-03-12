import { SearchPanelModeAction, setSearchPanelMode } from "./searchPanelMode.actions"
import { SearchPanelMode } from "../../../../codeCharta.model"

export function splitSearchPanelModeAction(payload: SearchPanelMode): SearchPanelModeAction {
	return setSearchPanelMode(payload)
}
