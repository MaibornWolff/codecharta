import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const enableFloorLabelsSelector = createSelector(mapStateSelector, mapState => mapState.enableFloorLabels)
