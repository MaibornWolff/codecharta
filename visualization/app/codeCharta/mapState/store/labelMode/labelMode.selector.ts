import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const labelModeSelector = createSelector(mapStateSelector, mapState => mapState.labelMode)
