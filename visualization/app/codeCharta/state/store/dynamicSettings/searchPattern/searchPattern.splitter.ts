import { SearchPatternAction, setSearchPattern } from "./searchPattern.actions"

export function splitSearchPatternAction(payload: string): SearchPatternAction {
	return setSearchPattern(payload)
}
