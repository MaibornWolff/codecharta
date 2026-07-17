import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const colorModeSelector = createSelector(mapStateSelector, mapState => mapState.colorMode)
