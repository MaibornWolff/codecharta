import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const showOnlyBuildingsWithEdgesSelector = createSelector(mapStateSelector, mapState => mapState.showOnlyBuildingsWithEdges)
