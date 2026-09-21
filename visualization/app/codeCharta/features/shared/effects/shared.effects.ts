import { AddExcludedNodesIfNotResultsInEmptyMapEffect } from "./addExcludedNodesIfNotResultsInEmptyMap/addExcludedNodesIfNotResultsInEmptyMap.effect"

/** The shared feature's ngrx effects (the blacklist empty-map guard), registered by the app composition root (Slice 15d). */
export const sharedEffects = [AddExcludedNodesIfNotResultsInEmptyMapEffect]
