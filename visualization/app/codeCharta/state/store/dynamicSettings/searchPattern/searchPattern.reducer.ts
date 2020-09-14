import { SearchPatternAction, SearchPatternActions, setSearchPattern } from "./searchPattern.actions"

export function searchPattern(state = setSearchPattern().payload, action: SearchPatternAction) {
	switch (action.type) {
		case SearchPatternActions.SET_SEARCH_PATTERN:
			return action.payload
		default:
			return state
	}
}
