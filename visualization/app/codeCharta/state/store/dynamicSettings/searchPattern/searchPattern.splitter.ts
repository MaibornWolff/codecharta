import { setSearchPattern } from "./searchPattern.actions"

export function splitSearchPatternAction(payload: string) {
	return setSearchPattern(payload)
}
