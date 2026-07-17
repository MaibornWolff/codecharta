import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const blacklistSelector = createSelector(sharedViewSelector, sharedView => sharedView.blacklist)
