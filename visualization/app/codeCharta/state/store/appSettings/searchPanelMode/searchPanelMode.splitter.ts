import { setSearchPanelMode } from "./searchPanelMode.actions"
import { SearchPanelMode } from "../../../../codeCharta.model"

export function splitSearchPanelModeAction(payload: SearchPanelMode) {
	return setSearchPanelMode(payload)
}
