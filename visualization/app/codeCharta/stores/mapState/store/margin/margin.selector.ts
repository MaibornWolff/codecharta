import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const marginSelector = createSelector(mapStateSelector, mapState => mapState.margin)
