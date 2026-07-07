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
export { setColorMode } from "./store/colorMode/colorMode.actions"
export { setColorRange } from "./store/colorRange/colorRange.actions"
export { setMargin } from "./store/margin/margin.actions"
export { setLayoutAlgorithm } from "./store/layoutAlgorithm/layoutAlgorithm.actions"
export { setIsLoadingMap } from "./store/isLoadingMap/isLoadingMap.actions"
export { setAmountOfEdgePreviews } from "./store/amountOfEdgePreviews/amountOfEdgePreviews.actions"
export { setAmountOfTopLabels } from "./store/amountOfTopLabels/amountOfTopLabels.actions"
export { setColorLabels } from "./store/colorLabels/colorLabels.actions"
export { setEdgeHeight } from "./store/edgeHeight/edgeHeight.actions"
export { setEnableFloorLabels } from "./store/enableFloorLabels/enableFloorLabels.actions"
export { setGroupLabelCollisions } from "./store/groupLabelCollisions/groupLabelCollisions.actions"
export { setHideFlatBuildings } from "./store/hideFlatBuildings/hideFlatBuildings.actions"
export { setInvertArea } from "./store/invertArea/invertArea.actions"
export { setInvertHeight } from "./store/invertHeight/invertHeight.actions"
export { setIsEdgeMetricVisible, toggleEdgeMetricVisible } from "./store/isEdgeMetricVisible/isEdgeMetricVisible.actions"
export { setIsWhiteBackground } from "./store/isWhiteBackground/isWhiteBackground.actions"
export { setLabelMode } from "./store/labelMode/labelMode.actions"
export { setLabelSize } from "./store/labelSize/labelSize.actions"
export { setLabelsPerMap } from "./store/labelsPerMap/labelsPerMap.actions"
export { invertColorRange, invertDeltaColors, setMapColors } from "./store/mapColors/mapColors.actions"
export { setScaling } from "./store/scaling/scaling.actions"
export { setShowIncomingEdges } from "./store/showEdges/incoming/showIncomingEdges.actions"
export { setShowOutgoingEdges } from "./store/showEdges/outgoing/showOutgoingEdges.actions"
export { setShowMetricLabelNameValue } from "./store/showMetricLabelNameValue/showMetricLabelNameValue.actions"
export { setShowMetricLabelNodeName } from "./store/showMetricLabelNodeName/showMetricLabelNodeName.actions"
export { setShowOnlyBuildingsWithEdges } from "./store/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
export { setAreaMetric } from "./store/areaMetric/areaMetric.actions"
export { setHeightMetric } from "./store/heightMetric/heightMetric.actions"
export { setColorMetric } from "./store/colorMetric/colorMetric.actions"
export { setDistributionMetric } from "./store/distributionMetric/distributionMetric.actions"
export { setEdgeMetric } from "./store/edgeMetric/edgeMetric.actions"
