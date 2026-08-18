import { createSelector, MemoizedSelector } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../model/codeCharta.model"
import { createSearchedNodesSelector, searchedNodesSelector } from "./searchedNodes.selector"

const toNodePaths = (searchedNodes: CodeMapNode[]) => new Set(searchedNodes.map(node => node.path))

export const createSearchedNodePathsSelector = (patternSelector: MemoizedSelector<CcState, string>) =>
    createSelector(createSearchedNodesSelector(patternSelector), toNodePaths)

export const searchedNodePathsSelector = createSelector(searchedNodesSelector, toNodePaths)
