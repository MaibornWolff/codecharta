/**
 * renderModel — the cross-lens composing layer (Slice 15).
 *
 * The single public surface of the render model: it folds the structure + metrics + dependency
 * lenses and the view-state homes into the decorated tree and its derived read models
 * (accumulatedData, codeMapNodes, pathToNode, rootUnary, metricData, the derived metric selectors,
 * the node-resolving selectors and the render-availability gates). It sits ABOVE the lenses and
 * homes: it may read lens facades + home READ facades + fileStore + util + model DOWNWARD, and
 * nothing below it (lenses, fileStore, the state homes) may import it back — enforced by
 * `render-model-is-top-derived-layer`. Consumers (features, load/, effects, renderers) reach every
 * composing selector through this barrel; the internal selector modules import each other directly.
 */
export { accumulatedDataSelector } from "./accumulatedData/accumulatedData.selector"
export type { AccumulatedData } from "./accumulatedData/accumulatedData.selector"
export { codeMapNodesSelector } from "./accumulatedData/codeMapNodes.selector"
export { idToNodeSelector } from "./accumulatedData/idToNode.selector"
export { rootUnarySelector } from "./accumulatedData/rootUnary.selector"
export { metricDataSelector } from "./accumulatedData/metricData/metricData.selector"
export { selectedColorMetricDataSelector } from "./accumulatedData/metricData/selectedColorMetricData.selector"
export { areChosenMetricsAvailableSelector } from "./allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
export { amountOfBuildingsWithSelectedEdgeMetricSelector } from "./amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector"
export { edgeMetricDataSelector } from "./edgeMetricData/edgeMetricData.selector"
export { sortedNodeEdgeMetricsMapSelector } from "./edgeMetricData/sortedNodeEdgeMetricsMap.selector"
export { metricRangeSelector, nodeMetricDataSelector } from "./nodeMetricData/nodeMetricData.selector"
export { primaryMetricNamesSelector } from "./primaryMetrics/primaryMetricNames.selector"
export { searchedNodesSelector } from "./searchedNodes/searchedNodes.selector"
export { searchedNodePathsSelector } from "./searchedNodes/searchedNodePaths.selector"
export { hoveredNodeSelector } from "./hoveredNode.selector"
export { selectedNodeSelector } from "./selectedNode.selector"
export { rightClickedCodeMapNodeSelector } from "./rightClickedCodeMapNode.selector"
export { labelsPerMapActiveSelector } from "./labelsPerMapActive.selector"
