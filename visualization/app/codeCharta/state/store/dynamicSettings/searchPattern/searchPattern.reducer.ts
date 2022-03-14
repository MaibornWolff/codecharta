import { isActionOfType } from "../../../../util/reduxHelper"
import { FilesAction, FilesSelectionActions } from "../../files/files.actions"
import { SearchPatternAction, SearchPatternActions, setSearchPattern } from "./searchPattern.actions"

export function searchPattern(state = setSearchPattern().payload, action: SearchPatternAction | FilesAction) {
	if (isActionOfType(action.type, FilesSelectionActions)) {
		return ""
	}

	switch (action.type) {
		case SearchPatternActions.SET_SEARCH_PATTERN:
			return action.payload
		default:
			return state
	}
}
