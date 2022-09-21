import { AccumulatedData, accumulatedDataSelector } from "../../../selectors/accumulatedData/accumulatedData.selector"
import { createSelector } from "../../../angular-redux/createSelector"
import { getAllNodes } from "../../../../util/codeMapHelper"

export const getNumberOfFiles = (accumulatedData: Pick<AccumulatedData, "unifiedMapNode">): any => {
	return getAllNodes(accumulatedData.unifiedMapNode)
}

export const numberOfFilesSelector = createSelector([accumulatedDataSelector], getNumberOfFiles)
