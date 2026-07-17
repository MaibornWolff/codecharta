import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../../mapState.selector"

export const showIncomingEdgesSelector = createSelector(mapStateSelector, mapState => mapState.showIncomingEdges)
