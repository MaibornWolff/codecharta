import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const hoveredNodeIdSelector = createSelector(mapStateSelector, mapState => mapState.hoveredNodeId)
