import { BlacklistType } from "../../../../codeCharta.model"
import { createSelector } from "../../../../state/angular-redux/createSelector"
import { blacklistSelector } from "../../../../state/store/fileSettings/blacklist/blacklist.selector"

export const excludedItemsSelector = createSelector([blacklistSelector], blacklist => {
	const excludedItems = blacklist.filter(item => item.type === BlacklistType.exclude)
	excludedItems.sort((a, b) => a.path.localeCompare(b.path))
	return excludedItems
})
