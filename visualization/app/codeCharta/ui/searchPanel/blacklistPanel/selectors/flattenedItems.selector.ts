import { BlacklistType } from "../../../../codeCharta.model"
import { createSelector } from "../../../../state/angular-redux/createSelector"
import { blacklistSelector } from "../../../../state/store/fileSettings/blacklist/blacklist.selector"

export const flattenedItemsSelector = createSelector([blacklistSelector], blacklist => {
	const flattenedItems = blacklist.filter(item => item.type === BlacklistType.flatten)
	flattenedItems.sort((a, b) => a.path.localeCompare(b.path))
	return flattenedItems
})
