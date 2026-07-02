import { createSelector } from "@ngrx/store"
import { BlacklistItem, BlacklistType } from "../../../codeCharta.model"
import { blacklistSelector } from "./blacklist.selector"

export const createBlacklistItemSelector = (type: BlacklistType) =>
    createSelector(blacklistSelector, blacklist => sortedBlacklistItemsByType(type, blacklist))

export const sortedBlacklistItemsByType = (type: BlacklistType, blacklist: BlacklistItem[]) => {
    const filtered = blacklist.filter(item => item.type === type)
    filtered.sort((a, b) => a.path.localeCompare(b.path))
    return filtered
}
