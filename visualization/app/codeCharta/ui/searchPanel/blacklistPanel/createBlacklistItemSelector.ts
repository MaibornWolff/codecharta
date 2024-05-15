import { createSelector } from "@ngrx/store"
import { BlacklistItem, BlacklistType } from "../../../codeCharta.model"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"

export const createBlacklistItemSelector = (type: BlacklistType) =>
    createSelector(blacklistSelector, blacklist => _getFilteredAndSortedItems(type, blacklist))

export const _getFilteredAndSortedItems = (type: BlacklistType, blacklist: BlacklistItem[]) => {
    const excludedItems = blacklist.filter(item => item.type === type)
    excludedItems.sort((a, b) => a.path.localeCompare(b.path))
    return excludedItems
}
