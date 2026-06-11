import { createSelector } from "@ngrx/store"
import { isPartialState } from "../../model/files/files.helper"
import { visibleFileStatesSelector } from "./visibleFileStates/visibleFileStates.selector"

export const areMultipleMapsVisibleSelector = createSelector(
    visibleFileStatesSelector,
    visibleFileStates => visibleFileStates.length > 1 && isPartialState(visibleFileStates)
)
