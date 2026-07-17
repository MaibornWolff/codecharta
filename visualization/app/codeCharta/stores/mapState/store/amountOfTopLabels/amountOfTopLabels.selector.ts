import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const amountOfTopLabelsSelector = createSelector(mapStateSelector, mapState => mapState.amountOfTopLabels)
