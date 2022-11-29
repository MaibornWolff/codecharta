import { createSelector } from "../../angular-redux/createSelector"
import { accumulatedDataSelector } from "./accumulatedData.selector"

export const rootUnarySelector = createSelector(
	[accumulatedDataSelector],
	accumulatedData => accumulatedData.unifiedMapNode?.attributes.unary
)
