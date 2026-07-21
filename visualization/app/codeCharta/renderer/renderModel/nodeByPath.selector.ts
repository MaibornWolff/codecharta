import { createSelector } from "@ngrx/store"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

/**
 * The decorated node at a given path, or undefined. Unlike `selectedNodeSelector`, which resolves the
 * GLOBAL `sharedView` selection, this takes the path as a parameter — so a view with its own selection (the
 * domain word cloud) can resolve the node it selected without routing that selection through `sharedView`.
 */
export const createNodeByPathSelector = (nodePath: string | null) =>
    createSelector(pathToNodeSelector, pathToNode => (nodePath ? pathToNode?.get(nodePath) : undefined))
