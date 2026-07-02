import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../../mapState.selector"

export const showOutgoingEdgesSelector = createSelector(mapStateSelector, mapState => mapState.showOutgoingEdges)
