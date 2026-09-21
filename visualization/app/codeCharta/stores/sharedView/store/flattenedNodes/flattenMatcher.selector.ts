import { createSelector } from "@ngrx/store"
import { createFlattenMatcher } from "../../../../util/nodeRules/flattenMatcher"
import { flattenedNodesSelector } from "./flattenedNodes.selector"

export const flattenMatcherSelector = createSelector(flattenedNodesSelector, createFlattenMatcher)
