import { CCAction } from "../../../../model/codeCharta.model"

export enum SearchPatternActions {
	SET_SEARCH_PATTERN = "SET_SEARCH_PATTERN"
}

export interface SetSearchPatternAction extends CCAction {
	type: SearchPatternActions.SET_SEARCH_PATTERN
	payload: string
}

export type SearchPatternAction = SetSearchPatternAction

export function setSearchPattern(searchPattern: string = defaultSearchPattern): SetSearchPatternAction {
	return {
		type: SearchPatternActions.SET_SEARCH_PATTERN,
		payload: searchPattern
	}
}

export const defaultSearchPattern = ""
