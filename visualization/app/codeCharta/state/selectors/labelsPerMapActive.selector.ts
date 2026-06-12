import { createSelector } from "@ngrx/store"
import { labelsPerMapSelector } from "../store/appSettings/labelsPerMap/labelsPerMap.selector"
import { areMultipleMapsVisibleSelector } from "./areMultipleMapsVisible.selector"

export const labelsPerMapActiveSelector = createSelector(
    labelsPerMapSelector,
    areMultipleMapsVisibleSelector,
    (labelsPerMap, areMultipleMapsVisible) => labelsPerMap && areMultipleMapsVisible
)
