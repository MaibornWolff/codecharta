import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const layoutAlgorithmSelector = createSelector(mapStateSelector, mapState => mapState.layoutAlgorithm)
