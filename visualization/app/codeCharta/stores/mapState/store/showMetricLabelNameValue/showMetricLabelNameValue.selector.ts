import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const showMetricLabelNodeValueSelector = createSelector(mapStateSelector, mapState => mapState.showMetricLabelNameValue)
