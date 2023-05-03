import { createSelector } from "@ngrx/store"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"

export const hideBlacklistItemsIndicatorSelector = createSelector(blacklistSelector, blacklist => blacklist.length === 0)
