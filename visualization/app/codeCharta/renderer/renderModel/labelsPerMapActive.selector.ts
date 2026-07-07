import { createSelector } from "@ngrx/store"
import { labelsPerMapSelector } from "../../stores/mapState/mapState.read.facade"
import { areMultipleMapsVisibleSelector } from "../../stores/fileStore/fileStore.facade"

export const labelsPerMapActiveSelector = createSelector(
    labelsPerMapSelector,
    areMultipleMapsVisibleSelector,
    (labelsPerMap, areMultipleMapsVisible) => labelsPerMap && areMultipleMapsVisible
)
