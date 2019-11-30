import { SearchPatternAction, SearchPatternActions } from "./searchPattern.actions"

export function searchPattern(state: string = "", action: SearchPatternAction): string {
	switch (action.type) {
		case SearchPatternActions.SET_SEARCH_PATTERN:
			return action.payload
		default:
			return state
	}
}
