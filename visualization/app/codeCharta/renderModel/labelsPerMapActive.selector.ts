import { createSelector } from "@ngrx/store"
import { labelsPerMapSelector } from "../mapState/mapState.read.facade"
import { areMultipleMapsVisibleSelector } from "../fileStore/store/areMultipleMapsVisible.selector"

export const labelsPerMapActiveSelector = createSelector(
    labelsPerMapSelector,
    areMultipleMapsVisibleSelector,
    (labelsPerMap, areMultipleMapsVisible) => labelsPerMap && areMultipleMapsVisible
)
