import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const isWhiteBackgroundSelector = createSelector(mapStateSelector, mapState => mapState.isWhiteBackground)
