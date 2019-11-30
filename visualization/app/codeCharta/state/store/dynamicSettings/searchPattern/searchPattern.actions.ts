import { Action } from "redux"

export enum SearchPatternActions {
	SET_SEARCH_PATTERN = "SET_SEARCH_PATTERN"
}

export interface SetSearchPatternAction extends Action {
	type: SearchPatternActions.SET_SEARCH_PATTERN
	payload: string
}

export type SearchPatternAction = SetSearchPatternAction

export function setSearchPattern(searchPattern: string): SearchPatternAction {
	return {
		type: SearchPatternActions.SET_SEARCH_PATTERN,
		payload: searchPattern
	}
}
