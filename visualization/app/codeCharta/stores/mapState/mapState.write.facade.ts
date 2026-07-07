/**
 * WRITE surface of the mapState state-home (Slice 13 CQRS split) — the ONLY dispatch surface.
 *
 * This barrel re-exports the mapState action creators (map colors, labels, scaling, axis inversion,
 * edge visibility/appearance, the Slice-6 presentation stragglers, the transient interaction ids, and
 * the Slice-7 metric-selection setters). Writers (feature `stores/`, the load applier, save/rerender
 * effects) import from here; display components do not — enforced by the
 * `state-home-write-facade-is-sole-dispatch-surface` and `display-components-cannot-dispatch`
 * dep-cruiser rules. Readers use `mapState.read.facade`.
 */
export * from "./store/colorMode/colorMode.actions"
export * from "./store/colorRange/colorRange.actions"
export * from "./store/margin/margin.actions"
export * from "./store/layoutAlgorithm/layoutAlgorithm.actions"
export * from "./store/isLoadingMap/isLoadingMap.actions"
export * from "./store/amountOfEdgePreviews/amountOfEdgePreviews.actions"
export * from "./store/amountOfTopLabels/amountOfTopLabels.actions"
export * from "./store/colorLabels/colorLabels.actions"
export * from "./store/edgeHeight/edgeHeight.actions"
export * from "./store/enableFloorLabels/enableFloorLabels.actions"
export * from "./store/groupLabelCollisions/groupLabelCollisions.actions"
export * from "./store/hideFlatBuildings/hideFlatBuildings.actions"
export * from "./store/invertArea/invertArea.actions"
export * from "./store/invertHeight/invertHeight.actions"
export * from "./store/isEdgeMetricVisible/isEdgeMetricVisible.actions"
export * from "./store/isWhiteBackground/isWhiteBackground.actions"
export * from "./store/labelMode/labelMode.actions"
export * from "./store/labelSize/labelSize.actions"
export * from "./store/labelsPerMap/labelsPerMap.actions"
export * from "./store/mapColors/mapColors.actions"
export * from "./store/scaling/scaling.actions"
export * from "./store/showEdges/incoming/showIncomingEdges.actions"
export * from "./store/showEdges/outgoing/showOutgoingEdges.actions"
export * from "./store/showMetricLabelNameValue/showMetricLabelNameValue.actions"
export * from "./store/showMetricLabelNodeName/showMetricLabelNodeName.actions"
export * from "./store/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
export * from "./store/areaMetric/areaMetric.actions"
export * from "./store/heightMetric/heightMetric.actions"
export * from "./store/colorMetric/colorMetric.actions"
export * from "./store/distributionMetric/distributionMetric.actions"
export * from "./store/edgeMetric/edgeMetric.actions"
