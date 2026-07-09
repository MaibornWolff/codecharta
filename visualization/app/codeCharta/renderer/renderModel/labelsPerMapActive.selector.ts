import { createSelector } from "@ngrx/store"
import { areMultipleMapsVisibleSelector } from "../../stores/fileStore/fileStore.facade"
import { labelsPerMapSelector } from "../../stores/mapState/mapState.read.facade"

export const labelsPerMapActiveSelector = createSelector(
    labelsPerMapSelector,
    areMultipleMapsVisibleSelector,
    (labelsPerMap, areMultipleMapsVisible) => labelsPerMap && areMultipleMapsVisible
)
