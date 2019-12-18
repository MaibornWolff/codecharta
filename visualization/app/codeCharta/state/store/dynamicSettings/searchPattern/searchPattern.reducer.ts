import { SearchPatternAction, SearchPatternActions, setSearchPattern } from "./searchPattern.actions"

export function searchPattern(state: string = setSearchPattern().payload, action: SearchPatternAction): string {
	switch (action.type) {
		case SearchPatternActions.SET_SEARCH_PATTERN:
			return action.payload
		default:
			return state
	}
}
