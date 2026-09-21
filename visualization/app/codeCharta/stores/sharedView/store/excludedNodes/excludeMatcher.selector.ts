import { createSelector } from "@ngrx/store"
import { createExcludeMatcher } from "../../../../util/nodeRules/excludeMatcher"
import { excludedNodesSelector } from "./excludedNodes.selector"

export const excludeMatcherSelector = createSelector(excludedNodesSelector, createExcludeMatcher)
