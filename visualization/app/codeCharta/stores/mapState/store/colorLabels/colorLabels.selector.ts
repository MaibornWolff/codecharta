import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const colorLabelsSelector = createSelector(mapStateSelector, mapState => mapState.colorLabels)
