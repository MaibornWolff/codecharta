import { getNodesByGitignorePath } from "./getNodesByGitignorePath"
import { searchPatternSelector } from "../../store/dynamicSettings/searchPattern/searchPattern.selector"
import { accumulatedDataSelector } from "../accumulatedData/accumulatedData.selector"
import { createSelector } from "@ngrx/store"

export const searchedNodesSelector = createSelector(accumulatedDataSelector, searchPatternSelector, (accumulatedData, searchPattern) =>
	getNodesByGitignorePath(accumulatedData.unifiedMapNode, searchPattern)
)
