import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const groupLabelCollisionsSelector = createSelector(mapStateSelector, mapState => mapState.groupLabelCollisions)
