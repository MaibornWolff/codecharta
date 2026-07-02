import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const edgeHeightSelector = createSelector(mapStateSelector, mapState => mapState.edgeHeight)
