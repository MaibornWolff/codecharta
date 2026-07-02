import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const invertAreaSelector = createSelector(mapStateSelector, mapState => mapState.invertArea)
