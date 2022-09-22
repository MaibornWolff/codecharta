import { AccumulatedData, accumulatedDataSelector } from "./accumulatedData.selector"
import { createSelector } from "../../angular-redux/createSelector"
import { getAllNodes } from "../../../util/codeMapHelper"
import { CodeMapNode } from "../../../codeCharta.model"

export const codeMapNodesSelector = createSelector(
	[accumulatedDataSelector],
	(accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): CodeMapNode[] => {
		return getAllNodes(accumulatedData.unifiedMapNode)
	}
)
