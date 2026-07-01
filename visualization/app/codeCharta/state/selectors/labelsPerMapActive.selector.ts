import { createSelector } from "@ngrx/store"
import { labelsPerMapSelector } from "../../appearance/appearance.facade"
import { areMultipleMapsVisibleSelector } from "./areMultipleMapsVisible.selector"

export const labelsPerMapActiveSelector = createSelector(
    labelsPerMapSelector,
    areMultipleMapsVisibleSelector,
    (labelsPerMap, areMultipleMapsVisible) => labelsPerMap && areMultipleMapsVisible
)
