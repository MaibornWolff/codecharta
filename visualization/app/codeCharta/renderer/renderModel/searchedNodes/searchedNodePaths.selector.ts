import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { searchedNodesSelector } from "./searchedNodes.selector"

const toNodePaths = (searchedNodes: CodeMapNode[]) => new Set(searchedNodes.map(node => node.path))

export const searchedNodePathsSelector = createSelector(searchedNodesSelector, toNodePaths)
