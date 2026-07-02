import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const isLoadingMapSelector = createSelector(mapStateSelector, mapState => mapState.isLoadingMap)
