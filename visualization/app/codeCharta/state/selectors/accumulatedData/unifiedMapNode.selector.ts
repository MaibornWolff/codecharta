import { createSelector } from "../../angular-redux/store"
import { accumulatedDataSelector } from "./accumulatedData.selector"

export const unifiedMapNodeSelector = createSelector([accumulatedDataSelector], accumulatedData => accumulatedData.unifiedMapNode)
