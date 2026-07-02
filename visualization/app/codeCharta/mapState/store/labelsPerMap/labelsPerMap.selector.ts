import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const labelsPerMapSelector = createSelector(mapStateSelector, mapState => mapState.labelsPerMap)
