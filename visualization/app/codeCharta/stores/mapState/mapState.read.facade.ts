/**
 * READ surface of the mapState state-home (Slice 13 CQRS split) — selectors, the root selector,
 * the `default*` read fallbacks (e.g. `defaultMapColors` / `defaultAmountOfTopLabels`, read as literal
 * fallbacks by several components), and the store wiring (combined reducer + `defaultMapState`).
 *
 * mapState owns the map-view leaf settings (map colors, labels, scaling, axis inversion, hide-flat,
 * white background, edge visibility/appearance), the Slice-6 presentation stragglers (colorMode /
 * colorRange / margin / layoutAlgorithm / isLoadingMap), the transient interaction ids, and the
 * Slice-7 metric selection (area/height/color/distribution/edge).
 *
 * Slice 13c split the old single `mapState.facade` barrel into this read facade and a
 * `mapState.write.facade` (action creators). This barrel re-exports the combined `mapState` reducer +
 * `defaultMapState` and the `mapStateSelector` root selector (store wiring for `state.manager`), the
 * `MapStateReadWindow`, plus the read selectors and `default*` read fallbacks consumed through it.
 * Slice 18c made every re-export explicit (no more `export *`) and dropped the ones no consumer
 * imported via the facade — the per-slice reducers are imported directly by the combined reducer. It
 * re-exports NO action creator — enforced by the `state-home-read-facade-has-no-dispatch` dep-cruiser rule.
 */

export { amountOfEdgePreviewsSelector } from "./store/amountOfEdgePreviews/amountOfEdgePreviews.selector"
export { defaultAmountOfTopLabels } from "./store/amountOfTopLabels/amountOfTopLabels.reducer"
export { areaMetricSelector } from "./store/areaMetric/areaMetric.selector"
export { colorMetricSelector } from "./store/colorMetric/colorMetric.selector"
export { colorRangeSelector } from "./store/colorRange/colorRange.selector"
export { distributionMetric } from "./store/distributionMetric/distributionMetric.reducer"
export { edgeHeightSelector } from "./store/edgeHeight/edgeHeight.selector"
export { edgeMetricSelector } from "./store/edgeMetric/edgeMetric.selector"
export { enableFloorLabelsSelector } from "./store/enableFloorLabels/enableFloorLabels.selector"
export { heightMetricSelector } from "./store/heightMetric/heightMetric.selector"
export { invertAreaSelector } from "./store/invertArea/invertArea.selector"
export { invertHeightSelector } from "./store/invertHeight/invertHeight.selector"
export { isEdgeMetricVisibleSelector } from "./store/isEdgeMetricVisible/isEdgeMetricVisible.selector"
export { isWhiteBackgroundSelector } from "./store/isWhiteBackground/isWhiteBackground.selector"
export { labelSizeSelector } from "./store/labelSize/labelSize.selector"
export { labelsPerMapSelector } from "./store/labelsPerMap/labelsPerMap.selector"
export { defaultMapColors } from "./store/mapColors/mapColors.reducer"
export { mapColorsSelector } from "./store/mapColors/mapColors.selector"
export { MapStateReadWindow } from "./store/mapState.readWindow"
export { defaultMapState, mapState } from "./store/mapState.reducer"
export { mapStateSelector } from "./store/mapState.selector"
export { marginSelector } from "./store/margin/margin.selector"
export { scalingSelector } from "./store/scaling/scaling.selector"
export { showIncomingEdgesSelector } from "./store/showEdges/incoming/showIncomingEdges.selector"
export { showOutgoingEdgesSelector } from "./store/showEdges/outgoing/showOutgoingEdges.selector"
export { showOnlyBuildingsWithEdgesSelector } from "./store/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"
