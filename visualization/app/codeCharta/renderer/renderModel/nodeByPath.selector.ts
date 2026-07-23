import { createSelector } from "@ngrx/store"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

export const createNodeByPathSelector = (nodePath: string | null) =>
    createSelector(pathToNodeSelector, pathToNode => (nodePath ? pathToNode?.get(nodePath) : undefined))
