import { createSelector } from "@ngrx/store"
import { createBlacklistMatcher } from "../../../../util/codeMapHelper"
import { blacklistSelector } from "./blacklist.selector"

export const blacklistMatcherSelector = createSelector(blacklistSelector, createBlacklistMatcher)
