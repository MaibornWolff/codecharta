import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const showMetricLabelNodeNameSelector = createSelector(mapStateSelector, mapState => mapState.showMetricLabelNodeName)
