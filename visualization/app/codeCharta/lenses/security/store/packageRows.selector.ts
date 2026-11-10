import { createSelector } from "@ngrx/store"
import { packageRowsOf } from "../packageRows"
import { securitySummaryOf } from "../securitySummary"
import { securitySelector } from "./security.selector"

export const packageRowsSelector = createSelector(securitySelector, security => (security ? packageRowsOf(security) : []))

export const securitySummarySelector = createSelector(securitySelector, security => (security ? securitySummaryOf(security) : null))
