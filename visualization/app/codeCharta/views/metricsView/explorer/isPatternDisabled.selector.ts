import { createSelector, MemoizedSelector } from "@ngrx/store"
import { CcState, NodeRule } from "../../../model/codeCharta.model"
import { excludedNodesSelector, flattenedNodesSelector, searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isPatternInRules } from "../../../util/nodeRules/isPatternInRules"
import { isSearchPatternEmptySelector } from "./isSearchPatternEmpty.selector"

const createIsPatternDisabledSelector = (nodeRulesSelector: MemoizedSelector<CcState, NodeRule[]>) =>
    createSelector(
        searchPatternSelector,
        isSearchPatternEmptySelector,
        nodeRulesSelector,
        (searchPattern, isSearchPatternEmpty, nodeRules) => isSearchPatternEmpty || isPatternInRules(nodeRules, searchPattern)
    )

export const isFlattenPatternDisabledSelector = createIsPatternDisabledSelector(flattenedNodesSelector)

export const isExcludePatternDisabledSelector = createIsPatternDisabledSelector(excludedNodesSelector)
