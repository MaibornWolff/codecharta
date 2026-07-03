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
 * `mapState.write.facade` (action creators). This barrel re-exports each slice's selectors (read) and
 * reducer + `default*` (store wiring + shared read fallbacks), plus the combined `mapState` reducer,
 * `defaultMapState`, and the `mapStateSelector` root selector used by `state.manager` to register the
 * home. It re-exports NO action creator — enforced by the `state-home-read-facade-has-no-dispatch`
 * dep-cruiser rule.
 */
export * from "./store/mapState.reducer"
export * from "./store/mapState.selector"
export * from "./store/mapState.readWindow"
export * from "./store/colorMode/colorMode.reducer"
export * from "./store/colorMode/colorMode.selector"
export * from "./store/colorRange/colorRange.reducer"
export * from "./store/colorRange/colorRange.selector"
export * from "./store/margin/margin.reducer"
export * from "./store/margin/margin.selector"
export * from "./store/layoutAlgorithm/layoutAlgorithm.reducer"
export * from "./store/isLoadingMap/isLoadingMap.reducer"
export * from "./store/isLoadingMap/isLoadingMap.selector"
export * from "./store/hoveredNodeId/hoveredNodeId.reducer"
export * from "./store/hoveredNodeId/hoveredNodeId.selector"
export * from "./store/rightClickedNodeData/rightClickedNodeData.reducer"
export * from "./store/rightClickedNodeData/rightClickedNodeData.selector"
export * from "./store/selectedBuildingId/selectedBuildingId.reducer"
export * from "./store/selectedBuildingId/selectedBuildingId.selector"
export * from "./store/amountOfEdgePreviews/amountOfEdgePreviews.reducer"
export * from "./store/amountOfEdgePreviews/amountOfEdgePreviews.selector"
export * from "./store/amountOfTopLabels/amountOfTopLabels.reducer"
export * from "./store/amountOfTopLabels/amountOfTopLabels.selector"
export * from "./store/colorLabels/colorLabels.reducer"
export * from "./store/colorLabels/colorLabels.selector"
export * from "./store/edgeHeight/edgeHeight.reducer"
export * from "./store/edgeHeight/edgeHeight.selector"
export * from "./store/enableFloorLabels/enableFloorLabels.reducer"
export * from "./store/enableFloorLabels/enableFloorLabels.selector"
export * from "./store/groupLabelCollisions/groupLabelCollisions.reducer"
export * from "./store/groupLabelCollisions/groupLabelCollisions.selector"
export * from "./store/hideFlatBuildings/hideFlatBuildings.reducer"
export * from "./store/invertArea/invertArea.reducer"
export * from "./store/invertArea/invertArea.selector"
export * from "./store/invertHeight/invertHeight.reducer"
export * from "./store/invertHeight/invertHeight.selector"
export * from "./store/isEdgeMetricVisible/isEdgeMetricVisible.reducer"
export * from "./store/isEdgeMetricVisible/isEdgeMetricVisible.selector"
export * from "./store/isWhiteBackground/isWhiteBackground.reducer"
export * from "./store/labelMode/labelMode.reducer"
export * from "./store/labelMode/labelMode.selector"
export * from "./store/labelSize/labelSize.reducer"
export * from "./store/labelSize/labelSize.selector"
export * from "./store/labelsPerMap/labelsPerMap.reducer"
export * from "./store/labelsPerMap/labelsPerMap.selector"
export * from "./store/mapColors/mapColors.reducer"
export * from "./store/mapColors/mapColors.selector"
export * from "./store/scaling/scaling.reducer"
export * from "./store/scaling/scaling.selector"
export * from "./store/showEdges/incoming/showIncomingEdges.reducer"
export * from "./store/showEdges/incoming/showIncomingEdges.selector"
export * from "./store/showEdges/outgoing/showOutgoingEdges.reducer"
export * from "./store/showEdges/outgoing/showOutgoingEdges.selector"
export * from "./store/showMetricLabelNameValue/showMetricLabelNameValue.reducer"
export * from "./store/showMetricLabelNameValue/showMetricLabelNameValue.selector"
export * from "./store/showMetricLabelNodeName/showMetricLabelNodeName.reducer"
export * from "./store/showMetricLabelNodeName/showMetricLabelNodeName.selector"
export * from "./store/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.reducer"
export * from "./store/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"
export * from "./store/areaMetric/areaMetric.reducer"
export * from "./store/areaMetric/areaMetric.selector"
export * from "./store/heightMetric/heightMetric.reducer"
export * from "./store/heightMetric/heightMetric.selector"
export * from "./store/colorMetric/colorMetric.reducer"
export * from "./store/colorMetric/colorMetric.selector"
export * from "./store/distributionMetric/distributionMetric.reducer"
export * from "./store/distributionMetric/distributionMetric.selector"
export * from "./store/edgeMetric/edgeMetric.reducer"
export * from "./store/edgeMetric/edgeMetric.selector"
