import { BlacklistType } from "../../../../codeCharta.model"
import { createSelector } from "../../../../state/angular-redux/createSelector"
import { searchPatternSelector } from "../../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { blacklistSelector } from "../../../../state/store/fileSettings/blacklist/blacklist.selector"
import { isPatternBlacklisted } from "../utils/isPatternBlacklisted"
import { isSearchPatternEmptySelector } from "./isSearchPatternEmpty.selector"

export const isFlattenPatternDisabledSelector = createSelector(
	[searchPatternSelector, isSearchPatternEmptySelector, blacklistSelector],
	(searchPattern, isSearchPatternEmpty, blacklist) => {
		if (isSearchPatternEmpty) {
			return true
		}
		return isPatternBlacklisted(blacklist, BlacklistType.flatten, searchPattern)
	}
)
