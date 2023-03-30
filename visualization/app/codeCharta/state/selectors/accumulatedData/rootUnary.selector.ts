import { createSelector } from "@ngrx/store"
import { accumulatedDataSelector } from "./accumulatedData.selector"

export const rootUnarySelector = createSelector(
	accumulatedDataSelector,
	accumulatedData => accumulatedData.unifiedMapNode?.attributes.unary
)
