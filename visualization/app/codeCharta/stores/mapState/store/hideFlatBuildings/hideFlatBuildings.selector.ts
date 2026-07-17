import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const hideFlatBuildingsSelector = createSelector(mapStateSelector, mapState => mapState.hideFlatBuildings)
