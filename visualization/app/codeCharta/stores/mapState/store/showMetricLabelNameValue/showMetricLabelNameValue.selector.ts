import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const showMetricLabelNameValueSelector = createSelector(mapStateSelector, mapState => mapState.showMetricLabelNameValue)
