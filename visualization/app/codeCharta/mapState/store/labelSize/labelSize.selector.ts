import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const labelSizeSelector = createSelector(mapStateSelector, mapState => mapState.labelSize)
