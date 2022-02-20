import { createSelector } from "../../../../state/angular-redux/createSelector"
import { searchPatternSelector } from "../../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"

export const isSearchPatternEmptySelector = createSelector(
	[searchPatternSelector],
	searchPattern => searchPattern === "" || searchPattern === "!" || searchPattern === ","
)
