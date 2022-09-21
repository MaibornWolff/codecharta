import { AccumulatedData, accumulatedDataSelector } from "../../../selectors/accumulatedData/accumulatedData.selector"
import { createSelector } from "../../../angular-redux/createSelector"
import { getAllNodes } from "../../../../util/codeMapHelper"
import { CodeMapNode } from "../../../../codeCharta.model"

export const getCodeMapNodes = (accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): CodeMapNode[] => {
	return getAllNodes(accumulatedData.unifiedMapNode)
}

export const codeMapNodesSelector = createSelector([accumulatedDataSelector], getCodeMapNodes)
