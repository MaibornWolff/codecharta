import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"

/** The shared feature's ngrx effects (the blacklist empty-map guard), registered by the app composition root (Slice 15d). */
export const sharedEffects = [AddBlacklistItemsIfNotResultsInEmptyMapEffect]
