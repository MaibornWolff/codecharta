import { createSelector } from "@ngrx/store"
import { createBlacklistMatcher } from "../../../../util/blacklist/blacklistMatcher"
import { blacklistSelector } from "./blacklist.selector"

export const blacklistMatcherSelector = createSelector(blacklistSelector, createBlacklistMatcher)
