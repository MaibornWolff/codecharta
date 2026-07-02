import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../../../mapState/mapState.facade"

export { labelSizeSelector } from "../../../mapState/mapState.facade"

export const labelModeSelector = createSelector(mapStateSelector, mapState => mapState.labelMode)

export const amountOfTopLabelsSelector = createSelector(mapStateSelector, mapState => mapState.amountOfTopLabels)

export const showMetricLabelNodeNameSelector = createSelector(mapStateSelector, mapState => mapState.showMetricLabelNodeName)

export const showMetricLabelNameValueSelector = createSelector(mapStateSelector, mapState => mapState.showMetricLabelNameValue)

export const colorLabelsSelector = createSelector(mapStateSelector, mapState => mapState.colorLabels)

export const groupLabelCollisionsSelector = createSelector(mapStateSelector, mapState => mapState.groupLabelCollisions)

export const labelsPerMapSelector = createSelector(mapStateSelector, mapState => mapState.labelsPerMap)
