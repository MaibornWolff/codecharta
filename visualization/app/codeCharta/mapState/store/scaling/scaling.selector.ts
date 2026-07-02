import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const scalingSelector = createSelector(mapStateSelector, mapState => mapState.scaling)
