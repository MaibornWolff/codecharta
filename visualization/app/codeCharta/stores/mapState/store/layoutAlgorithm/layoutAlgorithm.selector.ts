import { createSelector } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { mapStateSelector } from "../mapState.selector"

export const layoutAlgorithmSelector = createSelector(mapStateSelector, mapState => mapState.layoutAlgorithm)

export const isSunburstLayoutSelector = createSelector(
    layoutAlgorithmSelector,
    layoutAlgorithm => layoutAlgorithm === LayoutAlgorithm.Sunburst
)

export const isThreeDimensionalLayoutSelector = createSelector(isSunburstLayoutSelector, isSunburst => !isSunburst)
